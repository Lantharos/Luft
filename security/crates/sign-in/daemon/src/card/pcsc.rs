use std::ffi::{CString, c_char, c_long, c_ulong, c_void};
use std::ptr;
use std::sync::OnceLock;

use libloading::Library;

type Context = c_long;
type Handle = c_long;

const SCOPE_SYSTEM: c_ulong = 2;
const SHARE_DIRECT: c_ulong = 3;
const LEAVE_CARD: c_ulong = 0;
const ATTR_CHANNEL_ID: c_ulong = 0x0002_0110;
const STATE_CHANGED: c_ulong = 0x0002;
const STATE_UNKNOWN: c_ulong = 0x0004;
const STATE_EMPTY: c_ulong = 0x0010;
const STATE_PRESENT: c_ulong = 0x0020;
const USB_CHANNEL: u32 = 0x0020;
const INFINITE: c_ulong = 0xFFFF_FFFF;

#[repr(C)]
struct ReaderState {
    reader: *const c_char,
    user_data: *mut c_void,
    current_state: c_ulong,
    event_state: c_ulong,
    atr_length: c_ulong,
    atr: [u8; 33],
}

#[allow(non_snake_case)]
struct PcscLite {
    _library: Library,
    SCardEstablishContext:
        unsafe extern "C" fn(c_ulong, *const c_void, *const c_void, *mut Context) -> c_long,
    SCardReleaseContext: unsafe extern "C" fn(Context) -> c_long,
    SCardListReaders:
        unsafe extern "C" fn(Context, *const c_char, *mut c_char, *mut c_ulong) -> c_long,
    SCardGetStatusChange:
        unsafe extern "C" fn(Context, c_ulong, *mut ReaderState, c_ulong) -> c_long,
    SCardCancel: unsafe extern "C" fn(Context) -> c_long,
    SCardConnect: unsafe extern "C" fn(
        Context,
        *const c_char,
        c_ulong,
        c_ulong,
        *mut Handle,
        *mut c_ulong,
    ) -> c_long,
    SCardDisconnect: unsafe extern "C" fn(Handle, c_ulong) -> c_long,
    SCardGetAttrib: unsafe extern "C" fn(Handle, c_ulong, *mut u8, *mut c_ulong) -> c_long,
}

impl PcscLite {
    fn load() -> Result<Self, libloading::Error> {
        let library = unsafe { Library::new("libpcsclite.so.1")? };
        unsafe {
            Ok(Self {
                SCardEstablishContext: *library.get(b"SCardEstablishContext\0")?,
                SCardReleaseContext: *library.get(b"SCardReleaseContext\0")?,
                SCardListReaders: *library.get(b"SCardListReaders\0")?,
                SCardGetStatusChange: *library.get(b"SCardGetStatusChange\0")?,
                SCardCancel: *library.get(b"SCardCancel\0")?,
                SCardConnect: *library.get(b"SCardConnect\0")?,
                SCardDisconnect: *library.get(b"SCardDisconnect\0")?,
                SCardGetAttrib: *library.get(b"SCardGetAttrib\0")?,
                _library: library,
            })
        }
    }
}

fn pcsc() -> Option<&'static PcscLite> {
    static PCSC: OnceLock<Option<PcscLite>> = OnceLock::new();
    PCSC.get_or_init(|| PcscLite::load().ok()).as_ref()
}

/// A connection to pcscd, the service that owns every card reader.
pub struct Readers {
    pcsc: &'static PcscLite,
    context: Context,
}

unsafe impl Send for Readers {}
unsafe impl Sync for Readers {}

/// Where a USB reader sits, as pcscd's driver reports it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct UsbAddress {
    pub bus: u8,
    pub device: u8,
}

pub enum Change {
    CardGone,
    ReaderGone,
    Stopped,
}

