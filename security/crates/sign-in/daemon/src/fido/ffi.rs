use std::ffi::{c_char, c_int, c_void};
use std::sync::OnceLock;

use libloading::Library;

#[repr(C)]
pub struct DevInfo {
    _private: [u8; 0],
}
#[repr(C)]
pub struct Dev {
    _private: [u8; 0],
}
#[repr(C)]
pub struct Cred {
    _private: [u8; 0],
}
#[repr(C)]
pub struct Assert {
    _private: [u8; 0],
}
#[repr(C)]
pub struct CborInfo {
    _private: [u8; 0],
}
#[repr(C)]
pub struct PublicKey {
    _private: [u8; 0],
}

pub const OK: c_int = 0;
pub const ERR_NO_CREDENTIALS: c_int = 0x2e;
pub const ERR_ACTION_TIMEOUT: c_int = 0x2f;
pub const ERR_PIN_INVALID: c_int = 0x31;
pub const ERR_PIN_BLOCKED: c_int = 0x32;
pub const ERR_PIN_AUTH_BLOCKED: c_int = 0x34;
pub const ERR_PIN_POLICY_VIOLATION: c_int = 0x37;
pub const ERR_UV_BLOCKED: c_int = 0x3c;
pub const ERR_UV_INVALID: c_int = 0x3f;
pub const EXT_HMAC_SECRET: c_int = 0x01;
pub const OPT_FALSE: c_int = 1;
pub const OPT_TRUE: c_int = 2;
pub const COSE_ES256: c_int = -7;
pub const COSE_EDDSA: c_int = -8;
pub const FLAG_UP: u8 = 0x01;
pub const FLAG_UV: u8 = 0x04;

macro_rules! library {
    ($($name:ident: fn($($argument:ty),*) $(-> $result:ty)?;)*) => {
        #[allow(non_snake_case)]
        pub struct Fido {
            _library: Library,
            $(pub $name: unsafe extern "C" fn($($argument),*) $(-> $result)?,)*
        }

        impl Fido {
            fn load() -> Result<Self, libloading::Error> {
                let library = unsafe { Library::new("libfido2.so.1")? };
                Ok(Self {
                    $($name: unsafe { *library.get(concat!(stringify!($name), "\0").as_bytes())? },)*
                    _library: library,
                })
            }
        }
    };
}

library! {
    fido_init: fn(c_int);
    fido_strerr: fn(c_int) -> *const c_char;
    fido_dev_info_new: fn(usize) -> *mut DevInfo;
    fido_dev_info_free: fn(*mut *mut DevInfo, usize);
    fido_dev_info_manifest: fn(*mut DevInfo, usize, *mut usize) -> c_int;
    fido_dev_info_ptr: fn(*const DevInfo, usize) -> *const DevInfo;
    fido_dev_info_path: fn(*const DevInfo) -> *const c_char;
    fido_dev_info_product_string: fn(*const DevInfo) -> *const c_char;
    fido_dev_new: fn() -> *mut Dev;
    fido_dev_free: fn(*mut *mut Dev);
    fido_dev_open: fn(*mut Dev, *const c_char) -> c_int;
    fido_dev_close: fn(*mut Dev) -> c_int;
    fido_dev_cancel: fn(*mut Dev) -> c_int;
    fido_dev_is_fido2: fn(*const Dev) -> bool;
    fido_dev_has_pin: fn(*const Dev) -> bool;
    fido_dev_has_uv: fn(*const Dev) -> bool;
    fido_dev_get_retry_count: fn(*mut Dev, *mut c_int) -> c_int;
    fido_dev_set_pin: fn(*mut Dev, *const c_char, *const c_char) -> c_int;
    fido_dev_get_cbor_info: fn(*mut Dev, *mut CborInfo) -> c_int;
    fido_cbor_info_new: fn() -> *mut CborInfo;
    fido_cbor_info_free: fn(*mut *mut CborInfo);
    fido_cbor_info_extensions_ptr: fn(*const CborInfo) -> *mut *mut c_char;
    fido_cbor_info_extensions_len: fn(*const CborInfo) -> usize;
    fido_cred_new: fn() -> *mut Cred;
    fido_cred_free: fn(*mut *mut Cred);
    fido_cred_set_type: fn(*mut Cred, c_int) -> c_int;
    fido_cred_set_clientdata_hash: fn(*mut Cred, *const u8, usize) -> c_int;
    fido_cred_set_rp: fn(*mut Cred, *const c_char, *const c_char) -> c_int;
    fido_cred_set_user: fn(*mut Cred, *const u8, usize, *const c_char, *const c_char, *const c_char) -> c_int;
    fido_cred_set_extensions: fn(*mut Cred, c_int) -> c_int;
    fido_cred_set_rk: fn(*mut Cred, c_int) -> c_int;
    fido_dev_make_cred: fn(*mut Dev, *mut Cred, *const c_char) -> c_int;
    fido_cred_id_ptr: fn(*const Cred) -> *const u8;
    fido_cred_id_len: fn(*const Cred) -> usize;
    fido_cred_pubkey_ptr: fn(*const Cred) -> *const u8;
    fido_cred_pubkey_len: fn(*const Cred) -> usize;
    fido_cred_type: fn(*const Cred) -> c_int;
    fido_assert_new: fn() -> *mut Assert;
    fido_assert_free: fn(*mut *mut Assert);
    fido_assert_set_clientdata_hash: fn(*mut Assert, *const u8, usize) -> c_int;
    fido_assert_set_rp: fn(*mut Assert, *const c_char) -> c_int;
    fido_assert_allow_cred: fn(*mut Assert, *const u8, usize) -> c_int;
    fido_assert_set_extensions: fn(*mut Assert, c_int) -> c_int;
    fido_assert_set_hmac_salt: fn(*mut Assert, *const u8, usize) -> c_int;
    fido_assert_set_up: fn(*mut Assert, c_int) -> c_int;
    fido_assert_set_uv: fn(*mut Assert, c_int) -> c_int;
    fido_dev_get_assert: fn(*mut Dev, *mut Assert, *const c_char) -> c_int;
    fido_assert_count: fn(*const Assert) -> usize;
    fido_assert_flags: fn(*const Assert, usize) -> u8;
    fido_assert_hmac_secret_ptr: fn(*const Assert, usize) -> *const u8;
    fido_assert_hmac_secret_len: fn(*const Assert, usize) -> usize;
    fido_assert_verify: fn(*const Assert, usize, c_int, *const c_void) -> c_int;
    es256_pk_new: fn() -> *mut PublicKey;
    es256_pk_free: fn(*mut *mut PublicKey);
    es256_pk_from_ptr: fn(*mut PublicKey, *const c_void, usize) -> c_int;
    eddsa_pk_new: fn() -> *mut PublicKey;
    eddsa_pk_free: fn(*mut *mut PublicKey);
    eddsa_pk_from_ptr: fn(*mut PublicKey, *const c_void, usize) -> c_int;
}

pub fn fido() -> Result<&'static Fido, String> {
    static FIDO: OnceLock<Result<Fido, String>> = OnceLock::new();
    FIDO.get_or_init(|| {
        let fido = Fido::load().map_err(|error| format!("libfido2 isn't usable: {error}"))?;
        unsafe { (fido.fido_init)(0) };
        Ok(fido)
    })
    .as_ref()
    .map_err(Clone::clone)
}
