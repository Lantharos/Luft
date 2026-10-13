use crate::survey::ALIGNMENT;

const MIB: u64 = 1 << 20;
const BIOS_BOOT_SIZE: u64 = MIB;
const ESP_SIZE: u64 = 1024 * MIB;
const SMALLEST_SHARED_ESP: u64 = 512 * MIB;
const BOOT_SIZE: u64 = 2048 * MIB;
const GPT_TAIL: u64 = MIB;

const BIOS_BOOT_TYPE: &str = "21686148-6449-6e6f-744e-656564454649";
pub const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
const BOOT_TYPE: &str = "0fc63daf-8483-4772-8e79-3d69d8477de4";
const ROOT_TYPE: &str = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Role {
    BiosBoot,
    Esp,
    Boot,
    Root,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Part {
    pub role: Role,
    pub offset: u64,
    pub size: u64,
}

impl Role {
    pub fn partition_type(self) -> &'static str {
        match self {
            Self::BiosBoot => BIOS_BOOT_TYPE,
            Self::Esp => ESP_TYPE,
            Self::Boot => BOOT_TYPE,
            Self::Root => ROOT_TYPE,
        }
    }

    pub fn filesystem(self) -> Option<(&'static str, &'static str)> {
        match self {
            Self::BiosBoot => None,
            Self::Esp => Some(("vfat", "EFI")),
            Self::Boot => Some(("ext4", "boot")),
            Self::Root => Some(("btrfs", "luft")),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::BiosBoot => "BIOS boot",
            Self::Esp => "EFI system partition",
            Self::Boot => "Luft boot",
            Self::Root => "Luft",
        }
    }
}

pub fn whole_drive(size: u64) -> Vec<Part> {
    within(ALIGNMENT, size - ALIGNMENT - GPT_TAIL, true)
}

pub fn shares_esp(esp_size: Option<u64>) -> bool {
    esp_size.is_some_and(|size| size >= SMALLEST_SHARED_ESP)
}

pub fn within(offset: u64, size: u64, own_esp: bool) -> Vec<Part> {
    let start = offset.div_ceil(ALIGNMENT) * ALIGNMENT;
    let end = (offset + size) / ALIGNMENT * ALIGNMENT;
    let fixed = [
        (Role::BiosBoot, BIOS_BOOT_SIZE),
        (Role::Esp, ESP_SIZE),
        (Role::Boot, BOOT_SIZE),
    ];
    let mut parts: Vec<Part> = Vec::new();
    let mut cursor = start;
    for (role, size) in fixed
        .into_iter()
        .filter(|(role, _)| own_esp || *role != Role::Esp)
    {
        parts.push(Part {
            role,
            offset: cursor,
            size,
        });
        cursor += size;
    }
    parts.push(Part {
        role: Role::Root,
        offset: cursor,
        size: end.saturating_sub(cursor),
    });
    parts
}

pub fn overhead(own_esp: bool) -> u64 {
    BIOS_BOOT_SIZE + BOOT_SIZE + if own_esp { ESP_SIZE } else { 0 }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    #[test]
    fn a_whole_drive_gets_every_partition_back_to_back() {
        let parts = whole_drive(256 * GIB);
        let roles: Vec<Role> = parts.iter().map(|part| part.role).collect();
        assert_eq!(roles, [Role::BiosBoot, Role::Esp, Role::Boot, Role::Root]);
        assert_eq!(parts[0].offset, ALIGNMENT);
        for pair in parts.windows(2) {
            assert_eq!(pair[0].offset + pair[0].size, pair[1].offset);
        }
        let last = parts[3];
        assert!(last.offset + last.size <= 256 * GIB - GPT_TAIL);
        assert_eq!(last.size % ALIGNMENT, 0);
    }

    #[test]
    fn free_space_is_aligned_and_reuses_a_roomy_esp() {
        let parts = within(100 * GIB + 4096, 60 * GIB, !shares_esp(Some(GIB)));
        assert_eq!(parts[1].role, Role::Boot);
        assert_eq!(parts[0].offset % ALIGNMENT, 0);
        assert!(parts[0].offset >= 100 * GIB + 4096);
        let root = parts[2];
        assert!(root.offset + root.size <= 160 * GIB + 4096);
    }

    #[test]
    fn a_small_windows_esp_gets_a_partner() {
        assert!(!shares_esp(Some(100 * MIB)));
        assert!(!shares_esp(None));
        assert_eq!(within(0, 40 * GIB, true)[1].role, Role::Esp);
    }
}
