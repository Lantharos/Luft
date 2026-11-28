mod frame;
mod message;
mod secret;

pub use frame::{FrameError, MAX_FRAME, read, write};
#[cfg(feature = "tokio")]
pub use frame::{read_async, write_async};
pub use message::{
    Chip, Event, Grant, GrantReason, Problem, Reply, Request, Seal, Status, Token, TpmKey, Unlock,
};
pub use secret::Secret;

pub const SOCKET: &str = "/run/luft-keyring/unlock";

/// The PAM data a sign-in module leaves for `pam_luft_keyring.so`: a
/// [`TokenStash`] holding a postcard-encoded [`Token`].
pub const TOKEN_STASH: &std::ffi::CStr = c"luft-sign-in-token";

#[repr(C)]
pub struct TokenStash {
    pub length: usize,
    pub bytes: *const u8,
}
