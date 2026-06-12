//! Linux framebuffer (fbdev) display backend.

use std::fs::{File, OpenOptions};
use std::os::fd::AsRawFd;
use std::path::Path;

use anyhow::{Context, Result};
use libc::{c_void, mmap, munmap, MAP_SHARED, PROT_READ, PROT_WRITE};
use relay_display::{DisplayBackend, FrameBuffer, PixelFormat};
use thiserror::Error;

const FBDEV_PATHS: &[&str] = &["/dev/fb0", "/dev/fb1"];

#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct FbFixScreeninfo {
    id: [u8; 16],
    smem_start: u64,
    smem_len: u32,
    type_: u32,
    type_aux: u32,
    visual: u32,
    xpanstep: u16,
    ypanstep: u16,
    ywrapstep: u16,
    line_length: u32,
    mmio_start: u64,
    mmio_len: u32,
    accel: u32,
    capabilities: u32,
    reserved: [u32; 2],
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct FbVarScreeninfo {
    xres: u32,
    yres: u32,
    xres_virtual: u32,
    yres_virtual: u32,
    xoffset: u32,
    yoffset: u32,
    bits_per_pixel: u32,
    grayscale: u32,
    red: FbBitfield,
    green: FbBitfield,
    blue: FbBitfield,
    transp: FbBitfield,
    nonstd: u32,
    activate: u32,
    height: u32,
    width: u32,
    accel_flags: u32,
    pixclock: u32,
    left_margin: u32,
    right_margin: u32,
    upper_margin: u32,
    lower_margin: u32,
    hsync_len: u32,
    vsync_len: u32,
    sync: u32,
    vmode: u32,
    rotate: u32,
    colorspace: u32,
    reserved: [u32; 4],
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct FbBitfield {
    offset: u32,
    length: u32,
    msb_right: u32,
}

const FBIOGET_VSCREENINFO: libc::c_ulong = 0x4600;
const FBIOGET_FSCREENINFO: libc::c_ulong = 0x4602;

/// Fill every available framebuffer with black before relayd paints the splash.
/// Safe to call before sysfs is mounted — only needs `/dev/fb*`.
pub fn emergency_blackout_all() {
    for path in FBDEV_PATHS {
        let _ = blackout_path(path);
    }
}

fn blackout_path(path: &str) -> Result<()> {
    if !Path::new(path).exists() {
        return Ok(());
    }
    let file = OpenOptions::new().read(true).write(true).open(path)?;
    let fd = file.as_raw_fd();
    let mut fix_info = FbFixScreeninfo {
        id: [0; 16],
        smem_start: 0,
        smem_len: 0,
        type_: 0,
        type_aux: 0,
        visual: 0,
        xpanstep: 0,
        ypanstep: 0,
        ywrapstep: 0,
        line_length: 0,
        mmio_start: 0,
        mmio_len: 0,
        accel: 0,
        capabilities: 0,
        reserved: [0; 2],
    };
    if unsafe { libc::ioctl(fd, FBIOGET_FSCREENINFO, &mut fix_info as *mut _) } != 0 {
        return Ok(());
    }
    let mmap_len = fix_info.smem_len as usize;
    if mmap_len == 0 {
        return Ok(());
    }
    let ptr = unsafe {
        mmap(
            std::ptr::null_mut(),
            mmap_len,
            PROT_READ | PROT_WRITE,
            MAP_SHARED,
            fd,
            0,
        )
    };
    if ptr == libc::MAP_FAILED {
        return Ok(());
    }
    unsafe {
        std::ptr::write_bytes(ptr as *mut u8, 0, mmap_len);
        munmap(ptr as *mut c_void, mmap_len);
    }
    Ok(())
}

#[derive(Debug, Error)]
pub enum FbdevError {
    #[error("no framebuffer device found")]
    NotFound,
    #[error("unsupported pixel format")]
    UnsupportedFormat,
    #[error("ioctl failed")]
    IoctlFailed,
}

pub struct FbdevBackend {
    _file: File,
    mmap_ptr: *mut u8,
    mmap_len: usize,
    width: u32,
    height: u32,
    stride: u32,
    format: PixelFormat,
    shadow: FrameBuffer,
    path: String,
}

unsafe impl Send for FbdevBackend {}

impl Drop for FbdevBackend {
    fn drop(&mut self) {
        if !self.mmap_ptr.is_null() && self.mmap_len > 0 {
            unsafe {
                munmap(self.mmap_ptr as *mut c_void, self.mmap_len);
            }
        }
    }
}

impl FbdevBackend {
    pub fn probe() -> Result<Self, FbdevError> {
        for path in FBDEV_PATHS {
            if Path::new(path).exists() {
                return Self::open(path).map_err(|_| FbdevError::NotFound);
            }
        }
        Err(FbdevError::NotFound)
    }

    pub fn open(path: &str) -> Result<Self> {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(path)
            .with_context(|| format!("open {path}"))?;
        let fd = file.as_raw_fd();

        let mut var_info = FbVarScreeninfo {
            xres: 0,
            yres: 0,
            xres_virtual: 0,
            yres_virtual: 0,
            xoffset: 0,
            yoffset: 0,
            bits_per_pixel: 0,
            grayscale: 0,
            red: FbBitfield {
                offset: 0,
                length: 0,
                msb_right: 0,
            },
            green: FbBitfield {
                offset: 0,
                length: 0,
                msb_right: 0,
            },
            blue: FbBitfield {
                offset: 0,
                length: 0,
                msb_right: 0,
            },
            transp: FbBitfield {
                offset: 0,
                length: 0,
                msb_right: 0,
            },
            nonstd: 0,
            activate: 0,
            height: 0,
            width: 0,
            accel_flags: 0,
            pixclock: 0,
            left_margin: 0,
            right_margin: 0,
            upper_margin: 0,
            lower_margin: 0,
            hsync_len: 0,
            vsync_len: 0,
            sync: 0,
            vmode: 0,
            rotate: 0,
            colorspace: 0,
            reserved: [0; 4],
        };
        let mut fix_info = FbFixScreeninfo {
            id: [0; 16],
            smem_start: 0,
            smem_len: 0,
            type_: 0,
            type_aux: 0,
            visual: 0,
            xpanstep: 0,
            ypanstep: 0,
            ywrapstep: 0,
            line_length: 0,
            mmio_start: 0,
            mmio_len: 0,
            accel: 0,
            capabilities: 0,
            reserved: [0; 2],
        };

        if unsafe {
            libc::ioctl(fd, FBIOGET_VSCREENINFO, &mut var_info as *mut _) != 0
                || libc::ioctl(fd, FBIOGET_FSCREENINFO, &mut fix_info as *mut _) != 0
        } {
            anyhow::bail!("fbdev ioctl failed");
        }

        let format = match var_info.bits_per_pixel {
            32 => PixelFormat::Xrgb8888,
            _ => anyhow::bail!("unsupported bpp {}", var_info.bits_per_pixel),
        };

        let mmap_len = fix_info.smem_len as usize;
        let mmap_ptr = unsafe {
            mmap(
                std::ptr::null_mut(),
                mmap_len,
                PROT_READ | PROT_WRITE,
                MAP_SHARED,
                fd,
                0,
            ) as *mut u8
        };
        if mmap_ptr == libc::MAP_FAILED as *mut u8 {
            anyhow::bail!("fbdev mmap failed");
        }

        let width = var_info.xres;
        let height = var_info.yres;
        let stride = fix_info.line_length;

        Ok(Self {
            _file: file,
            mmap_ptr,
            mmap_len,
            width,
            height,
            stride,
            format,
            shadow: FrameBuffer::new(width, height, format),
            path: path.to_string(),
        })
    }

    pub fn device_path(&self) -> &str {
        &self.path
    }
}

impl DisplayBackend for FbdevBackend {
    fn name(&self) -> &'static str {
        "fbdev"
    }

    fn width(&self) -> u32 {
        self.width
    }

    fn height(&self) -> u32 {
        self.height
    }

    fn format(&self) -> PixelFormat {
        self.format
    }

    fn map_frame(&mut self) -> Result<&mut FrameBuffer> {
        Ok(&mut self.shadow)
    }

    fn present(&mut self) -> Result<()> {
        let frame = self.shadow.clone();
        self.blit(&frame)
    }

    fn blit(&mut self, frame: &FrameBuffer) -> Result<()> {
        let row_bytes = self.stride as usize;
        let copy_bytes = (frame.width * 4).min(self.stride) as usize;
        for y in 0..frame.height.min(self.height) {
            let src_off = (y * frame.stride * 4 / 4) as usize;
            let dst_off = (y as usize) * row_bytes;
            if src_off + copy_bytes > frame.pixels.len() {
                break;
            }
            if dst_off + copy_bytes > self.mmap_len {
                break;
            }
            unsafe {
                std::ptr::copy_nonoverlapping(
                    frame.pixels.as_ptr().add(src_off),
                    self.mmap_ptr.add(dst_off),
                    copy_bytes,
                );
            }
        }
        Ok(())
    }
}