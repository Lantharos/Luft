//! Sushi boot continuity library.

pub mod core;
pub mod protocol;
pub mod log;
pub mod display;
pub mod render;
pub mod unlock;

pub use core::*;
pub use protocol::*;
pub use display::{DisplayBackend, DisplayError, DisplayManager, FrameBuffer, PixelFormat};
pub use render::{render_frame_into, render_spinner_only, probe_oem_asset, LINUX_LOGO_NATIVE};
pub use unlock::{
    AskPasswordAgent, PasswordRequest, TtyReader, UnlockMessage, respond_to_request, secure_wipe,
};
pub use display::fb::emergency_blackout_all;
pub use display::drm::DrmBackend;
pub use display::fb::FbdevBackend;
