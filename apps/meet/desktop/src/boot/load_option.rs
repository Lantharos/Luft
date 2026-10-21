pub const DESCRIPTION: &str = "Meet Luft";
const ACTIVE: u32 = 1;
const MEDIA: u8 = 0x04;
const HARD_DRIVE: u8 = 0x01;
const FILE_PATH: u8 = 0x04;
const GPT: u8 = 0x02;
const GUID_SIGNATURE: u8 = 0x02;
const END: [u8; 4] = [0x7f, 0xff, 0x04, 0x00];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Partition {
    pub number: u32,
    pub first_lba: u64,
    pub sectors: u64,
    pub guid: [u8; 16],
}

fn utf16_with_nul(text: &str) -> Vec<u8> {
    text.encode_utf16()
        .chain([0])
        .flat_map(u16::to_le_bytes)
        .collect()
}

fn hard_drive(partition: &Partition) -> Vec<u8> {
    let mut node = vec![MEDIA, HARD_DRIVE, 42, 0];
    node.extend(partition.number.to_le_bytes());
    node.extend(partition.first_lba.to_le_bytes());
    node.extend(partition.sectors.to_le_bytes());
    node.extend(partition.guid);
    node.extend([GPT, GUID_SIGNATURE]);
    node
}

fn file_path(path: &str) -> Vec<u8> {
    let name = utf16_with_nul(path);
    let length = (4 + name.len()) as u16;
    let mut node = vec![MEDIA, FILE_PATH];
    node.extend(length.to_le_bytes());
    node.extend(name);
    node
}

pub fn encode(partition: &Partition, loader: &str, description: &str) -> Vec<u8> {
    let device_path = [hard_drive(partition), file_path(loader), END.to_vec()].concat();
    let mut option = ACTIVE.to_le_bytes().to_vec();
    option.extend((device_path.len() as u16).to_le_bytes());
    option.extend(utf16_with_nul(description));
    option.extend(device_path);
    option
}

pub fn starts(option: &[u8], partition: &Partition, loader: &str) -> bool {
    let path = utf16_with_nul(loader);
    option.windows(16).any(|window| window == partition.guid)
        && option
            .windows(path.len())
            .any(|window| window == path.as_slice())
}

#[cfg(any(windows, test))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Decoded {
    pub description: String,
    pub partition: Option<[u8; 16]>,
    pub file: Option<String>,
    pub windows_object: Option<String>,
}

#[cfg(any(windows, test))]
fn utf16(bytes: &[u8]) -> String {
    let units: Vec<u16> = bytes
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16_lossy(&units)
}

#[cfg(any(windows, test))]
fn windows_object(optional: &[u8]) -> Option<String> {
    let marker: Vec<u8> = "BCDOBJECT="
        .encode_utf16()
        .flat_map(u16::to_le_bytes)
        .collect();
    let start = optional
        .windows(marker.len())
        .position(|window| window == marker)?
        + marker.len();
    let text = utf16(optional.get(start..)?);
    let end = text.find('}')?;
    text.starts_with('{').then(|| text[..=end].to_owned())
}

#[cfg(any(windows, test))]
pub fn decode(option: &[u8]) -> Option<Decoded> {
    let path_length = u16::from_le_bytes(option.get(4..6)?.try_into().ok()?) as usize;
    let description_end = 6 + option
        .get(6..)?
        .as_chunks::<2>()
        .0
        .iter()
        .position(|unit| *unit == [0, 0])?
        * 2;
    let path_start = description_end + 2;
    let mut path = option.get(path_start..path_start + path_length)?;
    let mut decoded = Decoded {
        description: utf16(&option[6..description_end]),
        partition: None,
        file: None,
        windows_object: windows_object(&option[path_start + path_length..]),
    };
    while let [kind, subtype, low, high, ..] = *path {
        let length = u16::from_le_bytes([low, high]) as usize;
        let node = path.get(..length).filter(|_| length >= 4)?;
        match (kind, subtype) {
            (MEDIA, HARD_DRIVE) if length == 42 && node[41] == GUID_SIGNATURE => {
                decoded.partition = Some(node[24..40].try_into().ok()?);
            }
            (MEDIA, FILE_PATH) => decoded.file = Some(utf16(&node[4..])),
            (0x7f, 0xff) => break,
            _ => {}
        }
        path = &path[length..];
    }
    Some(decoded)
}

pub fn numbers(order: &[u8]) -> impl Iterator<Item = u16> + '_ {
    order
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
}

pub fn without(order: &[u8], removed: &[u16]) -> Vec<u8> {
    numbers(order)
        .filter(|number| !removed.contains(number))
        .flat_map(u16::to_le_bytes)
        .collect()
}

pub fn appended(order: &[u8], number: u16) -> Vec<u8> {
    let mut order = without(order, &[number]);
    order.extend(number.to_le_bytes());
    order
}

pub fn variable(number: u16) -> String {
    format!("Boot{number:04X}")
}

