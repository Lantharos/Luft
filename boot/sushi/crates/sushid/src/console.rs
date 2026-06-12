//! Hand the visible framebuffer back to the kernel console before switch_root.

use std::fs::OpenOptions;
use std::io::Write;
use std::os::unix::io::AsRawFd;

const VT_OPENQRY: libc::c_ulong = 0x5600;
const VT_ACTIVATE: libc::c_ulong = 0x5606;
const VT_WAITACTIVE: libc::c_ulong = 0x5607;
const KDSETMODE: libc::c_ulong = 0x4B3A;
const KD_TEXT: libc::c_ulong = 0x00;
const FBIOBLANK: libc::c_ulong = 0x4611;
const FB_BLANK_UNBLANK: libc::c_ulong = 0;

/// Release splash ownership of the scanout buffer and wake fbcon on tty1.
pub fn handoff_framebuffer_to_console() {
    crate::enable_fbcon();
    unblank_framebuffer();
    activate_text_console();
}

fn unblank_framebuffer() {
    let Ok(fb) = OpenOptions::new().write(true).open("/dev/fb0") else {
        return;
    };
    let fd = fb.as_raw_fd();
    unsafe {
        let _ = libc::ioctl(fd, FBIOBLANK as _, FB_BLANK_UNBLANK);
    }
}

fn activate_text_console() {
    let Ok(console) = OpenOptions::new().read(true).write(true).open("/dev/console") else {
        return;
    };
    let fd = console.as_raw_fd();
    unsafe {
        let mut vt = 0i32;
        if libc::ioctl(fd, VT_OPENQRY as _, &mut vt) == 0 && vt > 0 {
            let _ = libc::ioctl(fd, VT_ACTIVATE as _, 1);
            let _ = libc::ioctl(fd, VT_WAITACTIVE as _, 1);
        }
    }

    let Ok(mut tty1) = OpenOptions::new().read(true).write(true).open("/dev/tty1") else {
        return;
    };
    let fd = tty1.as_raw_fd();
    unsafe {
        let _ = libc::ioctl(fd, KDSETMODE as _, KD_TEXT);
    }
    let _ = write!(
        tty1,
        "\x1b[?25h\x1b[0m\x1b[2J\x1b[H\x1b[1;1H"
    );
    let _ = tty1.write_all(b"Sushi VM ready \xe2\x80\x94 login on this screen or serial\r\n\r\n");
}