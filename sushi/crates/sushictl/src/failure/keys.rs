use std::io;

const KEYCTL_CLEAR: libc::c_long = 7;
const KEYCTL_SEARCH: libc::c_long = 10;
const KEYCTL_INVALIDATE: libc::c_long = 21;
const KEY_SPEC_USER_KEYRING: libc::c_long = -4;

pub fn forget_typed() {
    let key = unsafe {
        libc::syscall(
            libc::SYS_keyctl,
            KEYCTL_SEARCH,
            KEY_SPEC_USER_KEYRING,
            c"user".as_ptr(),
            c"cryptsetup".as_ptr(),
            0,
        )
    };
    if key > 0 {
        unsafe { libc::syscall(libc::SYS_keyctl, KEYCTL_INVALIDATE, key) };
    }
}

pub fn forget_all() -> io::Result<()> {
    let cleared = unsafe { libc::syscall(libc::SYS_keyctl, KEYCTL_CLEAR, KEY_SPEC_USER_KEYRING) };
    if cleared == 0 {
        Ok(())
    } else {
        Err(io::Error::last_os_error())
    }
}
