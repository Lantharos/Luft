use std::path::Path;

use anyhow::{Context, Result};
use luft_meet::handoff::Role;
use luft_meet::{Folder, Handoff};

use super::super::journal::Journal;
use super::super::parts::drive::{self, Part};
use super::super::plan::{Span, Step};
use crate::paths;
use crate::system::host::beneath::remove_beneath;
use crate::system::host::command::Tool;

const RECORD: &str = "meet.json";
const SCRATCH: &str = "/run/trustd/meet";
const MIB: u64 = 1 << 20;

fn made_by_meet(part: &Part, role: Role) -> bool {
    part.kind.eq_ignore_ascii_case(role.partition_type())
        && part.filesystem == role.filesystem()
        && part.label.eq_ignore_ascii_case(role.label())
}

pub fn grown_end(root: Span, free: impl IntoIterator<Item = Span>) -> u64 {
    let mut free: Vec<Span> = free.into_iter().collect();
    free.sort_by_key(|span| span.offset);
    free.iter().fold(root.end(), |end, space| {
        if space.offset >= end && space.offset - end < MIB {
            space.end()
        } else {
            end
        }
    })
}

pub fn plan() -> Result<Option<Journal>> {
    let Ok(text) = std::fs::read_to_string(paths::state(RECORD)) else {
        return Ok(None);
    };
    let handoff = Handoff::parse(&text).map_err(anyhow::Error::msg)?;
    let device = drive::system_partition()?;
    let disk = drive::holding(&device)?;
    let mut steps = vec![Step::ForgetStartEntry {
        number: handoff.boot_entry,
    }];
    if let Some(folder) = handoff.folder() {
        steps.push(Step::RemoveFolder {
            folder: folder.clone(),
        });
        return Ok(Some(Journal::new(disk.id, steps)));
    }
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    let made: Vec<&Part> = disk
        .parts
        .iter()
        .filter(|part| {
            handoff
                .partitions()
                .any(|(role, guid)| part.uuid == guid && made_by_meet(part, role))
        })
        .collect();
    steps.extend(made.iter().map(|part| Step::Discard {
        at: part.span.offset,
        uuid: part.uuid.clone(),
    }));
    let end = grown_end(
        root.span,
        disk.free
            .iter()
            .copied()
            .chain(made.iter().map(|part| part.span)),
    );
    steps.push(Step::Grow {
        at: root.span.offset,
        end,
    });
    Ok(Some(Journal::new(disk.id.clone(), steps)))
}

pub fn forget() {
    let _ = std::fs::remove_file(paths::state(RECORD));
}

struct Opened(std::path::PathBuf);

impl Opened {
    fn mount(device: &str, options: &str, at: &Path) -> Result<Self> {
        paths::ensure_private(at)?;
        let mut mount = Tool::new("mount");
        if !options.is_empty() {
            mount = mount.args(["-o", options]);
        }
        mount.arg(device).arg(at).status()?;
        Ok(Self(at.to_owned()))
    }
}

impl Drop for Opened {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.0).status();
    }
}

pub fn remove_folder(folder: &Folder) -> Result<()> {
    let scratch = Path::new(SCRATCH);
    let esp = format!("/dev/disk/by-partuuid/{}", folder.esp);
    {
        let opened = Opened::mount(&esp, "", &scratch.join("esp"))?;
        remove_beneath(&opened.0, &folder.loader)?;
    }
    let device = format!("/dev/disk/by-uuid/{}", folder.filesystem);
    let kind = Tool::new("blkid")
        .args(["--output", "value", "--match-tag", "TYPE"])
        .arg(&device)
        .output()?;
    let top = if kind.trim() == "btrfs" {
        "subvolid=5"
    } else {
        ""
    };
    let opened = Opened::mount(&device, top, &scratch.join("top"))?;
    remove_beneath(&opened.0, &folder.folder)
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    #[test]
    fn luft_grows_over_the_space_right_after_it() {
        let root = Span {
            offset: 100 * GIB,
            size: 60 * GIB,
        };
        let moving_box = Span {
            offset: 160 * GIB,
            size: 4 * GIB,
        };
        let live = Span {
            offset: 164 * GIB + 4096,
            size: 2 * GIB,
        };
        let apart = Span {
            offset: 200 * GIB,
            size: GIB,
        };
        assert_eq!(grown_end(root, [apart, live, moving_box]), live.end());
        assert_eq!(grown_end(root, [apart]), root.end());
    }
}
