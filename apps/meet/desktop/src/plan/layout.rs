use serde::Serialize;

use super::sizes::{ALIGNMENT, align_down, align_up, smallest_windows};

const GPT_TAIL: u64 = ALIGNMENT;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Role {
    Start,
    Live,
    MovingBox,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Span {
    pub offset: u64,
    pub size: u64,
}

impl Span {
    pub fn end(self) -> u64 {
        self.offset + self.size
    }
}

pub struct Disk {
    pub size: u64,
    pub partitions: Vec<Span>,
}

#[derive(Clone, Copy)]
pub struct Windows {
    pub partition: Span,
    pub used: u64,
    pub supported_min: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct NewPartition {
    pub role: Role,
    pub span: Span,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Plan {
    pub windows_size: u64,
    pub partitions: Vec<NewPartition>,
    pub room: Span,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Shortfall {
    pub needed: u64,
    pub available: u64,
}

fn free_end(disk: &Disk, after: u64) -> u64 {
    disk.partitions
        .iter()
        .map(|partition| partition.offset)
        .filter(|offset| *offset >= after)
        .min()
        .unwrap_or(disk.size - GPT_TAIL)
}

impl Windows {
    pub fn smallest(&self) -> u64 {
        smallest_windows(self.used, self.supported_min).min(self.partition.size)
    }
}

pub fn most_room(disk: &Disk, windows: &Windows) -> u64 {
    let end = align_down(free_end(disk, windows.partition.end()));
    end.saturating_sub(windows.partition.offset + windows.smallest())
}

pub fn plan(
    disk: &Disk,
    windows: &Windows,
    luft: u64,
    new: &[(Role, u64)],
) -> Result<Plan, Shortfall> {
    let end = align_down(free_end(disk, windows.partition.end()));
    let added: u64 = new.iter().map(|(_, size)| align_up(*size)).sum();
    let needed = added + align_up(luft);
    let available = most_room(disk, windows);
    let Some(room_end) = end.checked_sub(added) else {
        return Err(Shortfall { needed, available });
    };
    let latest = room_end.saturating_sub(align_up(luft));
    let windows_end = if latest >= windows.partition.end() {
        windows.partition.end()
    } else {
        align_down(latest)
    };
    let windows_size = windows_end.saturating_sub(windows.partition.offset);
    if windows_size < windows.smallest() || room_end < align_up(luft) {
        return Err(Shortfall { needed, available });
    }
    let mut cursor = room_end;
    let partitions = new
        .iter()
        .map(|(role, size)| {
            let span = Span {
                offset: cursor,
                size: align_up(*size),
            };
            cursor += span.size;
            NewPartition { role: *role, span }
        })
        .collect();
    Ok(Plan {
        windows_size,
        partitions,
        room: Span {
            offset: windows_end,
            size: room_end - windows_end,
        },
    })
}

#[cfg(test)]
mod tests {
    use super::super::sizes::{GIB, MIB};
    use super::*;

    fn laptop() -> (Disk, Windows) {
        let esp = Span {
            offset: MIB,
            size: 100 * MIB,
        };
        let reserved = Span {
            offset: esp.end(),
            size: 16 * MIB,
        };
        let windows = Span {
            offset: reserved.end(),
            size: 470 * GIB,
        };
        let recovery = Span {
            offset: windows.end(),
            size: 750 * MIB,
        };
        let disk = Disk {
            size: 512 * GIB,
            partitions: vec![esp, reserved, windows, recovery],
        };
        (
            disk,
            Windows {
                partition: windows,
                used: 120 * GIB,
                supported_min: 90 * GIB,
            },
        )
    }

    #[test]
    fn luft_s_partitions_go_at_the_end_of_the_room_windows_gives() {
        let (disk, windows) = laptop();
        let plan = plan(
            &disk,
            &windows,
            100 * GIB,
            &[(Role::Start, 512 * MIB), (Role::Live, 3 * GIB)],
        )
        .unwrap();
        assert_eq!(
            plan.room.offset,
            windows.partition.offset + plan.windows_size
        );
        assert_eq!(plan.room.size, 100 * GIB);
        assert_eq!(plan.partitions[0].span.offset, plan.room.end());
        assert_eq!(
            plan.partitions[1].span.offset,
            plan.partitions[0].span.end()
        );
        assert_eq!(
            plan.partitions[1].span.end(),
            align_down(windows.partition.end())
        );
        assert!(
            plan.partitions
                .iter()
                .all(|new| new.span.offset % ALIGNMENT == 0)
        );
    }

    #[test]
    fn a_moving_box_later_takes_more_from_windows_and_keeps_the_room() {
        let (mut disk, windows) = laptop();
        let first = plan(
            &disk,
            &windows,
            100 * GIB,
            &[(Role::Start, 512 * MIB), (Role::Live, 3 * GIB)],
        )
        .unwrap();
        let shrunk = Windows {
            partition: Span {
                size: first.windows_size,
                ..windows.partition
            },
            ..windows
        };
        disk.partitions[2] = shrunk.partition;
        disk.partitions
            .extend(first.partitions.iter().map(|new| new.span));
        let second = plan(&disk, &shrunk, 100 * GIB, &[(Role::MovingBox, 20 * GIB)]).unwrap();
        assert_eq!(second.windows_size, first.windows_size - 20 * GIB);
        assert_eq!(
            second.partitions[0].span.end(),
            first.partitions[0].span.offset
        );
        assert_eq!(second.room.size, 100 * GIB);
    }

    #[test]
    fn space_that_is_already_free_is_used_first() {
        let (mut disk, mut windows) = laptop();
        windows.partition.size -= 50 * GIB;
        disk.partitions[2] = windows.partition;
        let plan = plan(&disk, &windows, 40 * GIB, &[(Role::Live, 3 * GIB)]).unwrap();
        assert_eq!(plan.windows_size, windows.partition.size);
        assert!(plan.room.size >= 40 * GIB);
    }

    #[test]
    fn windows_never_goes_below_what_it_needs() {
        let (disk, windows) = laptop();
        let available = most_room(&disk, &windows);
        assert_eq!(
            available,
            align_down(windows.partition.end()) - windows.partition.offset - 140 * GIB
        );
        let shortfall = plan(&disk, &windows, available, &[(Role::Live, 3 * GIB)]).unwrap_err();
        assert_eq!(shortfall.available, available);
        assert!(
            plan(
                &disk,
                &windows,
                available - 3 * GIB,
                &[(Role::Live, 3 * GIB)]
            )
            .is_ok()
        );
    }
}
