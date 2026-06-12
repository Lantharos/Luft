//! DRM/KMS display backend using dumb buffers.

use std::fs::{File, OpenOptions};
use std::os::fd::{AsFd, BorrowedFd};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use drm::control::connector::{self};
use drm::control::crtc;
use drm::control::dumbbuffer::DumbBuffer;
use drm::control::framebuffer;
use drm::control::{Device as ControlDevice, ResourceHandles};
use drm::buffer::Buffer;
use drm::Device;
use relay_display::{DisplayBackend, FrameBuffer, PixelFormat};
use thiserror::Error;

#[derive(Debug)]
struct Card(File);

impl AsFd for Card {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.0.as_fd()
    }
}

impl Device for Card {}
impl ControlDevice for Card {}

#[derive(Debug, Error)]
pub enum DrmError {
    #[error("no DRM device found")]
    NotFound,
    #[error("drm setup failed: {0}")]
    SetupFailed(String),
}

pub struct DrmBackend {
    card: Card,
    width: u32,
    height: u32,
    format: PixelFormat,
    dumb: DumbBuffer,
    framebuffer: framebuffer::Handle,
    crtc: crtc::Handle,
    connector: connector::Handle,
    mode: drm::control::Mode,
    shadow: FrameBuffer,
    device_path: PathBuf,
}

impl DrmBackend {
    pub fn probe() -> Result<Self, DrmError> {
        let entries = std::fs::read_dir("/dev/dri")
            .map_err(|e| DrmError::SetupFailed(e.to_string()))?;
        for entry in entries.flatten() {
            let path = entry.path();
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if name.starts_with("card") && !name.contains('-') {
                if let Ok(backend) = Self::open(&path) {
                    return Ok(backend);
                }
            }
        }
        Err(DrmError::NotFound)
    }

    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(&path)
            .with_context(|| format!("open {}", path.display()))?;

        let card = Card(file);
        let resources = card.resource_handles().context("drm resources")?;
        let connector = pick_connector(&card, &resources)?;
        let conn_info = card.get_connector(connector, true).context("connector info")?;

        let mode = conn_info
            .modes()
            .first()
            .copied()
            .context("connector has no modes")?;
        let (width, height) = mode.size();
        let width = width as u32;
        let height = height as u32;

        let crtc = pick_crtc(&card, &conn_info, &resources)?;

        let mut dumb = card
            .create_dumb_buffer(
                (width, height),
                drm::buffer::DrmFourcc::Xrgb8888,
                32,
            )
            .context("create dumb buffer")?;
        let framebuffer = card
            .add_framebuffer(&dumb, 24, 32)
            .context("add framebuffer")?;

        {
            let pitch = dumb.pitch() as usize;
            let mut mapping = card
                .map_dumb_buffer(&mut dumb)
                .context("map dumb buffer for blackout")?;
            for row in mapping.chunks_mut(pitch) {
                row.fill(0);
            }
        }

        card.set_crtc(crtc, Some(framebuffer), (0, 0), &[connector], Some(mode))
            .or_else(|_| card.set_crtc(crtc, Some(framebuffer), (0, 0), &[connector], None))
            .context("set crtc")?;

        Ok(Self {
            card,
            width,
            height,
            format: PixelFormat::Xrgb8888,
            dumb,
            framebuffer,
            crtc,
            connector,
            mode,
            shadow: FrameBuffer::new(width, height, PixelFormat::Xrgb8888),
            device_path: path,
        })
    }

    pub fn device_path(&self) -> &Path {
        &self.device_path
    }
}

impl DisplayBackend for DrmBackend {
    fn name(&self) -> &'static str {
        "drm"
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
        self.shadow.format = self.format;
        Ok(&mut self.shadow)
    }

    fn present(&mut self) -> Result<()> {
        let frame = self.shadow.clone();
        self.blit(&frame)
    }

    fn blit(&mut self, frame: &FrameBuffer) -> Result<()> {
        let pitch = self.dumb.pitch() as usize;
        let copy_bytes = (frame.width * 4).min(self.dumb.pitch()) as usize;
        let mut mapping = self
            .card
            .map_dumb_buffer(&mut self.dumb)
            .context("map dumb buffer")?;
        for row in mapping.chunks_mut(pitch) {
            row.fill(0);
        }
        for y in 0..frame.height.min(self.height) {
            let src_off = (y * frame.stride) as usize;
            let dst_off = y as usize * pitch;
            if src_off + copy_bytes > frame.pixels.len() || dst_off + copy_bytes > mapping.len() {
                break;
            }
            mapping[dst_off..dst_off + copy_bytes]
                .copy_from_slice(&frame.pixels[src_off..src_off + copy_bytes]);
        }
        drop(mapping);

        // Refresh the CRTC; headless firmware may reject this — don't fail the frame.
        let _ = self.card.set_crtc(
            self.crtc,
            Some(self.framebuffer),
            (0, 0),
            &[self.connector],
            Some(self.mode),
        );
        Ok(())
    }
}

fn pick_crtc(
    card: &Card,
    conn_info: &connector::Info,
    resources: &ResourceHandles,
) -> Result<crtc::Handle> {
    if let Some(enc) = conn_info.current_encoder() {
        if let Ok(encoder) = card.get_encoder(enc) {
            if let Some(crtc) = encoder.crtc() {
                return Ok(crtc);
            }
        }
    }
    if let Some(&enc) = conn_info.encoders().first() {
        if let Ok(encoder) = card.get_encoder(enc) {
            let mask = encoder.possible_crtcs();
            if let Some(&crtc) = resources.filter_crtcs(mask).first() {
                return Ok(crtc);
            }
        }
    }
    resources
        .crtcs()
        .first()
        .copied()
        .context("no crtc")
}

fn pick_connector(card: &Card, resources: &ResourceHandles) -> Result<connector::Handle> {
    for &conn in resources.connectors() {
        let info = card.get_connector(conn, true).context("connector info")?;
        if info.state() == connector::State::Connected && !info.modes().is_empty() {
            return Ok(conn);
        }
    }
    resources
        .connectors()
        .first()
        .copied()
        .context("no connector")
}