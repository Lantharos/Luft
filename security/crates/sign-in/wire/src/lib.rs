use serde::{Deserialize, Serialize};

pub use luft_keyring_wire::{FrameError, Secret, Token, read, write};

pub const SOCKET: &str = "/run/luft-sign-in/verify";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Way {
    SecurityKey,
    SmartCard,
    RecoveryKey,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Request {
    Verify { user: String, way: Way },
    PasswordAllowed { user: String },
    Answer(Secret),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Reply {
    Ask(Question),
    Tell(Notice),
    Verified(Option<Token>),
    PasswordBack,
    Refused(Problem),
    Allowed(bool),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Question {
    KeyPin,
    CardPin,
    RecoveryKey,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Notice {
    PlugInKey,
    TouchKey,
    InsertCard,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Problem {
    NothingEnrolled,
    NotEnrolledHere,
    WrongPin { tries_left: Option<u8> },
    Blocked,
    WrongRecoveryKey,
    TimedOut,
    Failed(String),
}
