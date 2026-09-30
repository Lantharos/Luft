use std::collections::HashMap;
use std::ffi::CStr;

const BUFFER: usize = 4096;

#[derive(Default)]
pub struct Users(HashMap<u32, String>);

impl Users {
    pub fn name(&mut self, uid: u32) -> &str {
        self.0
            .entry(uid)
            .or_insert_with(|| lookup(uid).unwrap_or_else(|| uid.to_string()))
    }
}

fn lookup(uid: u32) -> Option<String> {
    let mut entry: libc::passwd = unsafe { std::mem::zeroed() };
    let mut buffer = vec![0 as libc::c_char; BUFFER];
    let mut result: *mut libc::passwd = std::ptr::null_mut();
    let status = unsafe {
        libc::getpwuid_r(
            uid,
            &mut entry,
            buffer.as_mut_ptr(),
            buffer.len(),
            &mut result,
        )
    };
    if status != 0 || result.is_null() || entry.pw_name.is_null() {
        return None;
    }
    Some(
        unsafe { CStr::from_ptr(entry.pw_name) }
            .to_string_lossy()
            .into_owned(),
    )
}
