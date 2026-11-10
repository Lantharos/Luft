use std::ffi::{CStr, c_char, c_int, c_void};
use std::ptr;

use libloading::{Library, Symbol};

const LIBRARY: &str = "libpwquality.so.1";
const TOO_SIMILAR: [c_int; 5] = [-9, -15, -16, -17, -21];
const TOO_SHORT: [c_int; 2] = [-14, -20];
const DICTIONARY_WORD: [c_int; 2] = [-22, -28];
const CONTAINS_NAME: [c_int; 2] = [-25, -26];
const TOO_SIMPLE: [c_int; 8] = [-10, -11, -12, -13, -18, -19, -27, -29];

pub const REJECTED: &str = "rejected";

type Defaults = unsafe extern "C" fn() -> *mut c_void;
type ReadConfig = unsafe extern "C" fn(*mut c_void, *const c_char, *mut *mut c_void) -> c_int;
type Check = unsafe extern "C" fn(
    *mut c_void,
    *const c_char,
    *const c_char,
    *const c_char,
    *mut *mut c_void,
) -> c_int;
type Free = unsafe extern "C" fn(*mut c_void);

fn kind(verdict: c_int) -> Option<&'static str> {
    let among = |codes: &[c_int]| codes.contains(&verdict);
    match verdict {
        0.. => None,
        _ if among(&TOO_SHORT) => Some("too-short"),
        _ if among(&TOO_SIMILAR) => Some("too-similar"),
        _ if among(&DICTIONARY_WORD) => Some("dictionary-word"),
        _ if among(&CONTAINS_NAME) => Some("contains-name"),
        _ if among(&TOO_SIMPLE) => Some("too-simple"),
        _ => Some(REJECTED),
    }
}

pub fn weakness(user: &CStr, current: &CStr, new: &CStr) -> Result<Option<&'static str>, String> {
    let failed = |error: libloading::Error| error.to_string();
    unsafe {
        let library = Library::new(LIBRARY).map_err(failed)?;
        let defaults: Symbol<Defaults> = library
            .get(b"pwquality_default_settings\0")
            .map_err(failed)?;
        let read_config: Symbol<ReadConfig> =
            library.get(b"pwquality_read_config\0").map_err(failed)?;
        let check: Symbol<Check> = library.get(b"pwquality_check\0").map_err(failed)?;
        let free: Symbol<Free> = library.get(b"pwquality_free_settings\0").map_err(failed)?;
        let settings = defaults();
        if settings.is_null() {
            return Err("the password rules couldn't be loaded".into());
        }
        read_config(settings, ptr::null(), ptr::null_mut());
        let verdict = check(
            settings,
            new.as_ptr(),
            current.as_ptr(),
            user.as_ptr(),
            ptr::null_mut(),
        );
        free(settings);
        Ok(kind(verdict))
    }
}
