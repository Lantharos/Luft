use serde::Deserialize;
use serde_json::{Map, Value};

use crate::windows::helper::drive::raw::RawDisk;

const MAGIC: &[u8] = b"LUKS\xba\xbe";
const JSON_AREA: usize = 4096;
const LARGEST_HEADER: u64 = 4 << 20;
const TPM2: &str = "systemd-tpm2";
const REENCRYPT: &str = "reencrypt";

#[derive(Clone, Copy)]
pub struct Encryption {
    pub reencrypting: bool,
    pub tpm: bool,
}

#[derive(Deserialize)]
struct Metadata {
    #[serde(default)]
    keyslots: Map<String, Value>,
    #[serde(default)]
    tokens: Map<String, Value>,
}

fn any_of(entries: &Map<String, Value>, kind: &str) -> bool {
    entries
        .values()
        .any(|entry| entry.get("type").and_then(Value::as_str) == Some(kind))
}

pub fn read(raw: &mut RawDisk, offset: u64) -> Option<Option<Encryption>> {
    let head = raw.read(offset, JSON_AREA).ok()?;
    if head.get(..MAGIC.len())? != MAGIC {
        return Some(None);
    }
    let size = u64::from_be_bytes(head.get(8..16)?.try_into().ok()?).min(LARGEST_HEADER);
    let header = raw.read(offset, size as usize).ok()?;
    let json = header.get(JSON_AREA..)?;
    let end = json
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(json.len());
    let metadata: Metadata = serde_json::from_slice(&json[..end]).ok()?;
    Some(Some(Encryption {
        reencrypting: any_of(&metadata.keyslots, REENCRYPT),
        tpm: any_of(&metadata.tokens, TPM2),
    }))
}
