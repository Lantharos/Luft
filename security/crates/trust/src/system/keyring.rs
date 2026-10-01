use std::ffi::CString;

use super::secret::Secret;

const KEY_SPEC_USER_KEYRING: libc::c_long = -4;
const KEYCTL_SET_TIMEOUT: libc::c_long = 15;
const KEYCTL_SETPERM: libc::c_long = 5;
const KEYCTL_SEARCH: libc::c_long = 10;
const KEYCTL_READ: libc::c_long = 11;
const KEYCTL_INVALIDATE: libc::c_long = 21;
const OWNER_ONLY: libc::c_long = 0x3f3f_0000;
const LIFETIME_SECONDS: libc::c_long = 15 * 60;

fn description(name: &str) -> CString {
    CString::new(format!("luft-trust:{name}")).expect("key names have no NUL bytes")
}

fn find(name: &str) -> Option<libc::c_long> {
    search(&description(name))
}

fn search(description: &std::ffi::CStr) -> Option<libc::c_long> {
    let kind = c"user";
    let id = unsafe {
        libc::syscall(
            libc::SYS_keyctl,
            KEYCTL_SEARCH,
            KEY_SPEC_USER_KEYRING,
            kind.as_ptr(),
            description.as_ptr(),
            0,
        )
    };
    (id > 0).then_some(id)
}

pub fn hand_over(name: &str, secret: &Secret) -> bool {
    let kind = c"user";
    let description = description(name);
    let id = unsafe {
        libc::syscall(
            libc::SYS_add_key,
            kind.as_ptr(),
            description.as_ptr(),
            secret.bytes().as_ptr(),
            secret.bytes().len(),
            KEY_SPEC_USER_KEYRING,
        )
    };
    if id <= 0 {
        return false;
    }
    unsafe {
        libc::syscall(libc::SYS_keyctl, KEYCTL_SETPERM, id, OWNER_ONLY);
        libc::syscall(libc::SYS_keyctl, KEYCTL_SET_TIMEOUT, id, LIFETIME_SECONDS);
    }
    true
}

pub fn take(name: &str) -> Option<Secret> {
    read(find(name)?)
}

pub fn systemd_cached() -> Vec<Secret> {
    let Some(cached) = search(c"cryptsetup").and_then(read) else {
        return Vec::new();
    };
    cached
        .bytes()
        .split(|byte| *byte == 0)
        .filter(|part| !part.is_empty())
        .map(|part| Secret::new(part.to_vec()))
        .collect()
}

fn read(id: libc::c_long) -> Option<Secret> {
    let mut buffer = vec![0u8; 4096];
    let length = unsafe {
        libc::syscall(
            libc::SYS_keyctl,
            KEYCTL_READ,
            id,
            buffer.as_mut_ptr(),
            buffer.len(),
        )
    };
    let length = usize::try_from(length)
        .ok()
        .filter(|length| *length <= buffer.len())?;
    buffer.truncate(length);
    Some(Secret::new(buffer))
}

pub fn forget(name: &str) {
    if let Some(id) = find(name) {
        unsafe { libc::syscall(libc::SYS_keyctl, KEYCTL_INVALIDATE, id) };
    }
}
