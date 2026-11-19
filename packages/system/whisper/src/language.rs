use std::ffi::{CStr, CString};

use crate::sys;

/// Whisper's number for a language code such as "sq" or "de".
pub fn id(code: &str) -> Option<usize> {
    let code = CString::new(code).ok()?;
    usize::try_from(unsafe { sys::whisper_lang_id(code.as_ptr()) }).ok()
}

/// The codes of every language Whisper knows, in the order of its numbers.
pub fn all() -> impl Iterator<Item = &'static str> {
    let last = unsafe { sys::whisper_lang_max_id() };
    (0..=last).filter_map(|id| {
        let code = unsafe { sys::whisper_lang_str(id) };
        if code.is_null() {
            return None;
        }
        unsafe { CStr::from_ptr(code) }.to_str().ok()
    })
}

pub(crate) fn count() -> usize {
    usize::try_from(unsafe { sys::whisper_lang_max_id() } + 1).unwrap_or(0)
}
