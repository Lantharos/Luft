use std::ffi::{CStr, CString, c_char, c_int, c_uint, c_void};

use libloading::Library;

pub const FORM_TEXT: c_int = 1;
pub const FORM_PASSWORD: c_int = 2;
pub const FORM_SELECT: c_int = 3;
pub const FORM_IGNORE: c_uint = 0x0001;
pub const FORM_OK: c_int = 0;
pub const FORM_CANCELLED: c_int = 1;
pub const FORM_NEW_GROUP: c_int = 2;
pub const PROGRESS_ERROR: c_int = 0;

#[repr(C)]
pub struct Info {
    _private: [u8; 0],
}

#[repr(C)]
pub struct FormOption {
    pub next: *mut FormOption,
    pub kind: c_int,
    pub name: *mut c_char,
    pub label: *mut c_char,
    pub value: *mut c_char,
    pub flags: c_uint,
    reserved: *mut c_void,
}

#[repr(C)]
pub struct Choice {
    pub name: *mut c_char,
    pub label: *mut c_char,
    auth_type: *mut c_char,
    override_name: *mut c_char,
    override_label: *mut c_char,
}

#[repr(C)]
pub struct SelectOption {
    pub form: FormOption,
    pub choice_count: c_int,
    pub choices: *mut *mut Choice,
}

#[repr(C)]
pub struct AuthForm {
    pub banner: *mut c_char,
    pub message: *mut c_char,
    pub error: *mut c_char,
    pub auth_id: *mut c_char,
    method: *mut c_char,
    action: *mut c_char,
    pub options: *mut FormOption,
    pub group: *mut SelectOption,
    pub group_selection: c_int,
}

pub type Validate = unsafe extern "C" fn(*mut c_void, *const c_char) -> c_int;
pub type WriteConfig = unsafe extern "C" fn(*mut c_void, *const c_char, c_int) -> c_int;
pub type ProcessForm = unsafe extern "C" fn(*mut c_void, *mut AuthForm) -> c_int;
pub type Progress = unsafe extern "C" fn(*mut c_void, c_int, *const c_char, ...);
pub type Browse = unsafe extern "C" fn(*mut Info, *const c_char, *mut c_void) -> c_int;

pub struct Callbacks {
    pub validate: Validate,
    pub write_config: WriteConfig,
    pub process_form: ProcessForm,
    pub progress: Progress,
    pub browse: Browse,
}

pub fn text(pointer: *const c_char) -> Option<String> {
    (!pointer.is_null()).then(|| {
        unsafe { CStr::from_ptr(pointer) }
            .to_string_lossy()
            .into_owned()
    })
}

fn c_string(value: &str) -> CString {
    CString::new(value.replace('\0', "")).unwrap_or_default()
}

pub struct OpenConnect {
    library: Library,
    info: *mut Info,
}

macro_rules! call {
    ($self:expr, $name:literal, $signature:ty, $($argument:expr),*) => {{
        let function = unsafe { $self.library.get::<$signature>(concat!($name, "\0").as_bytes()) }
            .unwrap_or_else(|error| panic!("libopenconnect lacks {}: {error}", $name));
        unsafe { function($($argument),*) }
    }};
}

impl OpenConnect {
    pub fn load(
        user_agent: &str,
        callbacks: &Callbacks,
        session: *mut c_void,
    ) -> Result<Self, String> {
        let library = unsafe { Library::new("libopenconnect.so.5") }
            .map_err(|error| format!("OpenConnect isn't installed: {error}"))?;
        let mut this = Self {
            library,
            info: std::ptr::null_mut(),
        };
        call!(
            this,
            "openconnect_init_ssl",
            unsafe extern "C" fn() -> c_int,
        );
        let agent = c_string(user_agent);
        this.info = call!(
            this,
            "openconnect_vpninfo_new",
            unsafe extern "C" fn(
                *const c_char,
                Validate,
                WriteConfig,
                ProcessForm,
                Progress,
                *mut c_void,
            ) -> *mut Info,
            agent.as_ptr(),
            callbacks.validate,
            callbacks.write_config,
            callbacks.process_form,
            callbacks.progress,
            session
        );
        if this.info.is_null() {
            return Err("OpenConnect couldn't start".to_owned());
        }
        call!(
            this,
            "openconnect_set_external_browser_callback",
            unsafe extern "C" fn(*mut Info, Browse),
            this.info,
            callbacks.browse
        );
        Ok(this)
    }

