mod handle;
mod service;

use std::ffi::{CStr, c_char, c_int};
use std::panic::{AssertUnwindSafe, catch_unwind};

use handle::{Handle, PamHandle};
use luft_sign_in_wire::{Notice, Problem, Question, Reply, Way};

const PAM_SUCCESS: c_int = 0;
const PAM_SERVICE_ERR: c_int = 3;
const PAM_AUTH_ERR: c_int = 7;
const PAM_USER_UNKNOWN: c_int = 10;
const PAM_IGNORE: c_int = 25;

const METHOD: &CStr = c"kestrel-sign-in-method";
const VERIFIED: &CStr = c"luft-sign-in-verified";
const FINGERPRINT_VERIFIED: &CStr = c"kestrel-fingerprint-verified";

const KEY_PIN: &str = "Security key PIN: ";
const CARD_PIN: &str = "Smart card PIN: ";
const RECOVERY_KEY: &str = "Recovery key: ";
const PLUG_IN_KEY: &str = "Plug in your security key";
const TOUCH_KEY: &str = "Touch your security key";
const INSERT_CARD: &str = "Insert your smart card";
const PASSWORD_BACK: &str = "Password sign-in is back on";
const PASSWORD_OFF: &str = "Password sign-in is turned off";
const WRONG_PIN: &str = "Wrong PIN";
const BLOCKED: &str = "The PIN is blocked";
const NOT_ENROLLED: &str = "This isn't set up for this account";
const WRONG_RECOVERY_KEY: &str = "That isn't this computer's recovery key";

#[derive(Clone, Copy, PartialEq, Eq)]
enum Mode {
    SignIn,
    Verified,
    Password,
    Way(Way),
}

fn mode(argc: c_int, argv: *const *const c_char) -> Option<Mode> {
    let arguments: Vec<&CStr> = (0..usize::try_from(argc).ok()?)
        .map(|index| unsafe { CStr::from_ptr(*argv.add(index)) })
        .collect();
    Some(match arguments.as_slice() {
        [] => Mode::SignIn,
        [argument] => method(argument.to_bytes())?,
        _ => return None,
    })
}

fn method(name: &[u8]) -> Option<Mode> {
    Some(match name {
        b"password" => Mode::Password,
        b"verified" => Mode::Verified,
        b"security-key" => Mode::Way(Way::SecurityKey),
        b"smart-card" => Mode::Way(Way::SmartCard),
        b"recovery-key" => Mode::Way(Way::RecoveryKey),
        _ => return None,
    })
}

fn question(question: Question) -> (&'static str, bool) {
    match question {
        Question::KeyPin => (KEY_PIN, false),
        Question::CardPin => (CARD_PIN, false),
        Question::RecoveryKey => (RECOVERY_KEY, true),
    }
}

fn notice(notice: Notice) -> &'static str {
    match notice {
        Notice::PlugInKey => PLUG_IN_KEY,
        Notice::TouchKey => TOUCH_KEY,
        Notice::InsertCard => INSERT_CARD,
    }
}

fn explain(handle: &Handle, problem: &Problem) {
    let text = match problem {
        Problem::WrongPin { .. } => WRONG_PIN,
        Problem::Blocked => BLOCKED,
        Problem::NothingEnrolled | Problem::NotEnrolledHere => NOT_ENROLLED,
        Problem::WrongRecoveryKey => WRONG_RECOVERY_KEY,
        Problem::TimedOut => return,
        Problem::Failed(reason) => {
            eprintln!("pam_luft_sign_in: {reason}");
            return;
        }
    };
    handle.tell(text, true);
}

fn verify(handle: &Handle, user: &str, way: Way) -> c_int {
    let outcome = service::verify(user, way, |reply| match reply {
        Reply::Ask(asked) => {
            let (text, visible) = question(*asked);
            handle.ask(text, visible)
        }
        Reply::Tell(told) => {
            handle.tell(notice(*told), false);
            Some(Vec::new())
        }
        _ => Some(Vec::new()),
    });
    match outcome {
        Some(Reply::Verified(token)) => {
            if token.is_some_and(|token| !handle.stash_token(&token)) || !handle.mark(VERIFIED) {
                return PAM_SERVICE_ERR;
            }
            PAM_SUCCESS
        }
        Some(Reply::PasswordBack) => {
            handle.tell(PASSWORD_BACK, false);
            PAM_IGNORE
        }
        Some(Reply::Refused(problem)) => {
            explain(handle, &problem);
            PAM_AUTH_ERR
        }
        _ => PAM_AUTH_ERR,
    }
}

/// Lets the password decide only while it may: someone who turned it off
/// signs in another way, unless nothing else is left.
fn password(handle: &Handle, user: &str) -> c_int {
    if service::password_allowed(user) {
        PAM_IGNORE
    } else {
        handle.tell(PASSWORD_OFF, true);
        PAM_AUTH_ERR
    }
}

/// Whether a security key or card signed this person in earlier in the same
/// rules, so the password's rules after it can be skipped.
fn verified(handle: &Handle) -> c_int {
    if handle.has_data(VERIFIED) {
        PAM_SUCCESS
    } else {
        PAM_IGNORE
    }
}

fn authenticate(handle: &Handle, mode: Mode) -> c_int {
    if mode == Mode::Verified {
        return verified(handle);
    }
    let Some(user) = handle.user() else {
        return PAM_USER_UNKNOWN;
    };
    let mode = match mode {
        Mode::SignIn => match handle.text_data(METHOD).as_deref() {
            Some("fingerprint") if handle.has_data(FINGERPRINT_VERIFIED) => return PAM_IGNORE,
            Some(name) => method(name.as_bytes()).unwrap_or(Mode::Password),
            None => Mode::Password,
        },
        mode => mode,
    };
    match mode {
        Mode::Way(way) => verify(handle, &user, way),
        _ => password(handle, &user),
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn pam_sm_authenticate(
    pamh: *mut PamHandle,
    _: c_int,
    argc: c_int,
    argv: *const *const c_char,
) -> c_int {
    let Some(mode) = mode(argc, argv) else {
        return PAM_SERVICE_ERR;
    };
    catch_unwind(AssertUnwindSafe(|| authenticate(&Handle(pamh), mode))).unwrap_or(PAM_SERVICE_ERR)
}

#[unsafe(no_mangle)]
pub extern "C" fn pam_sm_setcred(
    pamh: *mut PamHandle,
    _: c_int,
    _: c_int,
    _: *const *const c_char,
) -> c_int {
    verified(&Handle(pamh))
}
