//! The parts of SANE's C interface Flatbed uses, loaded from the system's
//! `libsane.so.1` when it's there.

use std::ffi::{CStr, CString, c_char, c_int, c_void};
use std::ptr;

use libloading::Library;

pub type Word = c_int;
type Handle = *mut c_void;

pub const STATUS_GOOD: Word = 0;
pub const STATUS_CANCELLED: Word = 2;
pub const STATUS_DEVICE_BUSY: Word = 3;
pub const STATUS_EOF: Word = 5;
pub const STATUS_NO_DOCS: Word = 7;

pub const TYPE_FIXED: Word = 2;
pub const TYPE_STRING: Word = 3;

const CONSTRAINT_RANGE: Word = 1;
const CONSTRAINT_WORD_LIST: Word = 2;
const CONSTRAINT_STRING_LIST: Word = 3;

const ACTION_SET: c_int = 1;

const CAP_SOFT_SELECT: Word = 1;
const CAP_INACTIVE: Word = 32;

pub const FRAME_GRAY: Word = 0;
pub const FRAME_RGB: Word = 1;

#[repr(C)]
pub struct RawDevice {
    name: *const c_char,
    vendor: *const c_char,
    model: *const c_char,
    kind: *const c_char,
}

#[repr(C)]
struct Range {
    min: Word,
    max: Word,
    quant: Word,
}

#[repr(C)]
struct OptionDescriptor {
    name: *const c_char,
    title: *const c_char,
    desc: *const c_char,
    value_type: Word,
    unit: Word,
    size: Word,
    cap: Word,
    constraint_type: Word,
    constraint: *const c_void,
}

#[repr(C)]
#[derive(Default)]
pub struct Parameters {
    pub format: Word,
    pub last_frame: Word,
    pub bytes_per_line: Word,
    pub pixels_per_line: Word,
    pub lines: Word,
    pub depth: Word,
}

type Init = unsafe extern "C" fn(*mut Word, *const c_void) -> Word;
type Exit = unsafe extern "C" fn();
type GetDevices = unsafe extern "C" fn(*mut *const *const RawDevice, Word) -> Word;
type Open = unsafe extern "C" fn(*const c_char, *mut Handle) -> Word;
type Close = unsafe extern "C" fn(Handle);
type GetOption = unsafe extern "C" fn(Handle, Word) -> *const OptionDescriptor;
type ControlOption = unsafe extern "C" fn(Handle, Word, c_int, *mut c_void, *mut Word) -> Word;
type Start = unsafe extern "C" fn(Handle) -> Word;
type GetParameters = unsafe extern "C" fn(Handle, *mut Parameters) -> Word;
type Read = unsafe extern "C" fn(Handle, *mut u8, Word, *mut Word) -> Word;
type Cancel = unsafe extern "C" fn(Handle);
type StrStatus = unsafe extern "C" fn(Word) -> *const c_char;

pub struct Sane {
    exit: Exit,
    get_devices: GetDevices,
    open: Open,
    close: Close,
    get_option: GetOption,
    control_option: ControlOption,
    start: Start,
    get_parameters: GetParameters,
    read: Read,
    cancel: Cancel,
    str_status: StrStatus,
    _library: Library,
}

pub struct Device {
    pub name: String,
    pub vendor: String,
    pub model: String,
    pub kind: String,
}

/// An option of an open scanner, as SANE describes it.
pub struct Setting {
    index: Word,
    pub name: String,
    pub value_type: Word,
    pub strings: Vec<String>,
    pub words: Vec<Word>,
    pub range: Option<(Word, Word)>,
}

/// # Safety
/// `T` must be the function type the library's symbol has.
unsafe fn symbol<T: Copy>(library: &Library, name: &[u8]) -> Result<T, String> {
    // SAFETY: the caller vouches for the type.
    unsafe { library.get::<T>(name) }
        .map(|symbol| *symbol)
        .map_err(|error| error.to_string())
}

