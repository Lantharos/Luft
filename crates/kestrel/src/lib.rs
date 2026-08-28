#![warn(rust_2018_idioms)]
#![allow(clippy::collapsible_match)]
// If no backend is enabled, a large portion of the codebase is unused.
// So silence this useless warning for the CI.
#![cfg_attr(
    not(any(feature = "nested", feature = "session-backend")),
    allow(dead_code, unused_imports)
)]

pub mod blur;
mod blur_pipeline;
pub mod capture;
#[cfg(feature = "session-backend")]
pub mod cursor;
pub mod drawing;
pub mod focus;
pub mod input_handler;
pub mod ipc;
pub mod layer_motion;
pub mod policy;
pub mod render;
pub mod runtime;
pub mod session_lock;
pub mod shell;
pub mod shell_process;
pub mod state;
#[cfg(feature = "session-backend")]
pub mod udev;
pub mod wallpaper;
#[cfg(feature = "nested")]
pub mod winit;
pub mod xwayland_process;

pub use state::{ClientState, KestrelState};
