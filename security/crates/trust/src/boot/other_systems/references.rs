use std::collections::HashMap;
use std::path::Path;

use crate::boot::options::guid_bytes;
use crate::system::blocks;

const BCD: &str = "Boot/BCD";
const GRUB_CONFIG: &str = "grub.cfg";
const LARGEST_BCD: u64 = 16 << 20;
const LARGEST_CONFIG: u64 = 1 << 20;

pub struct Partitions {
    by_partuuid: Vec<(String, [u8; 16])>,
    by_uuid: HashMap<String, String>,
}

fn plain(uuid: &str) -> String {
    uuid.chars()
        .filter(|character| *character != '-')
        .collect::<String>()
        .to_lowercase()
}

impl Partitions {
    pub fn read() -> Self {
        let partuuids = blocks::links("/dev/disk/by-partuuid");
        let partuuid_of: HashMap<String, String> = partuuids
            .iter()
            .map(|(partuuid, name)| (name.clone(), partuuid.to_lowercase()))
            .collect();
        let by_uuid = blocks::links("/dev/disk/by-uuid")
            .into_iter()
            .chain(partuuids.iter().cloned())
            .filter_map(|(uuid, name)| {
                let partition = blocks::partition_under(&name)?;
                Some((plain(&uuid), partuuid_of.get(&partition)?.clone()))
            })
            .collect();
        Self {
            by_partuuid: partuuids
                .into_iter()
                .filter_map(|(partuuid, _)| Some((partuuid.to_lowercase(), guid_bytes(&partuuid)?)))
                .collect(),
            by_uuid,
        }
    }

    fn named_in_bcd(&self, store: &[u8]) -> Vec<String> {
        self.by_partuuid
            .iter()
            .filter(|(_, bytes)| store.windows(16).any(|window| window == bytes))
            .map(|(partuuid, _)| partuuid.clone())
            .collect()
    }

    fn named_in_grub(&self, config: &str) -> Vec<String> {
        let mut found: Vec<String> = config
            .split(|character: char| {
                character.is_whitespace() || matches!(character, '=' | '"' | '\'' | ',' | '(' | ')')
            })
            .filter_map(|word| self.by_uuid.get(&plain(word)))
            .cloned()
            .collect();
        found.sort();
        found.dedup();
        found
    }
}

fn read_small(path: &Path, largest: u64) -> Option<Vec<u8>> {
    let size = std::fs::metadata(path).ok()?.len();
    (size <= largest).then(|| std::fs::read(path).ok()).flatten()
}

pub fn of_windows(folder: &Path, partitions: &Partitions) -> Vec<String> {
    read_small(&folder.join(BCD), LARGEST_BCD)
        .map(|store| partitions.named_in_bcd(&store))
        .unwrap_or_default()
}

pub fn of_grub(folder: &Path, partitions: &Partitions) -> Vec<String> {
    read_small(&folder.join(GRUB_CONFIG), LARGEST_CONFIG)
        .map(|config| partitions.named_in_grub(&String::from_utf8_lossy(&config)))
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn partitions() -> Partitions {
        let windows = "8d0b4b6c-6a5e-4d2b-9b1f-3c4d5e6f7a8b";
        Partitions {
            by_partuuid: vec![(windows.to_owned(), guid_bytes(windows).unwrap())],
            by_uuid: HashMap::from([
                (plain("3f6c1d2e-8b9a-4c7d-a1e2-f3b4c5d6e7f8"), "boot-partition".to_owned()),
                (plain("4e5d-9a1b"), "esp".to_owned()),
            ]),
        }
    }

    #[test]
    fn finds_the_partitions_a_grub_config_looks_for() {
        let config = "search --no-floppy --fs-uuid --set=dev 3f6c1d2e-8b9a-4c7d-a1e2-f3b4c5d6e7f8\n\
                      set prefix=($dev)/grub2\nsearch.fs_uuid 4E5D-9A1B esp\nexport $prefix\n";
        assert_eq!(partitions().named_in_grub(config), ["boot-partition", "esp"]);
    }

    #[test]
    fn finds_partitions_windows_boot_manager_names() {
        let mut store = vec![0u8; 64];
        store.extend(guid_bytes("8d0b4b6c-6a5e-4d2b-9b1f-3c4d5e6f7a8b").unwrap());
        store.extend([0u8; 32]);
        assert_eq!(partitions().named_in_bcd(&store), ["8d0b4b6c-6a5e-4d2b-9b1f-3c4d5e6f7a8b"]);
        assert!(partitions().named_in_bcd(&[0u8; 128]).is_empty());
    }
}
