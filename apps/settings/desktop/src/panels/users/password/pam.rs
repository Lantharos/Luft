use std::ffi::{CString, c_char, c_int, c_void};
use std::ptr;

const SERVICE: &std::ffi::CStr = c"password-auth";
const SUCCESS: c_int = 0;
const BUFFER_ERROR: c_int = 5;
const PROMPT_ECHO_OFF: c_int = 1;
const PROMPT_ECHO_ON: c_int = 2;
const SILENT: c_int = 0x8000;

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

type Converse = extern "C" fn(c_int, *mut *const Message, *mut *mut Response, *mut c_void) -> c_int;

#[repr(C)]
struct Conversation {
    converse: Converse,
    data: *mut c_void,
}

#[link(name = "pam")]
unsafe extern "C" {
    fn pam_start(
        service: *const c_char,
        user: *const c_char,
        conversation: *const Conversation,
        handle: *mut *mut c_void,
    ) -> c_int;
    fn pam_authenticate(handle: *mut c_void, flags: c_int) -> c_int;
    fn pam_end(handle: *mut c_void, status: c_int) -> c_int;
}

extern "C" fn converse(
    count: c_int,
    messages: *mut *const Message,
    responses: *mut *mut Response,
    password: *mut c_void,
) -> c_int {
    let count = count as usize;
    unsafe {
        let replies = libc::calloc(count, size_of::<Response>()).cast::<Response>();
        if replies.is_null() {
            return BUFFER_ERROR;
        }
        for index in 0..count {
            let message = *messages.add(index);
            if matches!((*message).style, PROMPT_ECHO_OFF | PROMPT_ECHO_ON) {
                (*replies.add(index)).text = libc::strdup(password.cast());
            }
        }
        *responses = replies;
    }
    SUCCESS
}

pub fn verify(user: &str, password: &str) -> bool {
    let (Ok(user), Ok(password)) = (CString::new(user), CString::new(password)) else {
        return false;
    };
    let conversation = Conversation {
        converse,
        data: password.as_ptr().cast_mut().cast(),
    };
    let mut handle = ptr::null_mut();
    unsafe {
        if pam_start(SERVICE.as_ptr(), user.as_ptr(), &conversation, &mut handle) != SUCCESS {
            return false;
        }
        let status = pam_authenticate(handle, SILENT);
        pam_end(handle, status);
        status == SUCCESS
    }
}
