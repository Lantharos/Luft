use std::ffi::{CStr, CString, c_char, c_int, c_ulong, c_void};
use std::ptr;

const SETTING_SIZE: usize = 192;
const DATA_SIZE: usize = 32768;

#[link(name = "crypt")]
unsafe extern "C" {
    fn crypt_gensalt_rn(
        prefix: *const c_char,
        count: c_ulong,
        random: *const c_char,
        random_size: c_int,
        output: *mut c_char,
        output_size: c_int,
    ) -> *mut c_char;
    fn crypt_rn(
        phrase: *const c_char,
        setting: *const c_char,
        data: *mut c_void,
        size: c_int,
    ) -> *mut c_char;
}

pub fn hash(password: &str) -> Result<String, String> {
    let failure = || "Couldn't secure the new password".to_owned();
    let phrase = CString::new(password).map_err(|_| failure())?;
    let mut setting = [0 as c_char; SETTING_SIZE];
    let mut data = vec![0u8; DATA_SIZE];
    let hashed = unsafe {
        let salted = crypt_gensalt_rn(
            ptr::null(),
            0,
            ptr::null(),
            0,
            setting.as_mut_ptr(),
            SETTING_SIZE as c_int,
        );
        if salted.is_null() {
            return Err(failure());
        }
        let hashed = crypt_rn(
            phrase.as_ptr(),
            setting.as_ptr(),
            data.as_mut_ptr().cast(),
            DATA_SIZE as c_int,
        );
        if hashed.is_null() {
            return Err(failure());
        }
        CStr::from_ptr(hashed).to_string_lossy().into_owned()
    };
    Ok(hashed)
}
