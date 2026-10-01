use crate::progress::Stage;

const OFFLINE: &str = "Couldn't reach the software sources. Check your connection and try again.";

pub mod filter {
    pub const NONE: u64 = 1 << 1;
    pub const INSTALLED: u64 = 1 << 2;
    pub const NOT_INSTALLED: u64 = 1 << 3;
    pub const NEWEST: u64 = 1 << 16;
    pub const ARCH: u64 = 1 << 18;
}

pub mod flag {
    pub const NONE: u64 = 0;
    pub const ONLY_TRUSTED: u64 = 1 << 1;
    pub const SIMULATE: u64 = 1 << 2;
    pub const ONLY_DOWNLOAD: u64 = 1 << 3;
}

pub mod info {
    pub const SECURITY: u32 = 8;
    pub const BLOCKED: u32 = 9;
    pub const REMOVING: u32 = 13;
}

pub mod exit {
    pub const SUCCESS: u32 = 1;
    pub const CANCELLED: u32 = 3;
}

pub fn stage(status: u32) -> Stage {
    match status {
        8 => Stage::Downloading,
        9 | 10 | 12 | 14..=16 | 26 | 33..=36 => Stage::Installing,
        6 => Stage::Removing,
        11 | 18 => Stage::Finishing,
        1 | 30 | 31 => Stage::Waiting,
        _ => Stage::Preparing,
    }
}

pub fn error_message(code: u32, details: &str) -> String {
    if details.contains("cacheonly") {
        return OFFLINE.into();
    }
    let message = match code {
        2 | 10 | 37 | 43 | 64 => OFFLINE,
        17 | 65 => "The operation was cancelled.",
        13 | 35 | 36 => "This conflicts with software that's already installed.",
        26 | 67 => "Another software operation is running. Try again when it has finished.",
        5 | 30 | 31 | 50 | 51 => "The package isn't signed by a source this computer trusts.",
        46 => "There isn't enough free space on this computer.",
        48 => "Permission to change the system's software wasn't given.",
        7 => "That isn't installed.",
        8 | 49 => "That isn't available from the software sources any more.",
        9 | 41 => "That's already installed.",
        20 => "This is part of the system and can't be removed.",
        38 | 40 => "This package file is damaged or isn't meant for this computer.",
        45 => "This package is made for a different kind of computer.",
        60 => "Close the apps being updated and try again.",
        _ => {
            return if details.is_empty() {
                "Something went wrong.".into()
            } else {
                details.trim().to_owned()
            };
        }
    };
    message.into()
}