pub fn guid_bytes(text: &str) -> Option<[u8; 16]> {
    let hex: String = text
        .trim_matches(|c| c == '{' || c == '}')
        .chars()
        .filter(|c| *c != '-')
        .collect();
    if hex.len() != 32 {
        return None;
    }
    let raw: Vec<u8> = (0..16)
        .map(|index| u8::from_str_radix(&hex[index * 2..index * 2 + 2], 16).ok())
        .collect::<Option<_>>()?;
    let mut bytes = [0; 16];
    bytes[..4].copy_from_slice(&[raw[3], raw[2], raw[1], raw[0]]);
    bytes[4..6].copy_from_slice(&[raw[5], raw[4]]);
    bytes[6..8].copy_from_slice(&[raw[7], raw[6]]);
    bytes[8..].copy_from_slice(&raw[8..]);
    Some(bytes)
}

#[cfg(any(windows, test))]
pub fn guid_text(bytes: &[u8; 16]) -> String {
    format!(
        "{:02x}{:02x}{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
        bytes[3],
        bytes[2],
        bytes[1],
        bytes[0],
        bytes[5],
        bytes[4],
        bytes[7],
        bytes[6],
        bytes[8],
        bytes[9],
        bytes[10],
        bytes[11],
        bytes[12],
        bytes[13],
        bytes[14],
        bytes[15]
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_entry_is_ours_only_when_it_starts_our_loader() {
        let partition = Partition {
            number: 1,
            first_lba: 2048,
            sectors: 1_228_800,
            guid: [7; 16],
        };
        let fedora = encode(&partition, r"\EFI\fedora\shimx64.efi", DESCRIPTION);
        let ours = encode(&partition, r"\EFI\luft-meet\shimx64.efi", DESCRIPTION);
        assert!(starts(&ours, &partition, r"\EFI\luft-meet\shimx64.efi"));
        assert!(!starts(&fedora, &partition, r"\EFI\luft-meet\shimx64.efi"));
    }

    const LOADER: &str = r"\EFI\BOOT\BOOTX64.EFI";

    #[test]
    fn guids_are_stored_mixed_endian() {
        assert_eq!(
            guid_bytes("{C12A7328-F81F-11D2-BA4B-00A0C93EC93B}").unwrap(),
            [
                0x28, 0x73, 0x2a, 0xc1, 0x1f, 0xf8, 0xd2, 0x11, 0xba, 0x4b, 0x00, 0xa0, 0xc9, 0x3e,
                0xc9, 0x3b
            ]
        );
        assert_eq!(guid_bytes("not a guid"), None);
        let esp = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
        assert_eq!(guid_text(&guid_bytes(esp).unwrap()), esp);
    }

    #[test]
    fn the_entry_starts_shim_from_luft_s_partition() {
        let guid = guid_bytes("0a1b2c3d-4e5f-4061-8273-8495a6b7c8d9").unwrap();
        let option = encode(
            &Partition {
                number: 5,
                first_lba: 2048,
                sectors: 1_048_576,
                guid,
            },
            LOADER,
            DESCRIPTION,
        );
        assert_eq!(&option[..4], &[1, 0, 0, 0]);
        let description = utf16_with_nul(DESCRIPTION);
        let path_start = 6 + description.len();
        let path_length = u16::from_le_bytes([option[4], option[5]]) as usize;
        assert_eq!(option.len(), path_start + path_length);
        let path = &option[path_start..];
        assert_eq!(&path[..4], &[MEDIA, HARD_DRIVE, 42, 0]);
        assert_eq!(&path[4..8], &5u32.to_le_bytes());
        assert_eq!(&path[24..40], &guid);
        assert_eq!(&path[42..44], &[MEDIA, FILE_PATH]);
        assert!(path.ends_with(&END));
    }

    #[test]
    fn an_entry_says_which_partition_and_file_it_starts() {
        let guid = guid_bytes("0a1b2c3d-4e5f-4061-8273-8495a6b7c8d9").unwrap();
        let option = encode(
            &Partition {
                number: 1,
                first_lba: 2048,
                sectors: 409_600,
                guid,
            },
            LOADER,
            DESCRIPTION,
        );
        assert_eq!(
            decode(&option),
            Some(Decoded {
                description: DESCRIPTION.to_owned(),
                partition: Some(guid),
                file: Some(LOADER.to_owned()),
                windows_object: None,
            })
        );
    }

    #[test]
    fn entries_windows_keeps_name_their_object() {
        let guid = guid_bytes("0a1b2c3d-4e5f-4061-8273-8495a6b7c8d9").unwrap();
        let mut option = encode(
            &Partition {
                number: 1,
                first_lba: 2048,
                sectors: 409_600,
                guid,
            },
            LOADER,
            DESCRIPTION,
        );
        option.extend(b"WINDOWS\0");
        option.extend([1, 0, 0, 0, 0x88, 0, 0, 0]);
        option.extend(
            "BCDOBJECT={9dea862c-5cdd-4e70-acc1-f32b344d4795}\0"
                .encode_utf16()
                .flat_map(u16::to_le_bytes),
        );
        assert_eq!(
            decode(&option).unwrap().windows_object.as_deref(),
            Some("{9dea862c-5cdd-4e70-acc1-f32b344d4795}")
        );
    }

    #[test]
    fn luft_goes_last_in_the_start_order() {
        let order = [1u16, 0, 5].map(u16::to_le_bytes).concat();
        assert_eq!(
            appended(&order, 0),
            [1u16, 5, 0].map(u16::to_le_bytes).concat()
        );
        assert_eq!(without(&order, &[5, 1]), 0u16.to_le_bytes());
    }
}
