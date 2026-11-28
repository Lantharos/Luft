use std::sync::OnceLock;

use cryptoki::context::{CInitializeArgs, CInitializeFlags, Pkcs11};
use cryptoki::error::{Error as Pkcs11Error, RvError};
use cryptoki::mechanism::Mechanism;
use cryptoki::mechanism::elliptic_curve::{EcKdf, Ecdh1DeriveParams};
use cryptoki::object::{Attribute, AttributeType, KeyType, ObjectClass, ObjectHandle};
use cryptoki::session::{Session, UserType};
use cryptoki::slot::Slot;
use cryptoki::types::AuthPin;
use sha2::{Digest, Sha256};
use zeroize::Zeroizing;

use super::crypto::{self, PublicKey};
use crate::store::CardWrap;

const MODULES: &str = "/usr/lib64/p11-kit-proxy.so";

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    WrongPin,
    Blocked,
    Failed(String),
}

impl From<Pkcs11Error> for Error {
    fn from(error: Pkcs11Error) -> Self {
        match error {
            Pkcs11Error::Pkcs11(RvError::PinIncorrect | RvError::PinLenRange, _) => Self::WrongPin,
            Pkcs11Error::Pkcs11(RvError::PinLocked, _) => Self::Blocked,
            error => Self::Failed(error.to_string()),
        }
    }
}

fn modules() -> Result<&'static Pkcs11, Error> {
    static MODULE: OnceLock<Result<Pkcs11, String>> = OnceLock::new();
    MODULE
        .get_or_init(|| {
            let module = Pkcs11::new(MODULES).map_err(|error| error.to_string())?;
            module
                .initialize(CInitializeArgs::new(CInitializeFlags::OS_LOCKING_OK))
                .map_err(|error| error.to_string())?;
            Ok(module)
        })
        .as_ref()
        .map_err(|error| Error::Failed(error.clone()))
}

/// A certificate on a card in a reader, with the key it belongs to.
#[derive(Debug, Clone)]
pub struct Found {
    slot: Slot,
    pub reader: String,
    pub label: String,
    pub certificate: Vec<u8>,
    key_id: Vec<u8>,
}

/// Every certificate on the cards in the readers now. Only removable slots
/// count, which leaves out the system's trusted certificates.
pub fn inserted() -> Result<Vec<Found>, Error> {
    let module = modules()?;
    let mut found = Vec::new();
    for slot in module.get_slots_with_token()? {
        let Ok(info) = module.get_slot_info(slot) else {
            continue;
        };
        if !info.removable_device() {
            continue;
        }
        let label = module
            .get_token_info(slot)
            .map(|token| token.label().trim().to_owned())
            .unwrap_or_default();
        let Ok(session) = module.open_ro_session(slot) else {
            continue;
        };
        for object in session.find_objects(&[Attribute::Class(ObjectClass::CERTIFICATE)])? {
            let attributes =
                session.get_attributes(object, &[AttributeType::Value, AttributeType::Id])?;
            let mut certificate = None;
            let mut key_id = None;
            for attribute in attributes {
                match attribute {
                    Attribute::Value(value) => certificate = Some(value),
                    Attribute::Id(id) => key_id = Some(id),
                    _ => {}
                }
            }
            if let (Some(certificate), Some(key_id)) = (certificate, key_id)
                && PublicKey::of_certificate(&certificate).is_some()
            {
                found.push(Found {
                    slot,
                    reader: info.slot_description().trim_end().to_owned(),
                    label: label.clone(),
                    certificate,
                    key_id,
                });
            }
        }
    }
    Ok(found)
}

/// Proves the card holds the key of its certificate: after its PIN, it signs
/// a fresh challenge, checked here against the certificate. Then it opens
/// `wrap`, when there is one, into the secret that unlocks the keyring.
pub fn prove(
    found: &Found,
    pin: &str,
    wrap: Option<&CardWrap>,
) -> Result<Option<Zeroizing<Vec<u8>>>, Error> {
    let public = PublicKey::of_certificate(&found.certificate)
        .ok_or_else(|| Error::Failed("unreadable certificate".into()))?;
    let session = modules()?.open_ro_session(found.slot)?;
    session.login(UserType::User, Some(&AuthPin::from(pin.to_owned())))?;
    let key = private_key(&session, &found.key_id)?;
    let challenge = crypto::random::<32>();
    let signature = if public.is_rsa() {
        session.sign(&Mechanism::Sha256RsaPkcs, key, &challenge)?
    } else {
        session.sign(&Mechanism::Ecdsa, key, &Sha256::digest(challenge))?
    };
    if !public.verifies(&challenge, &signature) {
        return Err(Error::Failed(
            "the card's signature doesn't match its certificate".into(),
        ));
    }
    Ok(wrap.and_then(|wrap| open(&session, key, &public, wrap)))
}

pub struct Wrapped {
    pub wrap: CardWrap,
    pub secret: Zeroizing<Vec<u8>>,
}

/// A wrap only this card opens, and its secret, when the card's key may
/// decrypt or agree on keys.
pub fn new_wrap(found: &Found, pin: &str) -> Result<Option<Wrapped>, Error> {
    let public = PublicKey::of_certificate(&found.certificate)
        .ok_or_else(|| Error::Failed("unreadable certificate".into()))?;
    let Some(sealed) = crypto::seal_for(&public) else {
        return Ok(None);
    };
    let wrap = if public.is_rsa() {
        CardWrap::Rsa(sealed.for_card)
    } else {
        CardWrap::Ecdh(sealed.for_card)
    };
    let opened = prove(found, pin, Some(&wrap))?;
    Ok(opened
        .filter(|secret| *secret == sealed.secret)
        .map(|secret| Wrapped { wrap, secret }))
}

fn private_key(session: &Session, id: &[u8]) -> Result<ObjectHandle, Error> {
    session
        .find_objects(&[
            Attribute::Class(ObjectClass::PRIVATE_KEY),
            Attribute::Id(id.to_vec()),
        ])?
        .into_iter()
        .next()
        .ok_or_else(|| Error::Failed("the card has no key for its certificate".into()))
}

fn open(
    session: &Session,
    key: ObjectHandle,
    public: &PublicKey,
    wrap: &CardWrap,
) -> Option<Zeroizing<Vec<u8>>> {
    match wrap {
        CardWrap::Rsa(ciphertext) => session
            .decrypt(&Mechanism::RsaPkcs, key, ciphertext)
            .ok()
            .map(Zeroizing::new),
        CardWrap::Ecdh(ours) => {
            let length = match public {
                PublicKey::P384(_) => 48,
                _ => 32,
            };
            let template = [
                Attribute::Class(ObjectClass::SECRET_KEY),
                Attribute::KeyType(KeyType::GENERIC_SECRET),
                Attribute::ValueLen(length.into()),
                Attribute::Token(false),
                Attribute::Sensitive(false),
                Attribute::Extractable(true),
            ];
            let mechanism = Mechanism::Ecdh1Derive(Ecdh1DeriveParams::new(EcKdf::null(), ours));
            let derived = session.derive_key(&mechanism, key, &template).ok()?;
            let shared = session
                .get_attributes(derived, &[AttributeType::Value])
                .ok()?
                .into_iter()
                .find_map(|attribute| match attribute {
                    Attribute::Value(value) => Some(Zeroizing::new(value)),
                    _ => None,
                })?;
            let _ = session.destroy_object(derived);
            Some(crypto::stretch(&shared))
        }
    }
}
