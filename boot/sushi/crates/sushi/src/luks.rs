use std::collections::BTreeMap;
use std::io::Read;
use std::path::Path;

use serde::Deserialize;

const MAGIC: &[u8; 6] = b"LUKS\xba\xbe";
const BINARY_HEADER: usize = 4096;
const LARGEST_HEADER: usize = 4 << 20;

#[derive(Deserialize)]
struct Metadata {
    #[serde(default)]
    keyslots: BTreeMap<String, Keyslot>,
    #[serde(default)]
    tokens: BTreeMap<String, Token>,
}

#[derive(Deserialize)]
struct Keyslot {
    #[serde(rename = "type")]
    kind: String,
}

#[derive(Deserialize)]
struct Token {
    #[serde(rename = "type")]
    kind: String,
    #[serde(default)]
    keyslots: Vec<String>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct Unlocking {
    pub tpm: bool,
    pub security_key: bool,
    pub recovery_key: bool,
    pub passphrase: bool,
}

pub fn unlocking(device: &Path) -> Option<Unlocking> {
    let mut file = std::fs::File::open(device).ok()?;
    let mut binary = [0u8; BINARY_HEADER];
    file.read_exact(&mut binary).ok()?;
    if &binary[..6] != MAGIC || binary[6..8] != [0, 2] {
        return None;
    }
    let size = u64::from_be_bytes(binary[8..16].try_into().ok()?) as usize;
    let json_size = size
        .checked_sub(BINARY_HEADER)
        .filter(|size| *size <= LARGEST_HEADER)?;
    let mut json = vec![0u8; json_size];
    file.read_exact(&mut json).ok()?;
    let end = json
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(json.len());
    parse(&json[..end])
}

fn parse(json: &[u8]) -> Option<Unlocking> {
    let metadata: Metadata = serde_json::from_slice(json).ok()?;
    let has = |kind: &str| metadata.tokens.values().any(|token| token.kind == kind);
    let claimed: Vec<&String> = metadata
        .tokens
        .values()
        .flat_map(|token| &token.keyslots)
        .collect();
    Some(Unlocking {
        tpm: has("systemd-tpm2"),
        security_key: has("systemd-fido2"),
        recovery_key: has("systemd-recovery"),
        passphrase: metadata
            .keyslots
            .iter()
            .any(|(slot, keyslot)| keyslot.kind == "luks2" && !claimed.contains(&slot)),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tells_tokens_from_passphrases() {
        let json = br#"{"keyslots":{"0":{"type":"luks2"},"1":{"type":"luks2"},"2":{"type":"luks2"}},
            "tokens":{"0":{"type":"systemd-recovery","keyslots":["0"]},"1":{"type":"systemd-tpm2","keyslots":["1"]}}}"#;
        assert_eq!(
            parse(json),
            Some(Unlocking {
                tpm: true,
                security_key: false,
                recovery_key: true,
                passphrase: true,
            })
        );
    }
}
