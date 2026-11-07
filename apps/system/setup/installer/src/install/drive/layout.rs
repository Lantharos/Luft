use crate::L10N;
use luft_disks::moving::layout::{self, ROOT_TYPE, Span};
use luft_i18n::t;

pub use luft_disks::moving::layout::{ESP_TYPE, Startup, XBOOTLDR_TYPE};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Role {
    Esp,
    Xbootldr,
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

    pub fn creation_failed(self) -> String {
        match self {
            Self::Esp => t!(L10N, "installer-esp-partition-failed"),
            Self::Xbootldr => t!(L10N, "installer-startup-partition-failed"),
            Self::Root => t!(L10N, "installer-root-partition-failed"),
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

fn parts(planned: layout::Planned) -> Vec<Part> {
    [
        (Role::Esp, planned.esp),
        (Role::Xbootldr, planned.startup),
        (Role::Root, Some(planned.root)),
    ]
    .into_iter()
    .filter_map(|(role, span)| {
        span.map(|span| Part {
            role,
            offset: span.offset,
            size: span.size,
        })
    })
    .collect()
}

pub fn whole_drive(size: u64) -> Vec<Part> {
    parts(layout::within(layout::whole_drive(size), Startup::NewEsp))
}

pub fn within(offset: u64, size: u64, startup: Startup) -> Vec<Part> {
    parts(layout::within(Span { offset, size }, startup))
}
