pub mod mok;
pub mod others;
pub mod request;

use std::path::{Path, PathBuf};

use crate::disk::unlock::generations;

pub const CERTIFICATE: &str = "/usr/share/luft/secure-boot/luft.der";
pub const ORGANIZATION_CERTIFICATE: &str = "/usr/share/luft/secure-boot/organization.der";

pub fn shipped() -> bool {
    Path::new(CERTIFICATE).exists() && generations::current().is_some()
}

/// The certificates this image's startup is signed with, in the order shim first checks
/// them: Luft's, which signs the boot menu and NVIDIA's driver, then the organization's that
/// signs the startup images of an organization's own image.
pub fn certificate_files() -> Vec<PathBuf> {
    [CERTIFICATE, ORGANIZATION_CERTIFICATE]
        .into_iter()
        .map(PathBuf::from)
        .filter(|path| path.exists())
        .collect()
}

pub fn certificates() -> Vec<Vec<u8>> {
    certificate_files()
        .iter()
        .filter_map(|path| std::fs::read(path).ok())
        .collect()
}
