mod ffi;

use std::ffi::{CStr, CString, c_int};
use std::ptr;

use ffi::{Fido, fido};

pub const RELYING_PARTY: &str = "com.lantharos.sign-in";
const MOST_DEVICES: usize = 16;
const HMAC_SECRET: &CStr = c"hmac-secret";

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    WrongPin,
    PinBlocked,
    PinTooSimple,
    NoCredential,
    TimedOut,
    Failed(String),
}

impl Error {
    fn of(fido: &Fido, status: c_int) -> Self {
        match status {
            ffi::ERR_PIN_INVALID | ffi::ERR_UV_INVALID => Self::WrongPin,
            ffi::ERR_PIN_BLOCKED | ffi::ERR_PIN_AUTH_BLOCKED | ffi::ERR_UV_BLOCKED => {
                Self::PinBlocked
            }
            ffi::ERR_PIN_POLICY_VIOLATION => Self::PinTooSimple,
            ffi::ERR_NO_CREDENTIALS => Self::NoCredential,
            ffi::ERR_ACTION_TIMEOUT => Self::TimedOut,
            _ => Self::Failed(
                unsafe { CStr::from_ptr((fido.fido_strerr)(status)) }
                    .to_string_lossy()
                    .into_owned(),
            ),
        }
    }
}

fn checked(fido: &Fido, status: c_int) -> Result<(), Error> {
    if status == ffi::OK {
        Ok(())
    } else {
        Err(Error::of(fido, status))
    }
}

fn text(value: &str) -> Result<CString, Error> {
    CString::new(value).map_err(|_| Error::Failed("text with a NUL byte".into()))
}

fn bytes(pointer: *const u8, length: usize) -> Vec<u8> {
    if pointer.is_null() {
        return Vec::new();
    }
    unsafe { std::slice::from_raw_parts(pointer, length) }.to_vec()
}

/// A security key plugged in now, known by its hidraw node.
#[derive(Debug, Clone)]
pub struct Plugged {
    pub path: String,
    pub name: String,
}

pub fn plugged() -> Result<Vec<Plugged>, Error> {
    let fido = fido().map_err(Error::Failed)?;
    let list = unsafe { (fido.fido_dev_info_new)(MOST_DEVICES) };
    let mut found = 0;
    let listed = checked(fido, unsafe {
        (fido.fido_dev_info_manifest)(list, MOST_DEVICES, &raw mut found)
    });
    let devices = (0..found)
        .map(|index| unsafe {
            let info = (fido.fido_dev_info_ptr)(list, index);
            let name = (fido.fido_dev_info_product_string)(info);
            Plugged {
                path: CStr::from_ptr((fido.fido_dev_info_path)(info))
                    .to_string_lossy()
                    .into_owned(),
                name: if name.is_null() {
                    String::new()
                } else {
                    without_interfaces(&CStr::from_ptr(name).to_string_lossy())
                },
            }
        })
        .collect();
    let mut list = list;
    unsafe { (fido.fido_dev_info_free)(&raw mut list, MOST_DEVICES) };
    listed.map(|()| devices)
}

fn without_interfaces(product: &str) -> String {
    let interface_list = |word: &str| {
        word.contains('+')
            && word.split('+').all(|part| {
                !part.is_empty()
                    && part
                        .chars()
                        .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit())
            })
    };
    product
        .split_whitespace()
        .filter(|word| !interface_list(word))
        .collect::<Vec<_>>()
        .join(" ")
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Algorithm {
    Es256,
    EdDsa,
}

#[derive(Debug, Clone)]
pub struct Credential {
    pub id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub algorithm: Algorithm,
}

pub struct Assertion {
    pub verified: bool,
    pub secret: Option<Vec<u8>>,
}

pub struct Device {
    fido: &'static Fido,
    raw: *mut ffi::Dev,
}

unsafe impl Send for Device {}
unsafe impl Sync for Device {}

impl Device {
    pub fn open(path: &str) -> Result<Self, Error> {
        let fido = fido().map_err(Error::Failed)?;
        let path = text(path)?;
        let mut raw = unsafe { (fido.fido_dev_new)() };
        if let Err(error) = checked(fido, unsafe { (fido.fido_dev_open)(raw, path.as_ptr()) }) {
            unsafe { (fido.fido_dev_free)(&raw mut raw) };
            return Err(error);
        }
        Ok(Self { fido, raw })
    }

    pub fn can_sign_in(&self) -> bool {
        let fido2 = unsafe { (self.fido.fido_dev_is_fido2)(self.raw) };
        fido2 && self.extends_with_hmac_secret()
    }

