//! Sushi boot continuity library.

pub mod core;
pub mod protocol;
pub mod log;
pub mod display;
pub mod render;
pub mod unlock;
pub mod input;
pub mod error;

pub use core::*;
pub use protocol::*;
pub use display::{DisplayBackend, DisplayError, DisplayManager, FrameBuffer, PixelFormat};
pub use render::{render_frame_into, render_spinner_only, probe_oem_asset, LINUX_LOGO_NATIVE};
pub use unlock::{
    AskPasswordAgent, CrypttabEntry, LuksUnlock, PasswordRequest, TtyReader, TpmUnlock,
    UnlockMessage, UnlockOutcome, respond_to_request, secure_wipe,
};
pub use input::{KeyAction, Keyboard};
pub use error::classify_boot_error;
pub use render::{ErrorDisplay, RenderOverlay};
pub use display::fb::emergency_blackout_all;
pub use display::drm::DrmBackend;
pub use display::fb::FbdevBackend;
