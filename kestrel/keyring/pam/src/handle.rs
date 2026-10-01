use std::ffi::{CStr, c_char, c_int, c_void};
use std::ptr;

use luft_keyring_wire::Secret;

#[repr(C)]
pub struct PamHandle {
    _private: [u8; 0],
}

const PAM_SUCCESS: c_int = 0;
const PAM_AUTHTOK: c_int = 6;
const STASH: &CStr = c"luft-keyring-authenticated";

type Cleanup = extern "C" fn(*mut PamHandle, *mut c_void, c_int);

#[link(name = "pam")]
unsafe extern "C" {
    fn pam_get_item(pamh: *const PamHandle, item_type: c_int, item: *mut *const c_void) -> c_int;
    fn pam_get_user(pamh: *mut PamHandle, user: *mut *const c_char, prompt: *const c_char)
    -> c_int;
    fn pam_set_data(
        pamh: *mut PamHandle,
        name: *const c_char,
        data: *mut c_void,
        cleanup: Option<Cleanup>,
    ) -> c_int;
    fn pam_get_data(pamh: *const PamHandle, name: *const c_char, data: *mut *const c_void)
    -> c_int;
}

type Stash = Option<Secret>;

extern "C" fn drop_stash(_: *mut PamHandle, data: *mut c_void, _: c_int) {
    if !data.is_null() {
        drop(unsafe { Box::from_raw(data.cast::<Stash>()) });
    }
}

pub struct Handle(pub *mut PamHandle);

impl Handle {
    pub fn password(&self) -> Option<Secret> {
        let mut item = ptr::null();
        let found = unsafe { pam_get_item(self.0, PAM_AUTHTOK, &raw mut item) };
        (found == PAM_SUCCESS && !item.is_null())
            .then(|| Secret::copy_of(unsafe { CStr::from_ptr(item.cast()) }.to_bytes()))
            .filter(|password| !password.is_empty())
    }

    pub fn stash_password(&self) {
        let stash = Box::into_raw(Box::new(self.password()));
        unsafe { pam_set_data(self.0, STASH.as_ptr(), stash.cast(), Some(drop_stash)) };
    }

    pub fn take_stash(&self) -> Option<Stash> {
        let mut data = ptr::null();
        let found = unsafe { pam_get_data(self.0, STASH.as_ptr(), &raw mut data) };
        if found != PAM_SUCCESS || data.is_null() {
            return None;
        }
        let stash = unsafe { &*data.cast::<Stash>() }.clone();
        unsafe { pam_set_data(self.0, STASH.as_ptr(), ptr::null_mut(), None) };
        Some(stash)
    }

    pub fn uid(&self) -> Option<u32> {
        let mut name = ptr::null();
        if unsafe { pam_get_user(self.0, &raw mut name, ptr::null()) } != PAM_SUCCESS
            || name.is_null()
        {
            return None;
        }
        let mut entry = unsafe { std::mem::zeroed::<libc::passwd>() };
        let mut buffer = vec![0 as c_char; 4096];
        let mut result = ptr::null_mut();
        let status = unsafe {
            libc::getpwnam_r(
                name,
                &raw mut entry,
                buffer.as_mut_ptr(),
                buffer.len(),
                &raw mut result,
            )
        };
        (status == 0 && !result.is_null()).then_some(entry.pw_uid)
    }
}
