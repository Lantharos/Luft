use std::io;
use std::os::fd::AsFd;
use std::ptr::NonNull;

use drm::buffer::{self, Buffer, DrmFourcc};
use drm::control::{ClipRect, Device as ControlDevice, Mode, connector, crtc, framebuffer};
use rustix::mm::{MapFlags, ProtFlags, mmap, munmap};
use sushi_scene::Rect;
use sushi_scene::tiny_skia::Pixmap;

use super::card::Card;

struct ScanoutBuffer {
    handle: buffer::Handle,
    size: (u32, u32),
    pitch: u32,
    pixels: NonNull<u8>,
    length: usize,
}

impl Buffer for ScanoutBuffer {
    fn size(&self) -> (u32, u32) {
        self.size
    }

    fn format(&self) -> DrmFourcc {
        DrmFourcc::Xrgb8888
    }

    fn pitch(&self) -> u32 {
        self.pitch
    }

    fn handle(&self) -> buffer::Handle {
        self.handle
    }
}

impl ScanoutBuffer {
    fn create(card: &Card, (width, height): (u32, u32)) -> io::Result<Self> {
        let created = drm_ffi::mode::dumbbuffer::create(card.as_fd(), width, height, 32, 0)?;
        let handle = buffer::Handle::from(
            std::num::NonZeroU32::new(created.handle).ok_or(io::ErrorKind::InvalidData)?,
        );
        let mapped = drm_ffi::mode::dumbbuffer::map(card.as_fd(), created.handle, 0, 0)?;
        let length = created.size as usize;
        let pixels = unsafe {
            mmap(
                std::ptr::null_mut(),
                length,
                ProtFlags::READ | ProtFlags::WRITE,
                MapFlags::SHARED,
                card.as_fd(),
                mapped.offset,
            )?
        };
        let pixels = NonNull::new(pixels.cast::<u8>()).ok_or(io::ErrorKind::InvalidData)?;
        unsafe { pixels.as_ptr().write_bytes(0, length) };
        Ok(Self {
            handle,
            size: (width, height),
            pitch: created.pitch,
            pixels,
            length,
        })
    }

    fn row(&mut self, y: u32) -> &mut [u32] {
        let start = y as usize * self.pitch as usize;
        let row = unsafe {
            std::slice::from_raw_parts_mut(
                self.pixels.as_ptr().add(start).cast::<u32>(),
                self.size.0 as usize,
            )
        };
        debug_assert!(start + row.len() * 4 <= self.length);
        row
    }

    fn release(self, card: &Card) {
        unsafe {
            let _ = munmap(self.pixels.as_ptr().cast(), self.length);
        }
        let _ = drm_ffi::mode::dumbbuffer::destroy(card.as_fd(), self.handle.into());
    }
}

pub struct Output {
    pub connector: connector::Handle,
    pub crtc: crtc::Handle,
    pub mode: Mode,
    pub framebuffer: framebuffer::Handle,
    pub inherited: Option<Mode>,
    pub internal: bool,
    buffer: ScanoutBuffer,
}

unsafe impl Send for Output {}

impl Output {
    pub fn create(
        card: &Card,
        connector: connector::Handle,
        crtc: crtc::Handle,
        mode: Mode,
    ) -> io::Result<Self> {
        let (width, height) = mode.size();
        let buffer = ScanoutBuffer::create(card, (width as u32, height as u32))?;
        let framebuffer = match card.add_framebuffer(&buffer, 24, 32) {
            Ok(framebuffer) => framebuffer,
            Err(error) => {
                buffer.release(card);
                return Err(error);
            }
        };
        Ok(Self {
            connector,
            crtc,
            mode,
            framebuffer,
            inherited: None,
            internal: false,
            buffer,
        })
    }

    pub fn inheriting(self, inherited: Option<Mode>, internal: bool) -> Self {
        Self {
            inherited,
            internal,
            ..self
        }
    }

    pub fn size(&self) -> (u32, u32) {
        self.buffer.size
    }

    pub fn show(&self, card: &Card) -> io::Result<()> {
        card.set_crtc(
            self.crtc,
            Some(self.framebuffer),
            (0, 0),
            &[self.connector],
            Some(self.mode),
        )?;
        self.hide_other_planes(card);
        Ok(())
    }

    fn hide_other_planes(&self, card: &Card) {
        let planes = card.plane_handles().unwrap_or_default();
        for plane in planes {
            let shown_here = card.get_plane(plane).is_ok_and(|info| {
                info.crtc() == Some(self.crtc) && info.framebuffer() != Some(self.framebuffer)
            });
            if shown_here {
                let _ = card.set_plane(plane, self.crtc, None, 0, (0, 0, 0, 0), (0, 0, 0, 0));
            }
        }
    }

    pub fn is_on_screen(&self, card: &Card) -> bool {
        card.get_crtc(self.crtc)
            .is_ok_and(|info| info.framebuffer() == Some(self.framebuffer))
    }

    pub fn blit(&mut self, card: &Card, area: Rect, pixmap: &Pixmap) {
        let (width, height) = self.size();
        let Some(visible) = area.clamp_to(width, height) else {
            return;
        };
        let source = pixmap.data();
        let source_width = pixmap.width() as usize;
        for y in 0..visible.height {
            let source_y = (visible.y - area.y) as usize + y as usize;
            let source_x = (visible.x - area.x) as usize;
            let start = (source_y * source_width + source_x) * 4;
            let pixels = &source[start..start + visible.width as usize * 4];
            let row = &mut self.buffer.row(visible.y as u32 + y)[visible.x as usize..]
                [..visible.width as usize];
            for (target, rgba) in row.iter_mut().zip(pixels.as_chunks::<4>().0) {
                *target = u32::from(rgba[0]) << 16 | u32::from(rgba[1]) << 8 | u32::from(rgba[2]);
            }
        }
        let clip = ClipRect::new(
            visible.x as u16,
            visible.y as u16,
            (visible.x + visible.width as i32) as u16,
            (visible.y + visible.height as i32) as u16,
        );
        let _ = card.dirty_framebuffer(self.framebuffer, &[clip]);
    }

    pub fn release(self, card: &Card) {
        card.close_framebuffer(self.framebuffer);
        self.buffer.release(card);
    }
}
