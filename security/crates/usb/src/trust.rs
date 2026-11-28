use std::fmt::Write;

use crate::usb::Function;

const FIELDS: usize = 6;
const USB: &str = "usb";
const THUNDERBOLT: &str = "thunderbolt";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Bus {
    Usb,
    Thunderbolt,
}

impl Bus {
    pub(crate) fn name(self) -> &'static str {
        match self {
            Self::Usb => USB,
            Self::Thunderbolt => THUNDERBOLT,
        }
    }

    pub(crate) fn named(name: &str) -> Option<Self> {
        match name {
            USB => Some(Self::Usb),
            THUNDERBOLT => Some(Self::Thunderbolt),
            _ => None,
        }
    }
}

/// What a device says it is. Anyone can make a device that says the same,
/// so it only counts together with the port it was trusted on.
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Identity {
    pub bus: Bus,
    pub vendor: u16,
    pub product: u16,
    pub serial: String,
    pub functions: Vec<Function>,
}

impl Identity {
    pub fn new(
        bus: Bus,
        vendor: u16,
        product: u16,
        serial: &str,
        functions: impl IntoIterator<Item = Function>,
    ) -> Self {
        let mut functions: Vec<Function> = functions.into_iter().collect();
        functions.sort();
        functions.dedup();
        Self {
            bus,
            vendor,
            product,
            serial: plain(serial),
            functions,
        }
    }
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Known {
    pub identity: Identity,
    pub port: String,
    pub name: String,
}

impl Known {
    pub fn new(identity: Identity, port: &str, name: &str) -> Self {
        Self {
            identity,
            port: plain(port),
            name: plain(name),
        }
    }

    /// What names this device among the trusted ones, for forgetting it.
    pub fn key(&self) -> String {
        let identity = &self.identity;
        let mut key = format!(
            "{}\t{}\t{:04x}:{:04x}\t{}\t",
            identity.bus.name(),
            self.port,
            identity.vendor,
            identity.product,
            identity.serial
        );
        for (index, function) in identity.functions.iter().enumerate() {
            let separator = if index == 0 { "" } else { "," };
            let _ = write!(
                key,
                "{separator}{:02x}{:02x}{:02x}",
                function.class, function.subclass, function.protocol
            );
        }
        key
    }

    fn line(&self) -> String {
        format!("{}\t{}\n", self.key(), self.name)
    }

    fn parse(line: &str) -> Option<Self> {
        let fields: Vec<&str> = line.split('\t').collect();
        let [bus, port, ids, serial, functions, name] = <[&str; FIELDS]>::try_from(fields).ok()?;
        let (vendor, product) = ids.split_once(':')?;
        let functions = functions
            .split(',')
            .filter(|function| !function.is_empty())
            .map(function)
            .collect::<Option<Vec<_>>>()?;
        Some(Self {
            identity: Identity::new(
                Bus::named(bus)?,
                u16::from_str_radix(vendor, 16).ok()?,
                u16::from_str_radix(product, 16).ok()?,
                serial,
                functions,
            ),
            port: port.to_owned(),
            name: name.to_owned(),
        })
    }
}

pub(crate) fn function(text: &str) -> Option<Function> {
    if text.len() != 6 {
        return None;
    }
    let byte = |at: usize| u8::from_str_radix(text.get(at..at + 2)?, 16).ok();
    Some(Function {
        class: byte(0)?,
        subclass: byte(2)?,
        protocol: byte(4)?,
    })
}

pub(crate) fn plain(text: &str) -> String {
    text.chars()
        .map(|character| {
            if character.is_control() {
                ' '
            } else {
                character
            }
        })
        .collect()
}

/// The devices someone trusted, each on the port it was trusted on.
#[derive(Clone, Default, PartialEq, Eq, Debug)]
pub struct Trusted(Vec<Known>);

impl Trusted {
    pub fn parse(text: &str) -> Self {
        Self(text.lines().filter_map(Known::parse).collect())
    }

    pub fn render(&self) -> String {
        self.0.iter().map(Known::line).collect()
    }

    pub fn knows(&self, identity: &Identity, port: &str) -> bool {
        self.0
            .iter()
            .any(|known| known.port == port && known.identity == *identity)
    }

    pub fn add(&mut self, known: Known) -> bool {
        let new = !self.knows(&known.identity, &known.port);
        if new {
            self.0.push(known);
        }
        new
    }

