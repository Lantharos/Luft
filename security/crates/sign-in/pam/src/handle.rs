use std::ffi::{CStr, CString, c_char, c_int, c_void};
use std::ptr;

use luft_keyring_wire::{TOKEN_STASH, Token, TokenStash};

#[repr(C)]
pub struct PamHandle {
    _private: [u8; 0],
}

pub const PAM_SUCCESS: c_int = 0;
pub const PAM_PROMPT_ECHO_OFF: c_int = 1;
pub const PAM_PROMPT_ECHO_ON: c_int = 2;
pub const PAM_ERROR_MSG: c_int = 3;
pub const PAM_TEXT_INFO: c_int = 4;

type Cleanup = extern "C" fn(*mut PamHandle, *mut c_void, c_int);

#[link(name = "pam")]
unsafe extern "C" {
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
    fn pam_prompt(
        pamh: *mut PamHandle,
        style: c_int,
        response: *mut *mut c_char,
        format: *const c_char,
        ...
    ) -> c_int;
}

extern "C" fn drop_stash(_: *mut PamHandle, data: *mut c_void, _: c_int) {
    if data.is_null() {
        return;
    }
    let stash = unsafe { Box::from_raw(data.cast::<TokenStash>()) };
    let mut bytes = unsafe {
        Box::from_raw(ptr::slice_from_raw_parts_mut(
            stash.bytes.cast_mut(),
            stash.length,
        ))
    };
    bytes.iter_mut().for_each(|byte| *byte = 0);
}

pub struct Handle(pub *mut PamHandle);

impl Handle {
    pub fn user(&self) -> Option<String> {
        let mut name = ptr::null();
        (unsafe { pam_get_user(self.0, &raw mut name, ptr::null()) } == PAM_SUCCESS
            && !name.is_null())
        .then(|| {
            unsafe { CStr::from_ptr(name) }
                .to_string_lossy()
                .into_owned()
        })
    }

    pub fn has_data(&self, name: &CStr) -> bool {
        let mut data = ptr::null();
        unsafe {
            pam_get_data(self.0, name.as_ptr(), &raw mut data) == PAM_SUCCESS && !data.is_null()
        }
    }

    pub fn text_data(&self, name: &CStr) -> Option<String> {
        let mut data = ptr::null();
        (unsafe { pam_get_data(self.0, name.as_ptr(), &raw mut data) } == PAM_SUCCESS
            && !data.is_null())
        .then(|| {
            unsafe { CStr::from_ptr(data.cast()) }
                .to_string_lossy()
                .into_owned()
        })
    }

    /// Leaves a mark later modules in the same rules can look for.
    pub fn mark(&self, name: &'static CStr) -> bool {
        unsafe {
            pam_set_data(self.0, name.as_ptr(), name.as_ptr().cast_mut().cast(), None)
                == PAM_SUCCESS
        }
    }

    /// Asks the person signing in, and gives back what they typed.
    pub fn ask(&self, question: &str, visible: bool) -> Option<Vec<u8>> {
        let question = CString::new(question).ok()?;
        let style = if visible {
            PAM_PROMPT_ECHO_ON
        } else {
            PAM_PROMPT_ECHO_OFF
        };
        let mut answer = ptr::null_mut();
        let asked = unsafe {
            pam_prompt(
                self.0,
                style,
                &raw mut answer,
                c"%s".as_ptr(),
                question.as_ptr(),
            )
        };
        if asked != PAM_SUCCESS || answer.is_null() {
            return None;
        }
        let length = unsafe { libc::strlen(answer) };
        let typed = unsafe { std::slice::from_raw_parts(answer.cast::<u8>(), length) }.to_vec();
        unsafe {
            libc::explicit_bzero(answer.cast(), length);
            libc::free(answer.cast());
        }
        Some(typed)
    }

    pub fn tell(&self, text: &str, error: bool) {
        let Ok(text) = CString::new(text) else { return };
        let style = if error { PAM_ERROR_MSG } else { PAM_TEXT_INFO };
        let mut answer = ptr::null_mut();
        unsafe {
            pam_prompt(
                self.0,
                style,
                &raw mut answer,
                c"%s".as_ptr(),
                text.as_ptr(),
            )
        };
        if !answer.is_null() {
            unsafe { libc::free(answer.cast()) };
        }
    }

    /// Leaves the keyring's token for `pam_luft_keyring.so`, later in the
    /// same sign-in.
    pub fn stash_token(&self, token: &Token) -> bool {
        let bytes = Box::into_raw(token.encode().into_boxed_slice());
        let stashed = Box::into_raw(Box::new(TokenStash {
            length: bytes.len(),
            bytes: bytes.cast::<u8>(),
        }));
        unsafe {
            pam_set_data(
                self.0,
                TOKEN_STASH.as_ptr(),
                stashed.cast(),
                Some(drop_stash),
            ) == PAM_SUCCESS
        }
    }
}
