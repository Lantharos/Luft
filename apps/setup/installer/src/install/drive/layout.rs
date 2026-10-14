use crate::survey::ALIGNMENT;

const MIB: u64 = 1 << 20;
const ESP_SIZE: u64 = 1024 * MIB;
pub const SMALLEST_SHARED_ESP: u64 = 1024 * MIB;
const GPT_TAIL: u64 = MIB;

pub const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
const ROOT_TYPE: &str = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Role {
    Esp,
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
            Self::Esp => ESP_TYPE,
            Self::Root => ROOT_TYPE,
        }
    }

    pub fn filesystem(self) -> (&'static str, &'static str) {
        match self {
            Self::Esp => ("vfat", "EFI"),
            Self::Root => ("btrfs", "luft"),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Esp => "EFI system partition",
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
    let mut parts = Vec::new();
    let mut cursor = start;
    if own_esp {
        parts.push(Part {
            role: Role::Esp,
            offset: cursor,
            size: ESP_SIZE,
        });
        cursor += ESP_SIZE;
    }
    parts.push(Part {
        role: Role::Root,
        offset: cursor,
        size: end.saturating_sub(cursor),
    });
    parts
}

pub fn overhead(own_esp: bool) -> u64 {
    if own_esp { ESP_SIZE } else { 0 }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    #[test]
    fn a_whole_drive_gets_an_esp_and_luft_back_to_back() {
        let parts = whole_drive(256 * GIB);
        let roles: Vec<Role> = parts.iter().map(|part| part.role).collect();
        assert_eq!(roles, [Role::Esp, Role::Root]);
        assert_eq!(parts[0].offset, ALIGNMENT);
        assert_eq!(parts[0].offset + parts[0].size, parts[1].offset);
        let last = parts[1];
        assert!(last.offset + last.size <= 256 * GIB - GPT_TAIL);
        assert_eq!(last.size % ALIGNMENT, 0);
    }

    #[test]
    fn free_space_is_aligned_and_reuses_a_roomy_esp() {
        let parts = within(100 * GIB + 4096, 60 * GIB, !shares_esp(Some(GIB)));
        assert_eq!(parts.len(), 1);
        assert_eq!(parts[0].role, Role::Root);
        assert_eq!(parts[0].offset % ALIGNMENT, 0);
        assert!(parts[0].offset >= 100 * GIB + 4096);
        assert!(parts[0].offset + parts[0].size <= 160 * GIB + 4096);
    }
}