    pub fn forget(&mut self, key: &str) -> bool {
        let before = self.0.len();
        self.0.retain(|known| known.key() != key);
        self.0.len() != before
    }

    pub fn devices(&self) -> &[Known] {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const KEYBOARD: Function = Function {
        class: 0x03,
        subclass: 0x01,
        protocol: 0x01,
    };
    const STICK: Function = Function {
        class: 0x08,
        subclass: 0x06,
        protocol: 0x50,
    };
    const FRONT: &str = "pci0000:00/0000:00:14.0/2";
    const BACK: &str = "pci0000:00/0000:00:14.0/5";

    fn keyboard() -> Identity {
        Identity::new(Bus::Usb, 0x046d, 0xc31c, "A1B2", [KEYBOARD])
    }

    fn trusted() -> Trusted {
        let mut trusted = Trusted::default();
        trusted.add(Known::new(keyboard(), FRONT, "Logitech Keyboard"));
        trusted
    }

    #[test]
    fn the_same_device_on_another_port_isnt_trusted() {
        let trusted = trusted();
        assert!(trusted.knows(&keyboard(), FRONT));
        assert!(!trusted.knows(&keyboard(), BACK));
    }

    #[test]
    fn a_device_that_copies_the_ids_but_adds_a_drive_isnt_trusted() {
        let trusted = trusted();
        let lookalike = Identity::new(Bus::Usb, 0x046d, 0xc31c, "A1B2", [KEYBOARD, STICK]);
        assert!(!trusted.knows(&lookalike, FRONT));
        let other_serial = Identity::new(Bus::Usb, 0x046d, 0xc31c, "A1B3", [KEYBOARD]);
        assert!(!trusted.knows(&other_serial, FRONT));
        let thunderbolt = Identity::new(Bus::Thunderbolt, 0x046d, 0xc31c, "A1B2", [KEYBOARD]);
        assert!(!trusted.knows(&thunderbolt, FRONT));
    }

    #[test]
    fn the_order_parts_are_listed_in_doesnt_matter() {
        let one = Identity::new(Bus::Usb, 1, 2, "", [STICK, KEYBOARD, STICK]);
        let other = Identity::new(Bus::Usb, 1, 2, "", [KEYBOARD, STICK]);
        assert_eq!(one, other);
    }

    #[test]
    fn survives_being_saved_and_read_back() {
        let mut trusted = trusted();
        trusted.add(Known::new(
            Identity::new(
                Bus::Thunderbolt,
                0x8086,
                0x1234,
                "d5ff0000-0080-8708-2300-e8e0d1e21021",
                [],
            ),
            "pci0000:00/0000:00:0d.2/domain0/0-0/0-1",
            "Dock\twith\na tab",
        ));
        let read = Trusted::parse(&trusted.render());
        assert_eq!(read, trusted);
        assert_eq!(read.devices()[1].name, "Dock with a tab");
    }

    #[test]
    fn a_serial_with_line_breaks_cant_add_devices_of_its_own() {
        let mut trusted = Trusted::default();
        let sneaky = Identity::new(
            Bus::Usb,
            1,
            2,
            &format!("x\n{}", Known::new(keyboard(), BACK, "Keyboard").line()),
            [STICK],
        );
        trusted.add(Known::new(sneaky, FRONT, "Stick"));
        let read = Trusted::parse(&trusted.render());
        assert_eq!(read.devices().len(), 1);
        assert!(!read.knows(&keyboard(), BACK));
    }

    #[test]
    fn skips_lines_it_cant_read() {
        let text = format!(
            "usb\tsomewhere\tzzzz:0001\t\t\tBroken\n{}",
            trusted().render()
        );
        assert_eq!(Trusted::parse(&text), trusted());
    }

    #[test]
    fn forgets_only_the_device_asked_for() {
        let mut trusted = trusted();
        trusted.add(Known::new(keyboard(), BACK, "Logitech Keyboard"));
        let back = trusted.devices()[1].key();
        assert!(!trusted.add(Known::new(keyboard(), BACK, "Again")));
        assert!(trusted.forget(&back));
        assert!(!trusted.forget(&back));
        assert!(trusted.knows(&keyboard(), FRONT));
        assert!(!trusted.knows(&keyboard(), BACK));
    }
}
