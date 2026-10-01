use std::collections::BTreeMap;
use std::path::Path;

use anyhow::Result;
use serde::Deserialize;

use crate::system::command::Tool;

#[derive(Deserialize)]
struct Metadata {
    #[serde(default)]
    keyslots: BTreeMap<String, Keyslot>,
    #[serde(default)]
    tokens: BTreeMap<String, Token>,
    #[serde(default)]
    segments: BTreeMap<String, Segment>,
}

#[derive(Deserialize)]
struct Keyslot {
    #[serde(rename = "type")]
    kind: String,
    mode: Option<String>,
}

#[derive(Deserialize, Clone)]
pub struct Token {
    #[serde(rename = "type")]
    pub kind: String,
    #[serde(default)]
    pub keyslots: Vec<String>,
    #[serde(rename = "tpm2-pin", default)]
    pub tpm2_pin: bool,
}

#[derive(Deserialize)]
struct Segment {
    #[serde(rename = "type")]
    kind: String,
    offset: String,
    size: String,
    #[serde(default)]
    flags: Vec<String>,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Direction {
    Encrypt,
    Decrypt,
}

#[derive(Clone)]
pub struct Header {
    pub uuid: String,
    pub keyslots: Vec<u32>,
    pub tokens: Vec<(u32, Token)>,
    pub reencrypting: Option<Direction>,
    pub done: f64,
}

pub const TPM2: &str = "systemd-tpm2";
pub const RECOVERY: &str = "systemd-recovery";
pub const FIDO2: &str = "systemd-fido2";

impl Header {
    pub fn has(&self, kind: &str) -> bool {
        self.tokens.iter().any(|(_, token)| token.kind == kind)
    }

    pub fn tpm_pin(&self) -> bool {
        self.tokens
            .iter()
            .any(|(_, token)| token.kind == TPM2 && token.tpm2_pin)
    }

    pub fn slots_of(&self, kind: &str) -> Vec<u32> {
        self.tokens
            .iter()
            .filter(|(_, token)| token.kind == kind)
            .flat_map(|(_, token)| token.keyslots.iter().filter_map(|slot| slot.parse().ok()))
            .collect()
    }

    pub fn passphrase_slots(&self) -> Vec<u32> {
        let claimed: Vec<u32> = self
            .tokens
            .iter()
            .flat_map(|(_, token)| token.keyslots.iter().filter_map(|slot| slot.parse().ok()))
            .collect();
        self.keyslots
            .iter()
            .copied()
            .filter(|slot| !claimed.contains(slot))
            .collect()
    }

    pub fn free_slot(&self) -> u32 {
        (0..32)
            .find(|slot| !self.keyslots.contains(slot))
            .unwrap_or(31)
    }
}

fn number(text: &str) -> Option<u64> {
    text.parse().ok()
}

fn progress(segments: &BTreeMap<String, Segment>, direction: Direction, device_size: u64) -> f64 {
    let wanted = match direction {
        Direction::Encrypt => "crypt",
        Direction::Decrypt => "linear",
    };
    let mut done = 0u64;
    let mut data_start = u64::MAX;
    for segment in segments.values().filter(|segment| segment.flags.is_empty()) {
        let offset = number(&segment.offset).unwrap_or(0);
        data_start = data_start.min(offset);
        if segment.kind == wanted {
            done += number(&segment.size).unwrap_or_else(|| device_size.saturating_sub(offset));
        }
    }
    let total = device_size.saturating_sub(if data_start == u64::MAX {
        0
    } else {
        data_start
    });
    if total == 0 {
        0.0
    } else {
        (done as f64 / total as f64).clamp(0.0, 1.0)
    }
}

pub fn read(device: &Path, detached: Option<&Path>, device_size: u64) -> Result<Option<Header>> {
    let with_header = |tool: Tool| match detached {
        Some(header) => tool.arg("--header").arg(header),
        None => tool,
    };
    let source = detached.unwrap_or(device);
    if !Tool::new("cryptsetup").arg("isLuks").arg(source).succeeds() {
        return Ok(None);
    }
    let json = with_header(Tool::new("cryptsetup").args(["luksDump", "--dump-json-metadata"]))
        .arg(device)
        .output()?;
    let metadata: Metadata = serde_json::from_str(&json)?;
    let uuid = Tool::new("cryptsetup")
        .arg("luksUUID")
        .arg(source)
        .output()?;
    let reencrypting = metadata.keyslots.values().find_map(|slot| {
        (slot.kind == "reencrypt").then_some(match slot.mode.as_deref() {
            Some("decrypt") => Direction::Decrypt,
            _ => Direction::Encrypt,
        })
    });
    Ok(Some(Header {
        uuid: uuid.trim().to_owned(),
        keyslots: metadata
            .keyslots
            .iter()
            .filter(|(_, slot)| slot.kind == "luks2")
            .filter_map(|(slot, _)| slot.parse().ok())
            .collect(),
        tokens: metadata
            .tokens
            .into_iter()
            .filter_map(|(id, token)| Some((id.parse().ok()?, token)))
            .collect(),
        done: reencrypting.map_or(1.0, |direction| {
            progress(&metadata.segments, direction, device_size)
        }),
        reencrypting,
    }))
}
