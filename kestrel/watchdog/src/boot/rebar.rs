use std::fs;

use crate::system::gpu::{self, Device, NVIDIA};

const EXTENDED_CAPABILITIES: usize = 0x100;
const RESIZABLE_BAR: u16 = 0x15;
const MIB: u64 = 1024 * 1024;
const CPU_VISIBLE_BAR: u32 = 1;
const SMALL_WINDOW_MIB: u64 = 256;

pub struct Window {
    pub card: String,
    pub current_mib: u64,
    pub largest_mib: u64,
}

fn dword(config: &[u8], offset: usize) -> Option<u32> {
    Some(u32::from_le_bytes(
        config.get(offset..offset + 4)?.try_into().ok()?,
    ))
}

fn resizable_bar(config: &[u8]) -> Option<usize> {
    let mut offset = EXTENDED_CAPABILITIES;
    for _ in 0..64 {
        let header = dword(config, offset)?;
        if header & 0xffff == u32::from(RESIZABLE_BAR) {
            return Some(offset);
        }
        offset = (header >> 20) as usize;
        if offset < EXTENDED_CAPABILITIES {
            return None;
        }
    }
    None
}

fn largest_size_mib(config: &[u8], capability: usize, bar: u32) -> Option<u64> {
    let first_control = dword(config, capability + 8)?;
    let count = ((first_control >> 5) & 0x7).max(1) as usize;
    (0..count).find_map(|entry| {
        let base = capability + 4 + entry * 8;
        let sizes = dword(config, base)?;
        let control = dword(config, base + 4)?;
        (control & 0x7 == bar).then_some(())?;
        let supported = u64::from(sizes >> 4) | (u64::from(control >> 16) << 28);
        (supported != 0).then(|| 1u64 << (63 - supported.leading_zeros()))
    })
}

fn window(device: &Device) -> Option<Window> {
    let config = fs::read(device.path.join("config")).ok()?;
    let capability = resizable_bar(&config)?;
    let largest_mib = largest_size_mib(&config, capability, CPU_VISIBLE_BAR)?;
    let current_mib = gpu::bar_size(device, CPU_VISIBLE_BAR as usize)? / MIB;
    (current_mib <= SMALL_WINDOW_MIB && largest_mib > current_mib).then(|| Window {
        card: gpu::name(device),
        current_mib,
        largest_mib,
    })
}

pub fn small_windows() -> Vec<Window> {
    gpu::displays()
        .iter()
        .filter(|device| device.vendor == NVIDIA)
        .filter_map(window)
        .collect()
}
