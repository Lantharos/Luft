use std::cell::Cell;
use std::ffi::{CStr, c_char, c_int, c_void};
use std::ptr;

const SERVICE: &CStr = c"kestrel-password";
const SUCCESS: c_int = 0;
const BUFFER_ERROR: c_int = 5;
const AUTHTOK_ERROR: c_int = 20;
const CONVERSATION_ERROR: c_int = 19;
const PROMPT_ECHO_OFF: c_int = 1;
const PROMPT_ECHO_ON: c_int = 2;

#[repr(C)]
struct Handle {
    _private: [u8; 0],
}

#[repr(C)]
struct Message {
    style: c_int,
    text: *const c_char,
}

#[repr(C)]
struct Response {
    text: *mut c_char,
    code: c_int,
}

#[repr(C)]
struct Conversation {
    converse: extern "C" fn(c_int, *mut *const Message, *mut *mut Response, *mut c_void) -> c_int,
    data: *mut c_void,
}

#[link(name = "pam")]
unsafe extern "C" {
    fn pam_start(
        service: *const c_char,
        user: *const c_char,
        conversation: *const Conversation,
        handle: *mut *mut Handle,
    ) -> c_int;
    fn pam_authenticate(handle: *mut Handle, flags: c_int) -> c_int;
    fn pam_chauthtok(handle: *mut Handle, flags: c_int) -> c_int;
    fn pam_end(handle: *mut Handle, status: c_int) -> c_int;
}

struct Answers<'a> {
    password: Cell<&'a CStr>,
}

extern "C" fn converse(
    count: c_int,
    messages: *mut *const Message,
    responses: *mut *mut Response,
    data: *mut c_void,
) -> c_int {
    let Ok(count) = usize::try_from(count) else {
        return CONVERSATION_ERROR;
    };
    let answers = unsafe { &*data.cast::<Answers>() };
    let replies = unsafe { libc::calloc(count, size_of::<Response>()) }.cast::<Response>();
    if replies.is_null() {
        return BUFFER_ERROR;
    }
    for index in 0..count {
        let message = unsafe { &**messages.add(index) };
        if matches!(message.style, PROMPT_ECHO_OFF | PROMPT_ECHO_ON) {
            unsafe { (*replies.add(index)).text = libc::strdup(answers.password.get().as_ptr()) };
        }
    }
    unsafe { *responses = replies };
    SUCCESS
}

pub enum Outcome {
    Changed,
    WrongPassword,
    Refused,
    Failed(c_int),
}

pub fn change(user: &CStr, current: &CStr, new: &CStr) -> Outcome {
    let answers = Answers {
        password: Cell::new(current),
    };
    let conversation = Conversation {
        converse,
        data: (&raw const answers).cast_mut().cast(),
    };
    let mut handle = ptr::null_mut();
    let started = unsafe {
        pam_start(
            SERVICE.as_ptr(),
            user.as_ptr(),
            &raw const conversation,
            &raw mut handle,
        )
    };
    if started != SUCCESS {
        return Outcome::Failed(started);
    }
    let authenticated = unsafe { pam_authenticate(handle, 0) };
    let status = if authenticated == SUCCESS {
        answers.password.set(new);
        unsafe { pam_chauthtok(handle, 0) }
    } else {
        authenticated
    };
    unsafe { pam_end(handle, status) };
    match (authenticated, status) {
        (SUCCESS, SUCCESS) => Outcome::Changed,
        (SUCCESS, AUTHTOK_ERROR) => Outcome::Refused,
        (SUCCESS, status) => Outcome::Failed(status),
        _ => Outcome::WrongPassword,
    }
}
