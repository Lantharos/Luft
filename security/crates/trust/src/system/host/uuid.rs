use anyhow::Result;

const DASHES: [usize; 4] = [8, 13, 18, 23];

fn is_lower_hex(byte: u8) -> bool {
    matches!(byte, b'0'..=b'9' | b'a'..=b'f')
}

pub fn is_uuid(text: &str) -> bool {
    text.len() == 36
        && text.bytes().enumerate().all(|(index, byte)| {
            if DASHES.contains(&index) {
                byte == b'-'
            } else {
                is_lower_hex(byte)
            }
        })
}

fn is_mbr_partuuid(text: &str) -> bool {
    text.len() == 11
        && text.bytes().enumerate().all(|(index, byte)| {
            if index == 8 {
                byte == b'-'
            } else {
                is_lower_hex(byte)
            }
        })
}

pub fn is_partuuid(text: &str) -> bool {
    is_uuid(text) || is_mbr_partuuid(text)
}

pub fn random() -> Result<String> {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes)?;
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex: String = bytes.iter().map(|byte| format!("{byte:02x}")).collect();
    Ok(format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_only_plain_lowercase_ids() {
        assert!(is_uuid(&random().unwrap()));
        assert!(is_uuid("0fc63daf-8483-4772-8e79-3d69d8477de4"));
        assert!(!is_uuid("0FC63DAF-8483-4772-8E79-3D69D8477DE4"));
        assert!(!is_uuid("../../../../run/systemd/system/x.service"));
        assert!(!is_uuid("0fc63daf-8483-4772-8e79-3d69d8477de4\n"));
        assert!(is_partuuid("1234abcd-01"));
        assert!(!is_partuuid("1234abcd/01"));
    }
}