    fn extends_with_hmac_secret(&self) -> bool {
        let fido = self.fido;
        let mut info = unsafe { (fido.fido_cbor_info_new)() };
        let read = checked(fido, unsafe {
            (fido.fido_dev_get_cbor_info)(self.raw, info)
        });
        let found = read.is_ok()
            && unsafe {
                let names = (fido.fido_cbor_info_extensions_ptr)(info);
                (0..(fido.fido_cbor_info_extensions_len)(info))
                    .any(|index| CStr::from_ptr(*names.add(index)) == HMAC_SECRET)
            };
        unsafe { (fido.fido_cbor_info_free)(&raw mut info) };
        found
    }

    pub fn has_pin(&self) -> bool {
        unsafe { (self.fido.fido_dev_has_pin)(self.raw) }
    }

    /// Whether the key checks who touches it by itself, with a fingerprint
    /// reader of its own, so no PIN is typed on the computer.
    pub fn verifies_by_itself(&self) -> bool {
        unsafe { (self.fido.fido_dev_has_uv)(self.raw) }
    }

    pub fn pin_tries_left(&self) -> Option<u8> {
        let mut tries = 0;
        checked(self.fido, unsafe {
            (self.fido.fido_dev_get_retry_count)(self.raw, &raw mut tries)
        })
        .ok()?;
        u8::try_from(tries).ok()
    }

    pub fn set_pin(&self, pin: &str) -> Result<(), Error> {
        let pin = text(pin)?;
        checked(self.fido, unsafe {
            (self.fido.fido_dev_set_pin)(self.raw, pin.as_ptr(), ptr::null())
        })
    }

    pub fn cancel(&self) {
        unsafe { (self.fido.fido_dev_cancel)(self.raw) };
    }

    pub fn make_credential(
        &self,
        user_id: &[u8],
        user_name: &str,
        challenge: &[u8; 32],
        pin: Option<&str>,
    ) -> Result<Credential, Error> {
        let fido = self.fido;
        let rp = text(RELYING_PARTY)?;
        let name = text(user_name)?;
        let pin = pin.map(text).transpose()?;
        let mut cred = unsafe { (fido.fido_cred_new)() };
        let made = (|| unsafe {
            checked(fido, (fido.fido_cred_set_type)(cred, ffi::COSE_ES256))?;
            checked(
                fido,
                (fido.fido_cred_set_clientdata_hash)(cred, challenge.as_ptr(), challenge.len()),
            )?;
            checked(
                fido,
                (fido.fido_cred_set_rp)(cred, rp.as_ptr(), c"Luft".as_ptr()),
            )?;
            checked(
                fido,
                (fido.fido_cred_set_user)(
                    cred,
                    user_id.as_ptr(),
                    user_id.len(),
                    name.as_ptr(),
                    name.as_ptr(),
                    ptr::null(),
                ),
            )?;
            checked(
                fido,
                (fido.fido_cred_set_extensions)(cred, ffi::EXT_HMAC_SECRET),
            )?;
            checked(fido, (fido.fido_cred_set_rk)(cred, ffi::OPT_FALSE))?;
            checked(
                fido,
                (fido.fido_dev_make_cred)(
                    self.raw,
                    cred,
                    pin.as_ref().map_or(ptr::null(), |pin| pin.as_ptr()),
                ),
            )?;
            let algorithm = match (fido.fido_cred_type)(cred) {
                ffi::COSE_EDDSA => Algorithm::EdDsa,
                _ => Algorithm::Es256,
            };
            Ok(Credential {
                id: bytes((fido.fido_cred_id_ptr)(cred), (fido.fido_cred_id_len)(cred)),
                public_key: bytes(
                    (fido.fido_cred_pubkey_ptr)(cred),
                    (fido.fido_cred_pubkey_len)(cred),
                ),
                algorithm,
            })
        })();
        unsafe { (fido.fido_cred_free)(&raw mut cred) };
        made
    }

    /// Whether `credential` belongs to this key, asked without a touch.
    pub fn holds(&self, credential: &[u8]) -> Result<bool, Error> {
        match self.get_assertion(credential, &[0; 32], None, false, None) {
            Ok(_) => Ok(true),
            Err(Error::NoCredential) => Ok(false),
            Err(error) => Err(error),
        }
    }

    /// Asks the key, after its PIN and a touch, to sign `challenge` with
    /// `credential` and to derive its secret for `salt`. The signature is
    /// checked against `public_key` here, never trusted from the key.
    pub fn assert(
        &self,
        credential: &Credential,
        challenge: &[u8; 32],
        salt: &[u8; 32],
        pin: Option<&str>,
    ) -> Result<Assertion, Error> {
        self.get_assertion(
            &credential.id,
            challenge,
            Some(salt),
            true,
            pin.map(text).transpose()?.as_deref(),
        )
        .and_then(|raw| {
            let fido = self.fido;
            let verified = verify(fido, raw.0, credential)?;
            let flags = unsafe { (fido.fido_assert_flags)(raw.0, 0) };
            let present = flags & ffi::FLAG_UP != 0 && flags & ffi::FLAG_UV != 0;
            let secret = unsafe {
                bytes(
                    (fido.fido_assert_hmac_secret_ptr)(raw.0, 0),
                    (fido.fido_assert_hmac_secret_len)(raw.0, 0),
                )
            };
            Ok(Assertion {
                verified: verified && present,
                secret: (secret.len() == 32).then_some(secret),
            })
        })
    }