impl Readers {
    pub fn connect() -> Option<Self> {
        let pcsc = pcsc()?;
        let mut context = 0;
        let status = unsafe {
            (pcsc.SCardEstablishContext)(SCOPE_SYSTEM, ptr::null(), ptr::null(), &raw mut context)
        };
        (status == 0).then_some(Self { pcsc, context })
    }

    pub fn names(&self) -> Vec<String> {
        let mut length = 0;
        if unsafe {
            (self.pcsc.SCardListReaders)(
                self.context,
                ptr::null(),
                ptr::null_mut(),
                &raw mut length,
            )
        } != 0
        {
            return Vec::new();
        }
        let mut buffer = vec![0 as c_char; usize::try_from(length).unwrap_or(0)];
        if unsafe {
            (self.pcsc.SCardListReaders)(
                self.context,
                ptr::null(),
                buffer.as_mut_ptr(),
                &raw mut length,
            )
        } != 0
        {
            return Vec::new();
        }
        let bytes: Vec<u8> = buffer.iter().map(|byte| *byte as u8).collect();
        bytes
            .split(|byte| *byte == 0)
            .filter(|name| !name.is_empty())
            .map(|name| String::from_utf8_lossy(name).into_owned())
            .collect()
    }

    pub fn usb_address(&self, reader: &str) -> Option<UsbAddress> {
        let name = CString::new(reader).ok()?;
        let mut handle = 0;
        let mut protocol = 0;
        if unsafe {
            (self.pcsc.SCardConnect)(
                self.context,
                name.as_ptr(),
                SHARE_DIRECT,
                0,
                &raw mut handle,
                &raw mut protocol,
            )
        } != 0
        {
            return None;
        }
        let mut value = [0u8; 4];
        let mut length = value.len() as c_ulong;
        let read = unsafe {
            (self.pcsc.SCardGetAttrib)(handle, ATTR_CHANNEL_ID, value.as_mut_ptr(), &raw mut length)
        };
        unsafe { (self.pcsc.SCardDisconnect)(handle, LEAVE_CARD) };
        let channel = u32::from_le_bytes(value);
        (read == 0 && length == 4 && channel >> 16 == USB_CHANNEL).then_some(UsbAddress {
            bus: (channel >> 8) as u8,
            device: channel as u8,
        })
    }

    /// Waits until the card in `reader` comes out or the reader goes away,
    /// or [`Readers::stop`] is called from elsewhere.
    pub fn wait_for_removal(&self, reader: &str) -> Change {
        let Ok(name) = CString::new(reader) else {
            return Change::ReaderGone;
        };
        let mut state = ReaderState {
            reader: name.as_ptr(),
            user_data: ptr::null_mut(),
            current_state: 0,
            event_state: 0,
            atr_length: 0,
            atr: [0; 33],
        };
        loop {
            let status = unsafe {
                (self.pcsc.SCardGetStatusChange)(self.context, INFINITE, &raw mut state, 1)
            };
            if status != 0 {
                return if self.names().iter().any(|known| known == reader) {
                    Change::Stopped
                } else {
                    Change::ReaderGone
                };
            }
            let now = state.event_state;
            if now & STATE_UNKNOWN != 0 {
                return Change::ReaderGone;
            }
            if now & STATE_EMPTY != 0 || now & STATE_PRESENT == 0 {
                return Change::CardGone;
            }
            state.current_state = now & !STATE_CHANGED;
        }
    }

    pub fn stop(&self) {
        unsafe { (self.pcsc.SCardCancel)(self.context) };
    }
}

impl Drop for Readers {
    fn drop(&mut self) {
        unsafe { (self.pcsc.SCardReleaseContext)(self.context) };
    }
}

/// The reader a PKCS #11 slot description names, which is the reader's name
/// cut to 64 bytes.
pub fn reader_named<'a>(readers: &'a [String], description: &str) -> Option<&'a String> {
    let description = description.trim_end().trim_end_matches("...");
    readers
        .iter()
        .find(|reader| reader.starts_with(description))
}
