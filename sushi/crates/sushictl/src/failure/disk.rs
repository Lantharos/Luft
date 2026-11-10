use std::path::{Path, PathBuf};

const ENCRYPTED_ROOT: &str = "/dev/gpt-auto-root-luks";
const ROOT: &str = "/dev/gpt-auto-root";

pub enum SystemDisk {
    Encrypted(PathBuf),
    Plain,
    Unknown,
}

impl SystemDisk {
    pub fn find() -> Self {
        match std::fs::canonicalize(ENCRYPTED_ROOT) {
            Ok(partition) => Self::Encrypted(partition),
            Err(_) if Path::new(ROOT).exists() => Self::Plain,
            Err(_) => Self::Unknown,
        }
    }
}
