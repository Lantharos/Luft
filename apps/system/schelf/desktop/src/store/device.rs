use std::fs;
use std::path::PathBuf;

use super::catalog::Kind;

#[cfg(target_arch = "x86_64")]
const APP_PLATFORMS: &[&str] = &["linux-x86_64"];
#[cfg(target_arch = "aarch64")]
const APP_PLATFORMS: &[&str] = &["linux-aarch64"];
#[cfg(target_arch = "x86_64")]
const EXTENSION_PLATFORMS: &[&str] = &["luft-x86_64", "luft"];
#[cfg(target_arch = "aarch64")]
const EXTENSION_PLATFORMS: &[&str] = &["luft-aarch64", "luft"];

/// Apps that only get another system ready for Luft, with nothing to do once
/// a computer runs it.
const FOR_OTHER_SYSTEMS: &[&str] = &["com.lantharos.meet"];

/// The platform of a file the store has for every system, such as an archive.
pub const ANY_SYSTEM: &str = "any";

/// The platforms of the store's artifacts that run here, most specific first.
pub fn platforms(kind: Kind) -> &'static [&'static str] {
    match kind {
        Kind::App => APP_PLATFORMS,
        Kind::Extension => EXTENSION_PLATFORMS,
    }
}

pub fn useful_here(id: &str) -> bool {
    !FOR_OTHER_SYSTEMS
        .iter()
        .any(|other| other.eq_ignore_ascii_case(id))
}

pub fn folder() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("com.lantharos.schelf")
}

/// This device's place in every rollout: a number in [0, 1) drawn once and
/// kept here, so the store never learns which group a device is in.
pub fn draw() -> f64 {
    let path = folder().join("rollout");
    if let Some(draw) = fs::read_to_string(&path)
        .ok()
        .and_then(|text| text.trim().parse::<f64>().ok())
        .filter(|draw| (0.0..1.0).contains(draw))
    {
        return draw;
    }
    let mut bytes = [0u8; 8];
    getrandom::fill(&mut bytes).expect("the kernel's random generator is always available");
    let draw = (u64::from_le_bytes(bytes) >> 11) as f64 / (1u64 << 53) as f64;
    let _ = luft_app::files::replace(&path, draw.to_string().as_bytes());
    draw
}