    fn set(&self, name: &'static str, value: &str) -> c_int {
        let value = c_string(value);
        let symbol = format!("{name}\0");
        let function = unsafe {
            self.library
                .get::<unsafe extern "C" fn(*mut Info, *const c_char) -> c_int>(symbol.as_bytes())
        }
        .unwrap_or_else(|error| panic!("libopenconnect lacks {name}: {error}"));
        unsafe { function(self.info, value.as_ptr()) }
    }

    pub fn set_protocol(&self, protocol: &str) -> bool {
        self.set("openconnect_set_protocol", protocol) == 0
    }

    pub fn parse_url(&self, url: &str) -> bool {
        self.set("openconnect_parse_url", url) == 0
    }

    pub fn set_ca_file(&self, path: &str) {
        self.set("openconnect_set_cafile", path);
    }

    pub fn set_proxy(&self, proxy: &str) {
        self.set("openconnect_set_http_proxy", proxy);
    }

    pub fn set_reported_os(&self, os: &str) {
        self.set("openconnect_set_reported_os", os);
    }

    pub fn set_client_certificate(&self, certificate: &str, key: Option<&str>) {
        let certificate = c_string(certificate);
        let key = key.map(c_string);
        call!(
            self,
            "openconnect_set_client_cert",
            unsafe extern "C" fn(*mut Info, *const c_char, *const c_char) -> c_int,
            self.info,
            certificate.as_ptr(),
            key.as_ref().map_or(std::ptr::null(), |key| key.as_ptr())
        );
    }

    pub fn setup_trojan(&self, wrapper: Option<&str>) {
        let wrapper = wrapper.map(c_string);
        call!(
            self,
            "openconnect_setup_csd",
            unsafe extern "C" fn(*mut Info, u32, c_int, *const c_char) -> c_int,
            self.info,
            user_id(),
            1,
            wrapper
                .as_ref()
                .map_or(std::ptr::null(), |wrapper| wrapper.as_ptr())
        );
    }

    pub fn obtain_cookie(&self) -> c_int {
        call!(
            self,
            "openconnect_obtain_cookie",
            unsafe extern "C" fn(*mut Info) -> c_int,
            self.info
        )
    }

    fn get(&self, name: &'static str) -> Option<String> {
        let symbol = format!("{name}\0");
        let function = unsafe {
            self.library
                .get::<unsafe extern "C" fn(*mut Info) -> *const c_char>(symbol.as_bytes())
        }
        .unwrap_or_else(|error| panic!("libopenconnect lacks {name}: {error}"));
        text(unsafe { function(self.info) })
    }

    pub fn cookie(&self) -> Option<String> {
        self.get("openconnect_get_cookie")
    }

    pub fn connect_url(&self) -> Option<String> {
        self.get("openconnect_get_connect_url")
    }

    pub fn hostname(&self) -> Option<String> {
        self.get("openconnect_get_hostname")
    }

    pub fn dns_name(&self) -> Option<String> {
        self.get("openconnect_get_dnsname")
    }

    pub fn certificate_hash(&self) -> Option<String> {
        self.get("openconnect_get_peer_cert_hash")
    }

    pub fn port(&self) -> c_int {
        call!(
            self,
            "openconnect_get_port",
            unsafe extern "C" fn(*mut Info) -> c_int,
            self.info
        )
    }

    pub fn certificate_matches(&self, hash: &str) -> bool {
        self.set("openconnect_check_peer_cert_hash", hash) == 0
    }

    pub fn set_option(&self, option: *mut FormOption, value: &str) {
        let value = c_string(value);
        call!(
            self,
            "openconnect_set_option_value",
            unsafe extern "C" fn(*mut FormOption, *const c_char) -> c_int,
            option,
            value.as_ptr()
        );
    }
}

fn user_id() -> u32 {
    unsafe extern "C" {
        fn getuid() -> u32;
    }
    unsafe { getuid() }
}

impl Drop for OpenConnect {
    fn drop(&mut self) {
        if !self.info.is_null() {
            call!(
                self,
                "openconnect_vpninfo_free",
                unsafe extern "C" fn(*mut Info),
                self.info
            );
        }
    }
}
