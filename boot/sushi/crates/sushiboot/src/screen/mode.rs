use alloc::vec::Vec;

use sushi_scene::Monitor;
use uefi::Handle;
use uefi::proto::console::gop::{EdidDiscovered, GraphicsOutput, Mode, PixelFormat};
use uefi::proto::unsafe_protocol;

use crate::protocol;

#[repr(C)]
#[unsafe_protocol("bd8c1056-9f36-44ec-92a8-a6337f817986")]
struct EdidActive {
    size: u32,
    edid: *const u8,
}

impl EdidActive {
    fn edid(&self) -> Option<&[u8]> {
        (!self.edid.is_null())
            .then(|| unsafe { core::slice::from_raw_parts(self.edid, self.size as usize) })
    }
}

pub fn monitor(handle: Handle) -> Option<Monitor> {
    let active = protocol::shared::<EdidActive>(handle)
        .ok()
        .and_then(|active| Monitor::from_edid(active.edid()?));
    active.or_else(|| {
        let discovered = protocol::shared::<EdidDiscovered>(handle).ok()?;
        Monitor::from_edid(discovered.edid()?)
    })
}

fn size(mode: &Mode) -> (u32, u32) {
    let (width, height) = mode.info().resolution();
    (width as u32, height as u32)
}

pub fn switch_to_best(gop: &mut GraphicsOutput, monitor: &Monitor) -> bool {
    let (width, height) = gop.current_mode_info().resolution();
    let current = (width as u32, height as u32);
    let modes: Vec<Mode> = gop
        .modes()
        .filter(|mode| mode.info().pixel_format() != PixelFormat::BltOnly)
        .collect();
    let Some(best) = monitor.best(modes.iter().map(size)) else {
        return false;
    };
    if best == current {
        return false;
    }
    let Some(mode) = modes.iter().find(|mode| size(mode) == best) else {
        return false;
    };
    gop.set_mode(mode).is_ok()
}
