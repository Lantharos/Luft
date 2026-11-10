pub mod mok;
pub mod others;
pub mod request;

use std::path::Path;

use crate::disk::unlock::generations;

pub const CERTIFICATE: &str = "/usr/share/luft/secure-boot/luft.der";

pub fn shipped() -> bool {
    Path::new(CERTIFICATE).exists() && generations::current().is_some()
}
