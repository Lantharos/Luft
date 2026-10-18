use sha2::{Digest, Sha256};

use super::efi;

const LOG: &str = "/sys/kernel/security/tpm0/binary_bios_measurements";
const SECURE_BOOT_PCR: u32 = 7;
const SHA256: u16 = 0x000b;
const NO_ACTION: u32 = 0x3;
const VARIABLE_DRIVER_CONFIG: u32 = 0x8000_0001;
const LEGACY_HEADER: usize = 4 + 4 + 20;
const SPEC_ID_HEADER: usize = 16 + 4 + 4;
const VARIABLE_HEADER: usize = 16 + 8 + 8;

type Sha256Digest = [u8; 32];

struct Event {
    kind: u32,
    digest: Sha256Digest,
    data: Vec<u8>,
}

struct Reader<'a> {
    data: &'a [u8],
}

impl<'a> Reader<'a> {
    fn take(&mut self, size: usize) -> Option<&'a [u8]> {
        let (taken, rest) = self.data.split_at_checked(size)?;
        self.data = rest;
        Some(taken)
    }

    fn u16(&mut self) -> Option<u16> {
        Some(u16::from_le_bytes(self.take(2)?.try_into().ok()?))
    }

    fn u32(&mut self) -> Option<u32> {
        Some(u32::from_le_bytes(self.take(4)?.try_into().ok()?))
    }

    fn u64(&mut self) -> Option<u64> {
        Some(u64::from_le_bytes(self.take(8)?.try_into().ok()?))
    }

    fn sized(&mut self) -> Option<&'a [u8]> {
        let size = self.u32()? as usize;
        self.take(size)
    }
}

fn digest_sizes(spec_id: &[u8]) -> Option<Vec<(u16, usize)>> {
    let mut reader = Reader { data: spec_id };
    reader.take(SPEC_ID_HEADER)?;
    (0..reader.u32()?)
        .map(|_| Some((reader.u16()?, usize::from(reader.u16()?))))
        .collect()
}

fn secure_boot_events(log: &[u8]) -> Option<Vec<Event>> {
    let mut reader = Reader { data: log };
    reader.take(LEGACY_HEADER)?;
    let sizes = digest_sizes(reader.sized()?)?;
    let mut events = Vec::new();
    while !reader.data.is_empty() {
        let pcr = reader.u32()?;
        let kind = reader.u32()?;
        let mut digest = None;
        for _ in 0..reader.u32()? {
            let algorithm = reader.u16()?;
            let (_, size) = sizes.iter().find(|(id, _)| *id == algorithm)?;
            let bytes = reader.take(*size)?;
            if algorithm == SHA256 {
                digest = bytes.try_into().ok();
            }
        }
        let data = reader.sized()?;
        if pcr == SECURE_BOOT_PCR && kind != NO_ACTION {
            events.push(Event {
                kind,
                digest: digest?,
                data: data.to_vec(),
            });
        }
    }
    Some(events)
}

fn guid(bytes: &[u8; 16]) -> String {
    format!(
        "{:08x}-{:04x}-{:04x}-{}-{}",
        u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]),
        u16::from_le_bytes([bytes[4], bytes[5]]),
        u16::from_le_bytes([bytes[6], bytes[7]]),
        hex(&bytes[8..10]),
        hex(&bytes[10..]),
    )
}

fn with_value_now(measured: &[u8]) -> Option<Vec<u8>> {
    let mut reader = Reader { data: measured };
    let vendor = reader.take(16)?.try_into().ok()?;
    let name_units = usize::try_from(reader.u64()?).ok()?;
    reader.u64()?;
    let name = reader.take(name_units.checked_mul(2)?)?;
    let value = efi::variable(&efi::text(name), &guid(vendor)).unwrap_or_default();
    let mut now = measured[..VARIABLE_HEADER + name.len()].to_vec();
    now[16 + 8..VARIABLE_HEADER].copy_from_slice(&(value.len() as u64).to_le_bytes());
    now.extend(value);
    Some(now)
}

fn sha256(data: &[u8]) -> Sha256Digest {
    Sha256::digest(data).into()
}

fn replay(digests: impl IntoIterator<Item = Sha256Digest>) -> String {
    let pcr = digests.into_iter().fold([0u8; 32], |pcr, digest| {
        sha256(&[pcr.as_slice(), digest.as_slice()].concat())
    });
    hex(&pcr)
}

pub fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

pub fn next_secure_boot_pcr(now: &str) -> Option<String> {
    let events = secure_boot_events(&std::fs::read(LOG).ok()?)?;
    if replay(events.iter().map(|event| event.digest)) != now {
        return None;
    }
    let digests = events
        .iter()
        .map(|event| {
            if event.kind != VARIABLE_DRIVER_CONFIG {
                return Some(event.digest);
            }
            (sha256(&event.data) == event.digest)
                .then(|| with_value_now(&event.data).map(|now| sha256(&now)))?
        })
        .collect::<Option<Vec<_>>>()?;
    Some(replay(digests))
}
