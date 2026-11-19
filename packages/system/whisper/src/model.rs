use std::ffi::{CStr, CString, c_char, c_int, c_void};
use std::fmt;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;
use std::ptr::{self, NonNull};

use crate::{language, sys};

#[derive(Debug)]
pub struct Error(&'static str);

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str(self.0)
    }
}

impl std::error::Error for Error {}

/// How to listen to a stretch of audio.
pub struct Listen<'a> {
    pub language: &'a str,
    pub threads: usize,
    /// Each sentence on its own with when it was said, instead of all of it as one.
    pub timed: bool,
    /// Listen again more loosely when the first try comes out unsure.
    pub retry: bool,
}

pub struct Segment {
    pub text: String,
    /// Hundredths of a second from the start of the audio.
    pub start: i64,
    pub end: i64,
    pub not_speech: f32,
}

/// A model loaded on the GPU when there is one, with the state one stretch of audio at a time
/// is heard through.
pub struct Whisper {
    context: NonNull<sys::whisper_context>,
    state: NonNull<sys::whisper_state>,
}

unsafe impl Send for Whisper {}

unsafe extern "C" fn ignore(_: sys::ggml_log_level, _: *const c_char, _: *mut c_void) {}

fn threads(threads: usize) -> c_int {
    c_int::try_from(threads.max(1)).unwrap_or(c_int::MAX)
}

impl Whisper {
    pub fn load(path: &Path) -> Result<Self, Error> {
        unsafe { sys::whisper_log_set(Some(ignore), ptr::null_mut()) };
        let path = CString::new(path.as_os_str().as_bytes())
            .map_err(|_| Error("the model's path has a zero byte"))?;
        let mut parameters = unsafe { sys::whisper_context_default_params() };
        parameters.use_gpu = true;
        parameters.flash_attn = true;
        let context = NonNull::new(unsafe {
            sys::whisper_init_from_file_with_params_no_state(path.as_ptr(), parameters)
        })
        .ok_or(Error("the model couldn't be read"))?;
        let Some(state) = NonNull::new(unsafe { sys::whisper_init_state(context.as_ptr()) }) else {
            unsafe { sys::whisper_free(context.as_ptr()) };
            return Err(Error("there isn't enough memory for the model"));
        };
        Ok(Self { context, state })
    }

    pub fn listen(&mut self, audio: &[f32], listen: &Listen) -> Result<Vec<Segment>, Error> {
        let language =
            CString::new(listen.language).map_err(|_| Error("the language has a zero byte"))?;
        let length = c_int::try_from(audio.len()).map_err(|_| Error("the audio is too long"))?;
        let mut parameters = unsafe {
            sys::whisper_full_default_params(sys::whisper_sampling_strategy_WHISPER_SAMPLING_GREEDY)
        };
        parameters.greedy.best_of = 1;
        parameters.language = language.as_ptr();
        parameters.n_threads = threads(listen.threads);
        parameters.no_context = true;
        parameters.no_timestamps = !listen.timed;
        parameters.single_segment = !listen.timed;
        parameters.suppress_blank = true;
        parameters.suppress_nst = true;
        parameters.print_progress = false;
        parameters.print_realtime = false;
        parameters.print_special = false;
        parameters.print_timestamps = false;
        if !listen.retry {
            parameters.temperature_inc = 0.0;
        }
        let heard = unsafe {
            sys::whisper_full_with_state(
                self.context.as_ptr(),
                self.state.as_ptr(),
                parameters,
                audio.as_ptr(),
                length,
            )
        };
        if heard != 0 {
            return Err(Error("the audio couldn't be heard"));
        }
        Ok(self.segments())
    }

    fn segments(&self) -> Vec<Segment> {
        let state = self.state.as_ptr();
        let count = unsafe { sys::whisper_full_n_segments_from_state(state) };
        (0..count)
            .map(|index| {
                let text = unsafe { sys::whisper_full_get_segment_text_from_state(state, index) };
                Segment {
                    text: if text.is_null() {
                        String::new()
                    } else {
                        unsafe { CStr::from_ptr(text) }
                            .to_string_lossy()
                            .into_owned()
                    },
                    start: unsafe { sys::whisper_full_get_segment_t0_from_state(state, index) },
                    end: unsafe { sys::whisper_full_get_segment_t1_from_state(state, index) },
                    not_speech: unsafe {
                        sys::whisper_full_get_segment_no_speech_prob_from_state(state, index)
                    },
                }
            })
            .collect()
    }

    /// How likely each language is to be the one spoken, by Whisper's language numbers.
    pub fn languages(&mut self, audio: &[f32], threads: usize) -> Result<Vec<f32>, Error> {
        let length = c_int::try_from(audio.len()).map_err(|_| Error("the audio is too long"))?;
        let threads = self::threads(threads);
        let (context, state) = (self.context.as_ptr(), self.state.as_ptr());
        if unsafe {
            sys::whisper_pcm_to_mel_with_state(context, state, audio.as_ptr(), length, threads)
        } != 0
        {
            return Err(Error("the audio couldn't be heard"));
        }
        let mut chances = vec![0.0; language::count()];
        if unsafe {
            sys::whisper_lang_auto_detect_with_state(
                context,
                state,
                0,
                threads,
                chances.as_mut_ptr(),
            )
        } < 0
        {
            return Err(Error("the language couldn't be told"));
        }
        Ok(chances)
    }
}

impl Drop for Whisper {
    fn drop(&mut self) {
        unsafe {
            sys::whisper_free_state(self.state.as_ptr());
            sys::whisper_free(self.context.as_ptr());
        }
    }
}
