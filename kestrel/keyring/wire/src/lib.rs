mod frame;
mod message;
mod secret;

pub use frame::{FrameError, MAX_FRAME, read, write};
#[cfg(feature = "tokio")]
pub use frame::{read_async, write_async};
pub use message::{
    Chip, Event, Grant, GrantReason, Problem, Reply, Request, Seal, Status, TpmKey, Unlock,
};
pub use secret::Secret;

pub const SOCKET: &str = "/run/luft-keyring/unlock";
