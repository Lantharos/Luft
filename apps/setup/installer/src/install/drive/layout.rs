use crate::survey::ALIGNMENT;

const MIB: u64 = 1 << 20;
const ESP_SIZE: u64 = 1024 * MIB;
const XBOOTLDR_SIZE: u64 = 2048 * MIB;
const SMALLEST_SHARED_ESP: u64 = 1024 * MIB;
const GPT_TAIL: u64 = MIB;

pub const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
pub const XBOOTLDR_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";
const ROOT_TYPE: &str = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Role {
    Esp,
    Xbootldr,
    Root,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Startup {
    NewEsp,
    SharedEsp,
    Xbootldr,
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
            Self::Xbootldr => XBOOTLDR_TYPE,
            Self::Root => ROOT_TYPE,
        }
    }

    pub fn filesystem(self) -> (&'static str, &'static str) {
        match self {
            Self::Esp => ("vfat", "EFI"),
            Self::Xbootldr => ("vfat", "LUFT-BOOT"),
            Self::Root => ("btrfs", "luft"),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Esp => "EFI system partition",
            Self::Xbootldr => "Luft startup",
            Self::Root => "Luft",
        }
    }
}

impl Startup {
    pub fn for_esp(esp_size: Option<u64>) -> Self {
        match esp_size {
            None => Self::NewEsp,
            Some(size) if size >= SMALLEST_SHARED_ESP => Self::SharedEsp,
            Some(_) => Self::Xbootldr,
        }
    }

    fn partition(self) -> Option<(Role, u64)> {
        match self {
            Self::NewEsp => Some((Role::Esp, ESP_SIZE)),
            Self::SharedEsp => None,
            Self::Xbootldr => Some((Role::Xbootldr, XBOOTLDR_SIZE)),
        }
    }

    pub fn space(self) -> u64 {
        self.partition().map_or(0, |(_, size)| size)
    }
}

pub fn whole_drive(size: u64) -> Vec<Part> {
    within(ALIGNMENT, size - ALIGNMENT - GPT_TAIL, Startup::NewEsp)
}

pub fn within(offset: u64, size: u64, startup: Startup) -> Vec<Part> {
    let start = offset.div_ceil(ALIGNMENT) * ALIGNMENT;
    let end = (offset + size) / ALIGNMENT * ALIGNMENT;
    let mut parts = Vec::new();
    let mut cursor = start;
    if let Some((role, size)) = startup.partition() {
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
        let parts = within(100 * GIB + 4096, 60 * GIB, Startup::for_esp(Some(GIB)));
        assert_eq!(parts.len(), 1);
        assert_eq!(parts[0].role, Role::Root);
        assert_eq!(parts[0].offset % ALIGNMENT, 0);
        assert!(parts[0].offset >= 100 * GIB + 4096);
        assert!(parts[0].offset + parts[0].size <= 160 * GIB + 4096);
    }

    #[test]
    fn a_small_esp_gets_a_startup_partition_next_to_luft() {
        let startup = Startup::for_esp(Some(100 * MIB));
        let parts = within(200 * GIB, 60 * GIB, startup);
        let roles: Vec<Role> = parts.iter().map(|part| part.role).collect();
        assert_eq!(roles, [Role::Xbootldr, Role::Root]);
        assert_eq!(parts[0].size, startup.space());
        assert_eq!(parts[0].offset + parts[0].size, parts[1].offset);
    }
}