fn text(pointer: *const c_char) -> String {
    if pointer.is_null() {
        return String::new();
    }
    // SAFETY: SANE hands out NUL-terminated strings that live as long as what they describe.
    unsafe { CStr::from_ptr(pointer) }
        .to_string_lossy()
        .into_owned()
}

impl Sane {
    pub fn load() -> Result<Self, String> {
        // SAFETY: libsane is a plain C library whose initializers have no requirements.
        let library = unsafe { Library::new("libsane.so.1") }.map_err(|error| error.to_string())?;
        // SAFETY: every symbol has the type SANE's header declares for it.
        let sane = unsafe {
            let init: Init = symbol(&library, b"sane_init\0")?;
            let mut version = 0;
            let status = init(&mut version, ptr::null());
            let str_status: StrStatus = symbol(&library, b"sane_strstatus\0")?;
            if status != STATUS_GOOD {
                return Err(text(str_status(status)));
            }
            Self {
                exit: symbol(&library, b"sane_exit\0")?,
                get_devices: symbol(&library, b"sane_get_devices\0")?,
                open: symbol(&library, b"sane_open\0")?,
                close: symbol(&library, b"sane_close\0")?,
                get_option: symbol(&library, b"sane_get_option_descriptor\0")?,
                control_option: symbol(&library, b"sane_control_option\0")?,
                start: symbol(&library, b"sane_start\0")?,
                get_parameters: symbol(&library, b"sane_get_parameters\0")?,
                read: symbol(&library, b"sane_read\0")?,
                cancel: symbol(&library, b"sane_cancel\0")?,
                str_status,
                _library: library,
            }
        };
        Ok(sane)
    }

    pub fn status_text(&self, status: Word) -> String {
        // SAFETY: sane_strstatus takes any status and returns a static string.
        text(unsafe { (self.str_status)(status) })
    }

    pub fn devices(&self) -> Result<Vec<Device>, String> {
        let mut list: *const *const RawDevice = ptr::null();
        // SAFETY: SANE fills `list` with a NULL-terminated array it owns until the next call.
        let status = unsafe { (self.get_devices)(&mut list, 0) };
        if status != STATUS_GOOD {
            return Err(self.status_text(status));
        }
        let mut devices = Vec::new();
        let mut at = list;
        // SAFETY: walking the NULL-terminated array SANE returned.
        unsafe {
            while !at.is_null() && !(*at).is_null() {
                let raw = &**at;
                devices.push(Device {
                    name: text(raw.name),
                    vendor: text(raw.vendor),
                    model: text(raw.model),
                    kind: text(raw.kind),
                });
                at = at.add(1);
            }
        }
        Ok(devices)
    }

    pub fn open(&self, name: &str) -> Result<Opened<'_>, String> {
        let name = CString::new(name).map_err(|error| error.to_string())?;
        let mut handle: Handle = ptr::null_mut();
        // SAFETY: `name` is NUL-terminated and SANE writes the handle on success.
        let status = unsafe { (self.open)(name.as_ptr(), &mut handle) };
        if status != STATUS_GOOD {
            return Err(self.status_text(status));
        }
        Ok(Opened { sane: self, handle })
    }
}

impl Drop for Sane {
    fn drop(&mut self) {
        // SAFETY: every device was closed with its `Opened`, which borrows this.
        unsafe { (self.exit)() };
    }
}

/// A scanner SANE opened, closed when dropped.
pub struct Opened<'a> {
    sane: &'a Sane,
    handle: Handle,
}

/// A handle that can be cancelled from another thread, as SANE allows.
#[derive(Clone, Copy)]
pub struct Canceller {
    cancel: Cancel,
    handle: usize,
}

impl Canceller {
    pub fn cancel(self) {
        // SAFETY: SANE lets sane_cancel run from anywhere while a scan reads.
        unsafe { (self.cancel)(self.handle as Handle) };
    }
}

