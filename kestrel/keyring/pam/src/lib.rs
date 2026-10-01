mod handle;
mod send;

use std::ffi::{c_char, c_int};
use std::panic::{AssertUnwindSafe, catch_unwind};

use handle::{Handle, PamHandle};
use luft_keyring_wire::{Grant, GrantReason};

const PAM_IGNORE: c_int = 25;
const PAM_ESTABLISH_CRED: c_int = 0x2;
const PAM_REINITIALIZE_CRED: c_int = 0x8;
const PAM_UPDATE_AUTHTOK: c_int = 0x2000;

fn guarded(hook: impl FnOnce()) -> c_int {
    let _ = catch_unwind(AssertUnwindSafe(hook));
    PAM_IGNORE
}

fn send(handle: &Handle, password: Option<luft_keyring_wire::Secret>, reason: GrantReason) {
    if unsafe { libc::geteuid() } != 0 {
        return;
    }
    if let Some(user) = handle.uid() {
        send::grant(Grant {
            user,
            password,
            reason,
        });
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn pam_sm_authenticate(
    pamh: *mut PamHandle,
    _: c_int,
    _: c_int,
    _: *const *const c_char,
) -> c_int {
    guarded(|| Handle(pamh).stash_password())
}

#[unsafe(no_mangle)]
pub extern "C" fn pam_sm_setcred(
    pamh: *mut PamHandle,
    flags: c_int,
    _: c_int,
    _: *const *const c_char,
) -> c_int {
    guarded(|| {
        let reason = match flags {
            flags if flags & PAM_REINITIALIZE_CRED != 0 => GrantReason::Unlock,
            flags if flags & PAM_ESTABLISH_CRED != 0 => GrantReason::SignIn,
            _ => return,
        };
        let handle = Handle(pamh);
        if let Some(password) = handle.take_stash() {
            send(&handle, password, reason);
        }
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn pam_sm_chauthtok(
    pamh: *mut PamHandle,
    flags: c_int,
    _: c_int,
    _: *const *const c_char,
) -> c_int {
    guarded(|| {
        if flags & PAM_UPDATE_AUTHTOK != 0 {
            let handle = Handle(pamh);
            if let Some(password) = handle.password() {
                send(&handle, Some(password), GrantReason::PasswordChanged);
            }
        }
    })
}
