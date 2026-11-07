use serde::{Deserialize, Serialize};

pub const MIB: u64 = 1 << 20;
pub const GIB: u64 = 1 << 30;
pub const ALIGNMENT: u64 = MIB;
pub const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
pub const XBOOTLDR_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";
pub const ROOT_TYPE: &str = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";
const ESP_SIZE: u64 = GIB;
const XBOOTLDR_SIZE: u64 = 2 * GIB;
const SMALLEST_SHARED_ESP: u64 = GIB;
const GPT_TAIL: u64 = MIB;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub struct Span {
    pub offset: u64,
    pub size: u64,
}

impl Span {
    pub fn end(self) -> u64 {
        self.offset + self.size
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Startup {
    NewEsp,
    SharedEsp,
    Xbootldr,
}

impl Startup {
    pub fn for_esp(esp_size: Option<u64>) -> Self {
        match esp_size {
            None => Self::NewEsp,
            Some(size) if size >= SMALLEST_SHARED_ESP => Self::SharedEsp,
            Some(_) => Self::Xbootldr,
        }
    }

    pub fn space(self) -> u64 {
        match self {
            Self::NewEsp => ESP_SIZE,
            Self::SharedEsp => 0,
            Self::Xbootldr => XBOOTLDR_SIZE,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Planned {
    pub esp: Option<Span>,
    pub startup: Option<Span>,
    pub root: Span,
}

pub fn align_up(bytes: u64) -> u64 {
    bytes.div_ceil(ALIGNMENT) * ALIGNMENT
}

pub fn align_down(bytes: u64) -> u64 {
    bytes / ALIGNMENT * ALIGNMENT
}

pub fn whole_drive(size: u64) -> Span {
    Span {
        offset: ALIGNMENT,
        size: align_down(size - GPT_TAIL) - ALIGNMENT,
    }
}

pub fn within(region: Span, startup: Startup) -> Planned {
    let start = align_up(region.offset);
    let end = align_down(region.end());
    let boot = Span {
        offset: start,
        size: startup.space(),
    };
    let root = Span {
        offset: boot.end(),
        size: end.saturating_sub(boot.end()),
    };
    Planned {
        esp: (startup == Startup::NewEsp).then_some(boot),
        startup: (startup == Startup::Xbootldr).then_some(boot),
        root,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_drive_without_an_esp_gets_one_in_front_of_luft() {
        let planned = within(whole_drive(256 * GIB), Startup::NewEsp);
        assert_eq!(planned.esp.map(|esp| esp.offset), Some(ALIGNMENT));
        assert_eq!(planned.esp.map(Span::end), Some(planned.root.offset));
        assert!(planned.root.end() <= 256 * GIB - GPT_TAIL);
        assert_eq!(planned.startup, None);
    }

    #[test]
    fn a_small_esp_gets_a_startup_partition_and_a_roomy_one_is_shared() {
        let region = Span {
            offset: 100 * GIB + 4096,
            size: 60 * GIB,
        };
        let small = within(region, Startup::for_esp(Some(100 * MIB)));
        assert_eq!(small.startup.map(|startup| startup.size), Some(2 * GIB));
        assert_eq!(small.root.offset % ALIGNMENT, 0);
        let shared = within(region, Startup::for_esp(Some(GIB)));
        assert_eq!((shared.esp, shared.startup), (None, None));
        assert!(shared.root.end() <= region.end());
    }
}
