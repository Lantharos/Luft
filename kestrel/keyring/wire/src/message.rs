use serde::{Deserialize, Serialize};

use crate::Secret;

#[derive(Debug, Serialize, Deserialize)]
pub enum Request {
    Grant(Grant),
    Attach,
    Status,
    Seal {
        pin: Option<Secret>,
    },
    Unseal {
        pin: Secret,
    },
    Forget,
    CreateKey {
        auth: Secret,
    },
    Sign {
        key: TpmKey,
        auth: Secret,
        digest: Vec<u8>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Grant {
    pub user: u32,
    pub password: Option<Secret>,
    pub reason: GrantReason,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GrantReason {
    SignIn,
    Unlock,
    PasswordChanged,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Reply {
    Done,
    Status(Status),
    Sealed { key: Secret },
    Unsealed { key: Secret },
    Key(TpmKey),
    Signature { r: Vec<u8>, s: Vec<u8> },
    Refused(Problem),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Event {
    Unlock(Unlock),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Unlock {
    pub reason: GrantReason,
    pub key: Option<Secret>,
    pub password: Option<Secret>,
    pub problem: Option<Problem>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Status {
    pub chip: Chip,
    pub seal: Option<Seal>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Seal {
    pub pin: bool,
    pub pcrs: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Chip {
    Ready,
    Missing,
    Unsupported,
    Disabled,
    Failing,
    NoPcrBank,
    Unavailable(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Problem {
    NoChip(Chip),
    NotSealed,
    NeedsPin,
    PolicyChanged,
    WrongPin,
    LockedOut,
    NotAllowed,
    Failed(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TpmKey {
    pub public: Vec<u8>,
    pub private: Vec<u8>,
    pub point: (Vec<u8>, Vec<u8>),
}