impl Opened<'_> {
    pub fn canceller(&self) -> Canceller {
        Canceller {
            cancel: self.sane.cancel,
            handle: self.handle as usize,
        }
    }

    pub fn settings(&self) -> Vec<Setting> {
        (1..)
            .map_while(|index| {
                // SAFETY: SANE returns NULL past the last option.
                let descriptor = unsafe { (self.sane.get_option)(self.handle, index) };
                // SAFETY: a non-NULL descriptor stays valid until options change.
                (!descriptor.is_null()).then(|| (index, unsafe { &*descriptor }))
            })
            .filter(|(_, descriptor)| {
                descriptor.cap & CAP_INACTIVE == 0 && descriptor.cap & CAP_SOFT_SELECT != 0
            })
            .map(|(index, descriptor)| {
                let mut setting = Setting {
                    index,
                    name: text(descriptor.name),
                    value_type: descriptor.value_type,
                    strings: Vec::new(),
                    words: Vec::new(),
                    range: None,
                };
                // SAFETY: the constraint is the kind `constraint_type` says.
                unsafe {
                    match descriptor.constraint_type {
                        CONSTRAINT_STRING_LIST => {
                            let mut at = descriptor.constraint as *const *const c_char;
                            while !(*at).is_null() {
                                setting.strings.push(text(*at));
                                at = at.add(1);
                            }
                        }
                        CONSTRAINT_WORD_LIST => {
                            let list = descriptor.constraint as *const Word;
                            let count = *list as usize;
                            setting.words = std::slice::from_raw_parts(list.add(1), count).to_vec();
                        }
                        CONSTRAINT_RANGE => {
                            let range = &*(descriptor.constraint as *const Range);
                            setting.range = Some((range.min, range.max));
                        }
                        _ => {}
                    }
                }
                setting
            })
            .collect()
    }

    pub fn set_word(&self, setting: &Setting, mut value: Word) -> Result<(), String> {
        // SAFETY: a word option takes a pointer to one word.
        self.control(setting, (&raw mut value).cast())
    }

    pub fn set_string(&self, setting: &Setting, value: &str) -> Result<(), String> {
        let mut bytes = value.as_bytes().to_vec();
        bytes.resize(bytes.len().max(256), 0);
        self.control(setting, bytes.as_mut_ptr().cast())
    }

    fn control(&self, setting: &Setting, value: *mut c_void) -> Result<(), String> {
        let mut info = 0;
        // SAFETY: `value` points at storage of the option's type and size.
        let status = unsafe {
            (self.sane.control_option)(self.handle, setting.index, ACTION_SET, value, &mut info)
        };
        if status != STATUS_GOOD {
            return Err(self.sane.status_text(status));
        }
        Ok(())
    }

    pub fn start(&self) -> Word {
        // SAFETY: the handle is open.
        unsafe { (self.sane.start)(self.handle) }
    }

    pub fn parameters(&self) -> Result<Parameters, String> {
        let mut parameters = Parameters::default();
        // SAFETY: SANE fills the struct.
        let status = unsafe { (self.sane.get_parameters)(self.handle, &mut parameters) };
        if status != STATUS_GOOD {
            return Err(self.sane.status_text(status));
        }
        Ok(parameters)
    }

    /// Reads into `buffer`, giving the bytes read or the status that ended it.
    pub fn read(&self, buffer: &mut [u8]) -> Result<usize, Word> {
        let mut length = 0;
        // SAFETY: SANE writes at most `buffer.len()` bytes.
        let status = unsafe {
            (self.sane.read)(
                self.handle,
                buffer.as_mut_ptr(),
                buffer.len() as Word,
                &mut length,
            )
        };
        if status == STATUS_GOOD {
            Ok(length as usize)
        } else {
            Err(status)
        }
    }

    pub fn cancel(&self) {
        self.canceller().cancel();
    }

    pub fn status_text(&self, status: Word) -> String {
        self.sane.status_text(status)
    }
}

impl Drop for Opened<'_> {
    fn drop(&mut self) {
        // SAFETY: the handle is open and closed only here.
        unsafe { (self.sane.close)(self.handle) };
    }
}
