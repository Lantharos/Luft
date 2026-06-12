//! Relay state serialization and EFI handoff constants.

use std::fs;
use std::io::Write;
use std::path::Path;

use anyhow::{Context, Result};
use relay_core::{RelayVisualState, RELAY_STATE_PATH};
use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const RELAY_EFI_GUID: &str = "a7b3c4d5-e6f7-4890-abcd-ef1234567890";
pub const RELAY_EFI_TABLE_NAME: &str = "RelayVisualState";

#[derive(Debug, Error)]
pub enum ProtocolError {
    #[error("unsupported relay state version: {0}")]
    UnsupportedVersion(u32),
    #[error("state file missing")]
    Missing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BootDiagnostics {
    pub boot_id: String,
    pub continuity: ContinuityStatus,
    pub first_frame_ms: Option<u64>,
    pub visual_handoffs: u32,
    pub failed_handoffs: u32,
    pub black_screen_events: u32,
    pub events: Vec<relay_core::RelayEvent>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContinuityStatus {
    Good,
    Degraded,
    Failed,
}

impl BootDiagnostics {
    pub fn from_events(events: Vec<relay_core::RelayEvent>, boot_id: String) -> Self {
        let mut visual_handoffs = 0u32;
        let mut failed_handoffs = 0u32;
        let mut black_screen_events = 0u32;
        let mut degraded = false;

        let first_frame_ms = events
            .iter()
            .find(|e| matches!(e.kind, relay_core::RelayEventKind::BootFirstFrame))
            .map(|e| (e.timestamp_ns / 1_000_000) as u64);

        for event in &events {
            match &event.kind {
                relay_core::RelayEventKind::HandoffComplete { .. } => visual_handoffs += 1,
                relay_core::RelayEventKind::HandoffBegin { .. } => {}
                relay_core::RelayEventKind::BootDegraded { .. } => degraded = true,
                relay_core::RelayEventKind::BlackScreenDetected { .. } => {
                    black_screen_events += 1;
                    degraded = true;
                }
                relay_core::RelayEventKind::RecoveryEntered { .. } => {
                    failed_handoffs += 1;
                    degraded = true;
                }
                _ => {}
            }
        }

        let continuity = if failed_handoffs > 0 {
            ContinuityStatus::Failed
        } else if degraded || black_screen_events > 0 {
            ContinuityStatus::Degraded
        } else {
            ContinuityStatus::Good
        };

        Self {
            boot_id,
            continuity,
            first_frame_ms,
            visual_handoffs,
            failed_handoffs,
            black_screen_events,
            events,
        }
    }
}

pub fn write_state(path: impl AsRef<Path>, state: &RelayVisualState) -> Result<()> {
    let path = path.as_ref();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).with_context(|| format!("create {}", parent.display()))?;
    }
    let json = serde_json::to_vec_pretty(state).context("serialize relay state")?;
    let tmp = path.with_extension("tmp");
    {
        let mut file = fs::File::create(&tmp)
            .with_context(|| format!("create {}", tmp.display()))?;
        file.write_all(&json)?;
        file.sync_all()?;
    }
    fs::rename(&tmp, path).with_context(|| format!("rename {}", path.display()))?;
    Ok(())
}

pub fn read_state(path: impl AsRef<Path>) -> Result<RelayVisualState, ProtocolError> {
    let path = path.as_ref();
    let data = fs::read_to_string(path).map_err(|_| ProtocolError::Missing)?;
    let state: RelayVisualState =
        serde_json::from_str(&data).map_err(|_| ProtocolError::Missing)?;
    if state.version != relay_core::RELAY_STATE_VERSION {
        return Err(ProtocolError::UnsupportedVersion(state.version));
    }
    Ok(state)
}

pub fn load_state() -> Option<RelayVisualState> {
    read_state(RELAY_STATE_PATH).ok()
}

pub fn persist_state(state: &RelayVisualState) -> Result<()> {
    write_state(RELAY_STATE_PATH, state)
}