    fn get_assertion(
        &self,
        credential: &[u8],
        challenge: &[u8; 32],
        salt: Option<&[u8; 32]>,
        presence: bool,
        pin: Option<&CStr>,
    ) -> Result<RawAssertion, Error> {
        let fido = self.fido;
        let rp = text(RELYING_PARTY)?;
        let raw = RawAssertion(unsafe { (fido.fido_assert_new)() }, fido);
        unsafe {
            checked(
                fido,
                (fido.fido_assert_set_clientdata_hash)(raw.0, challenge.as_ptr(), challenge.len()),
            )?;
            checked(fido, (fido.fido_assert_set_rp)(raw.0, rp.as_ptr()))?;
            checked(
                fido,
                (fido.fido_assert_allow_cred)(raw.0, credential.as_ptr(), credential.len()),
            )?;
            if let Some(salt) = salt {
                checked(
                    fido,
                    (fido.fido_assert_set_extensions)(raw.0, ffi::EXT_HMAC_SECRET),
                )?;
                checked(
                    fido,
                    (fido.fido_assert_set_hmac_salt)(raw.0, salt.as_ptr(), salt.len()),
                )?;
            }
            checked(
                fido,
                (fido.fido_assert_set_up)(
                    raw.0,
                    if presence {
                        ffi::OPT_TRUE
                    } else {
                        ffi::OPT_FALSE
                    },
                ),
            )?;
            if presence && pin.is_none() && self.verifies_by_itself() {
                checked(fido, (fido.fido_assert_set_uv)(raw.0, ffi::OPT_TRUE))?;
            }
            checked(
                fido,
                (fido.fido_dev_get_assert)(self.raw, raw.0, pin.map_or(ptr::null(), CStr::as_ptr)),
            )?;
            if (fido.fido_assert_count)(raw.0) != 1 {
                return Err(Error::Failed(
                    "the key answered for more than one credential".into(),
                ));
            }
        }
        Ok(raw)
    }
}

impl Drop for Device {
    fn drop(&mut self) {
        unsafe {
            (self.fido.fido_dev_close)(self.raw);
            (self.fido.fido_dev_free)(&raw mut self.raw);
        }
    }
}

struct RawAssertion(*mut ffi::Assert, &'static Fido);

impl Drop for RawAssertion {
    fn drop(&mut self) {
        unsafe { (self.1.fido_assert_free)(&raw mut self.0) };
    }
}

fn verify(
    fido: &Fido,
    assertion: *const ffi::Assert,
    credential: &Credential,
) -> Result<bool, Error> {
    let (new, from, free, kind): (
        unsafe extern "C" fn() -> *mut ffi::PublicKey,
        unsafe extern "C" fn(*mut ffi::PublicKey, *const std::ffi::c_void, usize) -> c_int,
        unsafe extern "C" fn(*mut *mut ffi::PublicKey),
        c_int,
    ) = match credential.algorithm {
        Algorithm::Es256 => (
            fido.es256_pk_new,
            fido.es256_pk_from_ptr,
            fido.es256_pk_free,
            ffi::COSE_ES256,
        ),
        Algorithm::EdDsa => (
            fido.eddsa_pk_new,
            fido.eddsa_pk_from_ptr,
            fido.eddsa_pk_free,
            ffi::COSE_EDDSA,
        ),
    };
    let mut key = unsafe { new() };
    let checked_key = checked(fido, unsafe {
        from(
            key,
            credential.public_key.as_ptr().cast(),
            credential.public_key.len(),
        )
    });
    let verified = checked_key
        .map(|()| unsafe { (fido.fido_assert_verify)(assertion, 0, kind, key.cast()) } == ffi::OK);
    unsafe { free(&raw mut key) };
    verified
}

#[cfg(test)]
mod tests {
    use super::without_interfaces;

    #[test]
    fn product_names_drop_their_interface_lists() {
        assert_eq!(without_interfaces("YubiKey OTP+FIDO+CCID"), "YubiKey");
        assert_eq!(
            without_interfaces("Security Key by Yubico"),
            "Security Key by Yubico"
        );
        assert_eq!(without_interfaces("Nitrokey 3"), "Nitrokey 3");
    }
}
