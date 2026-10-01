use std::ffi::{c_char, c_int, c_void};
use std::io;
use std::os::fd::BorrowedFd;
use std::ptr;

#[link(name = "systemd")]
unsafe extern "C" {
    fn sd_uid_is_on_seat(uid: u32, require_active: c_int, seat: *const c_char) -> c_int;
    fn sd_login_monitor_new(category: *const c_char, monitor: *mut *mut c_void) -> c_int;
    fn sd_login_monitor_get_fd(monitor: *mut c_void) -> c_int;
    fn sd_login_monitor_flush(monitor: *mut c_void) -> c_int;
    fn sd_login_monitor_unref(monitor: *mut c_void) -> *mut c_void;
}

pub struct Seat {
    uid: u32,
    monitor: *mut c_void,
}

impl Seat {
    pub fn watch(uid: u32) -> io::Result<Self> {
        let mut monitor = ptr::null_mut();
        let result = unsafe { sd_login_monitor_new(c"seat".as_ptr(), &raw mut monitor) };
        if result < 0 {
            return Err(io::Error::from_raw_os_error(-result));
        }
        Ok(Self { uid, monitor })
    }

    pub fn active(&self) -> bool {
        unsafe { sd_uid_is_on_seat(self.uid, 1, c"seat0".as_ptr()) > 0 }
    }

    pub fn fd(&self) -> BorrowedFd<'_> {
        unsafe { BorrowedFd::borrow_raw(sd_login_monitor_get_fd(self.monitor)) }
    }

    pub fn flush(&self) {
        unsafe { sd_login_monitor_flush(self.monitor) };
    }
}

impl Drop for Seat {
    fn drop(&mut self) {
        unsafe { sd_login_monitor_unref(self.monitor) };
    }
}
