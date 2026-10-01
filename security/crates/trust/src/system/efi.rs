use std::path::Path;

const VARIABLES: &str = "/sys/firmware/efi/efivars";
const MOK_VARIABLES: &str = "/sys/firmware/efi/mok-variables";
const GLOBAL: &str = "8be4df61-93ca-11d2-aa0d-00e098032b8c";
const SHIM: &str = "605dab50-e046-4300-abb6-3dd810dd8b23";
const STUB: &str = "4a67b082-0a4c-41cf-b6c7-440b29bb8c4f";
const X509: [u8; 16] = [
    0xa1, 0x59, 0xc0, 0xa5, 0xe4, 0x94, 0xa7, 0x4a, 0x87, 0xb5, 0xab, 0x15, 0x5c, 0x2b, 0xf0, 0x72,
];

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum SecureBoot {
    On,
    Off,
    Setup,
    Unsupported,
}

impl SecureBoot {
    pub fn name(self) -> &'static str {
        match self {
            Self::On => "on",
            Self::Off => "off",
            Self::Setup => "setup",
            Self::Unsupported => "unsupported",
        }
    }
}

pub fn booted_with_uefi() -> bool {
    Path::new("/sys/firmware/efi").is_dir()
}

fn variable(name: &str, guid: &str) -> Option<Vec<u8>> {
    let data = std::fs::read(format!("{VARIABLES}/{name}-{guid}")).ok()?;
    data.get(4..).map(<[u8]>::to_vec)
}

fn flag(name: &str, guid: &str) -> Option<bool> {
    variable(name, guid).and_then(|data| data.first().map(|value| *value == 1))
}

pub fn secure_boot() -> SecureBoot {
    if !booted_with_uefi() {
        return SecureBoot::Unsupported;
    }
    match (flag("SecureBoot", GLOBAL), flag("SetupMode", GLOBAL)) {
        (_, Some(true)) => SecureBoot::Setup,
        (Some(true), _) => SecureBoot::On,
        _ => SecureBoot::Off,
    }
}

pub fn measured_uki() -> bool {
    variable("StubPcrKernelImage", STUB).is_some()
}

pub fn requested_certificates() -> Vec<Vec<u8>> {
    certificates_in(&variable("MokNew", SHIM).unwrap_or_default())
}

fn mok_list() -> Vec<u8> {
    std::fs::read(format!("{MOK_VARIABLES}/MokListRT"))
        .ok()
        .or_else(|| variable("MokListRT", SHIM))
        .unwrap_or_default()
}

pub fn enrolled_certificates() -> Vec<Vec<u8>> {
    certificates_in(&mok_list())
}

fn read_u32(data: &[u8], at: usize) -> Option<usize> {
    let bytes = data.get(at..at + 4)?;
    Some(u32::from_le_bytes(bytes.try_into().ok()?) as usize)
}

fn certificates_in(mut lists: &[u8]) -> Vec<Vec<u8>> {
    let mut certificates = Vec::new();
    while lists.len() >= 28 {
        let (Some(list_size), Some(header_size), Some(signature_size)) = (
            read_u32(lists, 16),
            read_u32(lists, 20),
            read_u32(lists, 24),
        ) else {
            break;
        };
        if list_size < 28 || list_size > lists.len() || signature_size <= 16 {
            break;
        }
        if lists[..16] == X509 {
            let mut offset = 28 + header_size;
            while offset + signature_size <= list_size {
                certificates.push(lists[offset + 16..offset + signature_size].to_vec());
                offset += signature_size;
            }
        }
        lists = &lists[list_size..];
    }
    certificates
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_certificates_from_signature_lists() {
        let certificate = b"certificate".to_vec();
        let mut list = X509.to_vec();
        let signature_size = 16 + certificate.len();
        list.extend((28 + signature_size as u32).to_le_bytes());
        list.extend(0u32.to_le_bytes());
        list.extend((signature_size as u32).to_le_bytes());
        list.extend([7u8; 16]);
        list.extend(&certificate);
        let mut sha256 = vec![0x26u8; 16];
        sha256.extend((28 + 48u32).to_le_bytes());
        sha256.extend(0u32.to_le_bytes());
        sha256.extend(48u32.to_le_bytes());
        sha256.extend([0u8; 48]);
        sha256.extend(list);
        assert_eq!(certificates_in(&sha256), vec![certificate]);
    }
}