pub fn state_from_efi_payload(payload: &[u8]) -> Option<RelayVisualState> {
    let trimmed = trim_nul(payload);
    if let Ok(mut state) = serde_json::from_slice::<RelayVisualState>(trimmed) {
        state.stage = relay_core::RelayStage::Initramfs;
        return Some(state);
    }

    #[derive(Deserialize)]
    struct PartialEfiState {
        width: Option<u32>,
        height: Option<u32>,
        spinner_phase: Option<f32>,
        #[serde(default)]
        flags: Option<u32>,
        #[serde(default)]
        _mode: Option<u8>,
        ax: Option<i32>,
        ay: Option<i32>,
        aw: Option<u32>,
        ah: Option<u32>,
    }

    let partial: PartialEfiState = serde_json::from_slice(trimmed).ok()?;
    let mut state = RelayVisualState::new_boot_scene(
        partial.width.unwrap_or(1920),
        partial.height.unwrap_or(1080),
    );
    if let Some(phase) = partial.spinner_phase {
        state.spinner_phase = phase;
    }
    if let Some(flags) = partial.flags {
        state.flags = relay_core::VisualFlags::from_bits_truncate(flags);
    }
    if let (Some(x), Some(y), Some(w), Some(h)) =
        (partial.ax, partial.ay, partial.aw, partial.ah)
    {
        state.activity_rect = relay_core::Rect { x, y, w, h };
        state.flags |= relay_core::VisualFlags::ACTIVITY_LOCKED;
    }
    state.stage = relay_core::RelayStage::Initramfs;
    Some(state)
}

/// Load visual state handed off from RelayBoot via EFI config table or cmdline.
pub fn load_state_from_efi() -> Option<RelayVisualState> {
    if let Some(payload) = read_efi_config_table(RELAY_EFI_GUID) {
        if let Some(state) = state_from_efi_payload(&payload) {
            return Some(state);
        }
    }
    if let Some(payload) = read_cmdline_relay_state() {
        if let Some(state) = state_from_efi_payload(payload.as_bytes()) {
            return Some(state);
        }
    }
    None
}

fn trim_nul(payload: &[u8]) -> &[u8] {
    payload.split(|&b| b == 0).next().unwrap_or(payload)
}

fn read_efi_config_table(guid: &str) -> Option<Vec<u8>> {
    let base = Path::new("/sys/firmware/efi/config_tables");
    if !base.is_dir() {
        return None;
    }

    let guid_lower = guid.to_ascii_lowercase();
    let entries = [guid_lower.clone(), guid_lower.replace('-', "")];

    for entry in fs::read_dir(base).ok()? {
        let entry = entry.ok()?;
        let name = entry.file_name().to_string_lossy().to_string();
        if !entries.iter().any(|g| name.eq_ignore_ascii_case(g)) {
            continue;
        }
        let data_path = entry.path().join("data");
        if data_path.is_file() {
            return fs::read(&data_path).ok();
        }
        return fs::read(entry.path()).ok();
    }
    None
}

fn read_cmdline_relay_state() -> Option<String> {
    let cmdline = fs::read_to_string("/proc/cmdline").ok()?;
    for token in cmdline.split_whitespace() {
        let Some(value) = token.strip_prefix("relay.state=") else {
            continue;
        };
        return decode_relay_state_token(value);
    }
    None
}

fn decode_relay_state_token(value: &str) -> Option<String> {
    if let Some(b64) = value.strip_prefix("b64:") {
        use std::io::Read;
        let bytes = base64_decode(b64)?;
        let mut out = String::new();
        bytes.as_slice().read_to_string(&mut out).ok()?;
        return Some(out);
    }
    Some(value.to_string())
}

fn base64_decode(input: &str) -> Option<Vec<u8>> {
    const TABLE: &[u8; 128] = &{
        let mut table = [255u8; 128];
        let mut i = 0u8;
        while i < 26 {
            table[(b'A' + i) as usize] = i;
            table[(b'a' + i) as usize] = i + 26;
            i += 1;
        }
        let mut d = 0u8;
        while d < 10 {
            table[(b'0' + d) as usize] = d + 52;
            d += 1;
        }
        table[b'+' as usize] = 62;
        table[b'/' as usize] = 63;
        table
    };

    let mut out = Vec::with_capacity(input.len() * 3 / 4);
    let mut buf = 0u32;
    let mut bits = 0u32;
    for &byte in input.as_bytes() {
        if byte == b'=' {
            break;
        }
        if byte >= 128 {
            return None;
        }
        let val = TABLE[byte as usize];
        if val == 255 {
            continue;
        }
        buf = (buf << 6) | val as u32;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
            buf &= (1 << bits) - 1;
        }
    }
    Some(out)
}

pub fn state_to_efi_payload(state: &RelayVisualState) -> Result<Vec<u8>> {
    Ok(serde_json::to_vec(state)?)
}