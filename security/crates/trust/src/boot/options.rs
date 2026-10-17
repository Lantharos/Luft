use crate::system::efi;

const BOOT_CURRENT: &str = "BootCurrent";
const MEDIA: u8 = 4;
const HARD_DRIVE: u8 = 1;
const FILE_PATH: u8 = 4;
const END: u8 = 0x7f;
const GPT: u8 = 2;

pub struct LoadOption {
    pub number: u16,
    pub label: String,
    pub partition: Option<String>,
    pub path: String,
}

impl LoadOption {
    pub fn starts_from(&self, partition: &str, folder: &str) -> bool {
        let prefix = format!("\\{}\\", folder.replace('/', "\\")).to_lowercase();
        self.partition.as_deref() == Some(partition)
            && self.path.to_lowercase().starts_with(&prefix)
    }
}

pub fn guid_text(bytes: &[u8; 16]) -> String {
    format!(
        "{:08x}-{:04x}-{:04x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
        u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]),
        u16::from_le_bytes([bytes[4], bytes[5]]),
        u16::from_le_bytes([bytes[6], bytes[7]]),
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

pub fn guid_bytes(text: &str) -> Option<[u8; 16]> {
    let hex: String = text.chars().filter(|character| *character != '-').collect();
    if hex.len() != 32 {
        return None;
    }
    let mut raw = [0u8; 16];
    for (index, byte) in raw.iter_mut().enumerate() {
        *byte = u8::from_str_radix(hex.get(index * 2..index * 2 + 2)?, 16).ok()?;
    }
    raw[..4].reverse();
    raw[4..6].reverse();
    raw[6..8].reverse();
    Some(raw)
}

fn u16_at(data: &[u8], at: usize) -> Option<u16> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?))
}

fn parse(number: u16, data: &[u8]) -> Option<LoadOption> {
    let paths_length = usize::from(u16_at(data, 4)?);
    let label_end = (6..data.len())
        .step_by(2)
        .find(|at| u16_at(data, *at) == Some(0))?;
    let label = efi::text(&data[6..label_end]);
    let paths = data.get(label_end + 2..label_end + 2 + paths_length)?;
    let mut option = LoadOption {
        number,
        label,
        partition: None,
        path: String::new(),
    };
    let mut at = 0;
    while let (Some(&kind), Some(&subtype), Some(length)) =
        (paths.get(at), paths.get(at + 1), u16_at(paths, at + 2))
    {
        let length = usize::from(length);
        if kind == END || length < 4 {
            break;
        }
        let node = paths.get(at + 4..at + length)?;
        match (kind, subtype) {
            (MEDIA, HARD_DRIVE) if node.get(36) == Some(&GPT) => {
                option.partition = Some(guid_text(node.get(20..36)?.try_into().ok()?));
            }
            (MEDIA, FILE_PATH) => option.path.push_str(&efi::text(node)),
            _ => {}
        }
        at += length;
    }
    Some(option)
}

fn number(name: &str) -> Option<u16> {
    let digits = name.strip_prefix("Boot")?;
    (digits.len() == 4)
        .then(|| u16::from_str_radix(digits, 16).ok())
        .flatten()
}

pub fn all() -> Vec<LoadOption> {
    let mut options: Vec<LoadOption> = efi::global_variable_names()
        .iter()
        .filter_map(|name| {
            let number = number(name)?;
            parse(number, &efi::global_variable(name)?)
        })
        .collect();
    options.sort_by_key(|option| option.number);
    options
}

pub fn current() -> Option<u16> {
    u16_at(&efi::global_variable(BOOT_CURRENT)?, 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn utf16(text: &str) -> Vec<u8> {
        text.encode_utf16()
            .chain([0])
            .flat_map(u16::to_le_bytes)
            .collect()
    }

    #[test]
    fn reads_the_partition_and_file_of_a_boot_entry() {
        let partition = "6f3c0a5e-1b2d-4c3e-9f40-0123456789ab";
        let mut hard_drive = vec![MEDIA, HARD_DRIVE, 42, 0];
        hard_drive.extend(1u32.to_le_bytes());
        hard_drive.extend(2048u64.to_le_bytes());
        hard_drive.extend(204_800u64.to_le_bytes());
        hard_drive.extend(guid_bytes(partition).unwrap());
        hard_drive.extend([GPT, 2]);
        let file = utf16("\\EFI\\Microsoft\\Boot\\bootmgfw.efi");
        let mut file_node = vec![MEDIA, FILE_PATH];
        file_node.extend(u16::try_from(file.len() + 4).unwrap().to_le_bytes());
        file_node.extend(file);
        let paths: Vec<u8> = [hard_drive, file_node, vec![END, 0xff, 4, 0]].concat();
        let mut data = 1u32.to_le_bytes().to_vec();
        data.extend(u16::try_from(paths.len()).unwrap().to_le_bytes());
        data.extend(utf16("Windows Boot Manager"));
        data.extend(paths);

        let option = parse(0, &data).unwrap();
        assert_eq!(option.label, "Windows Boot Manager");
        assert_eq!(option.partition.as_deref(), Some(partition));
        assert!(option.starts_from(partition, "EFI/Microsoft"));
        assert!(!option.starts_from(partition, "EFI/Microsoft2"));
    }
}
