pub mod mok;
pub mod request;

use std::path::Path;

pub const CERTIFICATE: &str = "/usr/share/luft/secure-boot/luft.der";
pub const PCR_PUBLIC_KEY: &str = "/usr/share/luft/secure-boot/pcr-policy.pem";

pub fn shipped() -> bool {
    Path::new(CERTIFICATE).exists() && Path::new(PCR_PUBLIC_KEY).exists()
}
