use luft_keyring_wire::Secret;

use crate::card::{self, random};
use crate::fido::{self, Device};
use crate::store::{SecurityKey, SmartCard};
use crate::usb;

use super::Error;

pub struct Enrolled<T> {
    pub record: T,
    pub secret: Option<Secret>,
}

fn new_id() -> String {
    random::<12>()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

/// The one security key plugged in that can sign in to Luft.
pub fn plugged_key() -> Result<(Device, fido::Plugged), Error> {
    for plugged in fido::plugged().map_err(fido_failed)? {
        let Ok(device) = Device::open(&plugged.path) else {
            continue;
        };
        if device.can_sign_in() {
            return Ok((device, plugged));
        }
    }
    Err(Error::NoKey)
}

fn fido_failed(error: fido::Error) -> Error {
    match error {
        fido::Error::WrongPin => Error::WrongPin,
        fido::Error::PinBlocked => Error::Blocked,
        fido::Error::PinTooSimple => Error::PinTooSimple,
        fido::Error::TimedOut => Error::TimedOut,
        fido::Error::NoCredential => Error::NoKey,
        fido::Error::Failed(reason) => Error::Failed(reason),
    }
}

/// Makes a credential on the key, after its PIN and a touch, then asks it
/// once more for the secret that unlocks the keyring. A key without a PIN
/// gets `pin` as its first one.
pub fn security_key(
    user: &str,
    pin: &str,
    known: &[SecurityKey],
    touch: impl Fn(u32),
) -> Result<Enrolled<SecurityKey>, Error> {
    let (device, plugged) = plugged_key()?;
    if known
        .iter()
        .any(|key| device.holds(&key.credential).unwrap_or(false))
    {
        return Err(Error::AlreadyEnrolled);
    }
    let own_check = device.verifies_by_itself() && !device.has_pin();
    if !own_check && !device.has_pin() {
        device.set_pin(pin).map_err(fido_failed)?;
    }
    let pin = (!own_check).then_some(pin);
    touch(1);
    let credential = device
        .make_credential(&random::<16>(), user, &random::<32>(), pin)
        .map_err(fido_failed)?;
    let salt = random::<32>();
    touch(2);
    let assertion = device
        .assert(&credential, &random::<32>(), &salt, pin)
        .map_err(fido_failed)?;
    if !assertion.verified {
        return Err(Error::Failed("the key's answer didn't check out".into()));
    }
    Ok(Enrolled {
        record: SecurityKey {
            id: new_id(),
            name: plugged.name,
            credential: credential.id,
            public_key: credential.public_key,
            eddsa: credential.algorithm == fido::Algorithm::EdDsa,
            salt: salt.to_vec(),
            device: usb::security_key(&plugged.path),
        },
        secret: assertion.secret.map(Secret::new),
    })
}

fn card_failed(error: card::Error) -> Error {
    match error {
        card::Error::WrongPin => Error::WrongPin,
        card::Error::Blocked => Error::Blocked,
        card::Error::Failed(reason) => Error::Failed(reason),
    }
}

/// Enrolls the first certificate on the card in a reader whose key proves
/// itself after `pin`, with a wrap for the keyring when the key allows one.
pub fn smart_card(pin: &str, known: &[SmartCard]) -> Result<Enrolled<SmartCard>, Error> {
    let inserted = card::inserted().map_err(card_failed)?;
    if inserted.is_empty() {
        return Err(Error::NoCard);
    }
    if inserted.iter().any(|found| {
        known
            .iter()
            .any(|card| card.certificate == found.certificate)
    }) {
        return Err(Error::AlreadyEnrolled);
    }
    let mut last = Error::NoCard;
    for found in inserted {
        let wrapped = match card::new_wrap(&found, pin) {
            Ok(wrapped) => wrapped,
            Err(card::Error::WrongPin) => return Err(Error::WrongPin),
            Err(card::Error::Blocked) => return Err(Error::Blocked),
            Err(error) => {
                last = card_failed(error);
                continue;
            }
        };
        if wrapped.is_none()
            && let Err(error) = card::prove(&found, pin, None)
        {
            last = card_failed(error);
            continue;
        }
        let (wrap, secret) = wrapped.map_or((None, None), |wrapped| {
            (Some(wrapped.wrap), Some(wrapped.secret))
        });
        let reader = usb::card_reader(&found.reader);
        if reader.is_none() {
            eprintln!(
                "Couldn't tell which USB device “{}” is, so it waits while locked like other devices",
                found.reader
            );
        }
        return Ok(Enrolled {
            record: SmartCard {
                id: new_id(),
                name: found.label.clone(),
                reader,
                certificate: found.certificate,
                wrap,
            },
            secret: secret.map(|secret| Secret::new(secret.to_vec())),
        });
    }
    Err(last)
}
