use std::fmt::Write;

use crate::trust::{self, Bus, Identity};
use crate::usb::Function;

const HID: u8 = 0x03;
const SMART_CARD: u8 = 0x0b;
const SECURITY_KEY: &str = "security-key";
const CARD_READER: &str = "card-reader";

/// What of an enrolled device signs in: the FIDO part of a security key,
/// which is a HID part outside the boot protocol, or a card reader's
/// smart card part.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Part {
    SecurityKey,
    CardReader,
}

impl Part {
    fn name(self) -> &'static str {
        match self {
            Self::SecurityKey => SECURITY_KEY,
            Self::CardReader => CARD_READER,
        }
    }

    fn named(name: &str) -> Option<Self> {
        match name {
            SECURITY_KEY => Some(Self::SecurityKey),
            CARD_READER => Some(Self::CardReader),
            _ => None,
        }
    }

    pub fn signs_in_with(self, function: Function) -> bool {
        match self {
            Self::SecurityKey => {
                function.class == HID && function.subclass == 0 && function.protocol == 0
            }
            Self::CardReader => function.class == SMART_CARD,
        }
    }
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Enrolled {
    pub identity: Identity,
    pub part: Part,
}

impl Enrolled {
    pub fn line(&self) -> String {
        let identity = &self.identity;
        let mut line = format!(
            "{}\t{:04x}:{:04x}\t{}\t",
            identity.bus.name(),
            identity.vendor,
            identity.product,
            identity.serial
        );
        for (index, function) in identity.functions.iter().enumerate() {
            let separator = if index == 0 { "" } else { "," };
            let _ = write!(
                line,
                "{separator}{:02x}{:02x}{:02x}",
                function.class, function.subclass, function.protocol
            );
        }
        line.push('\t');
        line.push_str(self.part.name());
        line.push('\n');
        line
    }

    pub fn parse(line: &str) -> Option<Self> {
        let [bus, ids, serial, functions, part] =
            <[&str; 5]>::try_from(line.split('\t').collect::<Vec<_>>()).ok()?;
        let (vendor, product) = ids.split_once(':')?;
        let functions = functions
            .split(',')
            .filter(|function| !function.is_empty())
            .map(trust::function)
            .collect::<Option<Vec<_>>>()?;
        Some(Self {
            identity: Identity::new(
                Bus::named(bus)?,
                u16::from_str_radix(vendor, 16).ok()?,
                u16::from_str_radix(product, 16).ok()?,
                serial,
                functions,
            ),
            part: Part::named(part)?,
        })
    }
}

/// The security keys and card readers someone signs in with. They connect
/// while the computer is locked, on any port, but only when they say exactly
/// what they said when they were enrolled, and only with the part that signs
/// in. Luft's sign-in service writes this list; nobody else does.
#[derive(Clone, Default, PartialEq, Eq, Debug)]
pub struct SignInDevices(Vec<Enrolled>);

impl SignInDevices {
    pub fn parse(text: &str) -> Self {
        Self(text.lines().filter_map(Enrolled::parse).collect())
    }

    pub fn render(&self) -> String {
        self.0.iter().map(Enrolled::line).collect()
    }

    pub fn add(&mut self, enrolled: Enrolled) {
        if !self.0.contains(&enrolled) {
            self.0.push(enrolled);
        }
    }

    pub fn signs_in(&self, identity: &Identity) -> bool {
        self.0.iter().any(|enrolled| enrolled.identity == *identity)
    }

    pub fn signs_in_with(&self, identity: &Identity, function: Function) -> bool {
        self.0
            .iter()
            .any(|enrolled| enrolled.identity == *identity && enrolled.part.signs_in_with(function))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const OTP: Function = Function {
        class: 0x03,
        subclass: 0x01,
        protocol: 0x01,
    };
    const FIDO: Function = Function {
        class: 0x03,
        subclass: 0x00,
        protocol: 0x00,
    };
    const CCID: Function = Function {
        class: 0x0b,
        subclass: 0x00,
        protocol: 0x00,
    };
    const STICK: Function = Function {
        class: 0x08,
        subclass: 0x06,
        protocol: 0x50,
    };

    fn yubikey(functions: &[Function]) -> Identity {
        Identity::new(Bus::Usb, 0x1050, 0x0407, "", functions.iter().copied())
    }

    fn enrolled() -> SignInDevices {
        let mut devices = SignInDevices::default();
        devices.add(Enrolled {
            identity: yubikey(&[OTP, FIDO, CCID]),
            part: Part::SecurityKey,
        });
        devices
    }

    #[test]
    fn an_enrolled_key_signs_in_with_its_fido_part_alone() {
        let devices = enrolled();
        let key = yubikey(&[OTP, FIDO, CCID]);
        assert!(devices.signs_in(&key));
        assert!(devices.signs_in_with(&key, FIDO));
        assert!(!devices.signs_in_with(&key, CCID));
        assert!(!devices.signs_in_with(&key, OTP));
    }

    #[test]
    fn a_lookalike_with_a_drive_or_another_serial_doesnt_sign_in() {
        let devices = enrolled();
        let with_drive = yubikey(&[OTP, FIDO, CCID, STICK]);
        assert!(!devices.signs_in(&with_drive));
        assert!(!devices.signs_in_with(&with_drive, FIDO));
        let other = Identity::new(Bus::Usb, 0x1050, 0x0407, "123", [OTP, FIDO, CCID]);
        assert!(!devices.signs_in_with(&other, FIDO));
    }

    #[test]
    fn a_reader_signs_in_with_its_smart_card_part() {
        let mut devices = SignInDevices::default();
        let reader = Identity::new(Bus::Usb, 0x08e6, 0x4433, "1", [CCID]);
        devices.add(Enrolled {
            identity: reader.clone(),
            part: Part::CardReader,
        });
        assert!(devices.signs_in_with(&reader, CCID));
        assert!(!devices.signs_in_with(&reader, FIDO));
    }

    #[test]
    fn nothing_signs_in_when_nobody_enrolled_anything() {
        let devices = SignInDevices::parse("");
        assert!(!devices.signs_in(&yubikey(&[OTP, FIDO, CCID])));
    }

    #[test]
    fn survives_being_saved_and_read_back() {
        let mut devices = enrolled();
        devices.add(Enrolled {
            identity: Identity::new(Bus::Usb, 0x08e6, 0x4433, "x\ty", [CCID]),
            part: Part::CardReader,
        });
        assert_eq!(SignInDevices::parse(&devices.render()), devices);
        assert_eq!(
            SignInDevices::parse("usb\tzz:1\t\t\tsecurity-key\n"),
            SignInDevices::default()
        );
    }
}
