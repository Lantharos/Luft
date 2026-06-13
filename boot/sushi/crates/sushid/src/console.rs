//! Hand the visible framebuffer back to the kernel console before switch_root.

use std::fs::{self, OpenOptions};
use std::io::Write;

use std::os::unix::io::AsRawFd;

const VT_OPENQRY: libc::c_ulong = 0x5600;
const VT_ACTIVATE: libc::c_ulong = 0x5606;
const VT_WAITACTIVE: libc::c_ulong = 0x5607;
const VT_DISALLOCATE: libc::c_ulong = 0x5608;
const KDSETMODE: libc::c_ulong = 0x4B3A;
const KD_TEXT: libc::c_ulong = 0x00;
const FBIOBLANK: libc::c_ulong = 0x4611;
const FB_BLANK_UNBLANK: libc::c_ulong = 0;

/// Erase scrollback on serial/VT before login or the next boot stage owns the console.
pub fn clear_text_console() {
    const CLEAR: &[u8] = b"\x1b[2J\x1b[3J\x1b[H";
    for path in ["/dev/ttyS0", "/dev/console", "/dev/tty1", "/dev/tty0"] {
        let Ok(mut tty) = OpenOptions::new().write(true).open(path) else {
            continue;
        };
        let _ = tty.write_all(CLEAR);
        let _ = tty.flush();
    }
}

/// Keep the last splash frame on scanout through switch_root — do not rebind fbcon here.
pub fn handoff_framebuffer_to_console() {
    clear_text_console();
    unblank_framebuffer();
    activate_text_console();
}

/// Reclaim the framebuffer from kernel console scribbles (e.g. after cryptsetup).
pub fn keep_splash_visible() {
    crate::suppress_fbcon_console();
    unblank_framebuffer();
}

fn unblank_framebuffer() {
    for path in ["/dev/fb0", "/dev/fb1"] {
        let Ok(fb) = OpenOptions::new().write(true).open(path) else {
            continue;
        };
        let fd = fb.as_raw_fd();
        unsafe {
            let _ = libc::ioctl(fd, FBIOBLANK as _, FB_BLANK_UNBLANK);
        }
        return;
    }
}

fn activate_text_console() {
    let _ = fs::write("/sys/module/fbcon/parameters/rotate", "0");

    if let Ok(console) = OpenOptions::new().read(true).write(true).open("/dev/console") {
        let fd = console.as_raw_fd();
        unsafe {
            let mut vt = 0i32;
            if libc::ioctl(fd, VT_OPENQRY as _, &mut vt) == 0 && vt > 0 {
                let _ = libc::ioctl(fd, VT_DISALLOCATE as _, 1);
                let _ = libc::ioctl(fd, VT_ACTIVATE as _, 1);
                let _ = libc::ioctl(fd, VT_WAITACTIVE as _, 1);
            }
        }
    }

    // Leave the last splash frame on scanout — do not ESC[2J clear the framebuffer here.
    for path in ["/dev/tty1", "/dev/tty0"] {
        let Ok(mut tty) = OpenOptions::new().read(true).write(true).open(path) else {
            continue;
        };
        let fd = tty.as_raw_fd();
        unsafe {
            let _ = libc::ioctl(fd, KDSETMODE as _, KD_TEXT);
        }
        let _ = tty.write_all(b"\x1b[?25h");
        let _ = tty.flush();
        break;
    }
}