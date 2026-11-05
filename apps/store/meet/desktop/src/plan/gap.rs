use super::layout::{Disk, NewPartition, Plan, Role, Shortfall, Span};
use super::sizes::{ALIGNMENT, align_down, align_up};

const GPT_TAIL: u64 = ALIGNMENT;

pub enum Head {
    Room { smallest: u64 },
    Kept(Span),
}

pub fn gaps(disk: &Disk) -> Vec<Span> {
    let mut partitions = disk.partitions.clone();
    partitions.sort_by_key(|partition| partition.offset);
    let mut cursor = ALIGNMENT;
    let mut found = Vec::new();
    let mut close = |start: u64, end: u64| {
        let (start, end) = (align_up(start), align_down(end));
        if end >= start + ALIGNMENT {
            found.push(Span {
                offset: start,
                size: end - start,
            });
        }
    };
    for partition in &partitions {
        if partition.offset > cursor {
            close(cursor, partition.offset);
        }
        cursor = cursor.max(partition.end());
    }
    close(cursor, disk.size.saturating_sub(GPT_TAIL));
    found
}

pub fn inside(gap: Span, head: Head, new: &[(Role, u64)]) -> Result<Plan, Shortfall> {
    let start = align_up(gap.offset);
    let end = align_down(gap.end());
    let available = end.saturating_sub(start);
    let added: u64 = new.iter().map(|(_, size)| align_up(*size)).sum();
    let first = end.checked_sub(added).filter(|first| *first >= start);
    let room = match (head, first) {
        (Head::Room { smallest }, Some(first)) if first - start >= align_up(smallest) => Span {
            offset: start,
            size: first - start,
        },
        (Head::Kept(room), Some(_)) => room,
        (Head::Room { smallest }, _) => {
            return Err(Shortfall {
                needed: align_up(smallest) + added,
                available,
            });
        }
        (Head::Kept(_), None) => {
            return Err(Shortfall {
                needed: added,
                available,
            });
        }
    };
    let mut cursor = end - added;
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
        windows_size: None,
        partitions,
        room,
    })
}

#[cfg(test)]
mod tests {
    use super::super::sizes::{GIB, MIB};
    use super::*;

    fn span(offset: u64, size: u64) -> Span {
        Span { offset, size }
    }

    #[test]
    fn free_space_between_and_after_partitions_is_found() {
        let disk = Disk {
            size: 256 * GIB,
            partitions: vec![span(MIB, 100 * MIB), span(10 * GIB, 100 * GIB)],
        };
        assert_eq!(
            gaps(&disk),
            [
                span(101 * MIB, 10 * GIB - 101 * MIB),
                span(110 * GIB, 146 * GIB - MIB)
            ]
        );
    }

    #[test]
    fn an_empty_drive_is_one_gap() {
        let disk = Disk {
            size: 64 * GIB,
            partitions: Vec::new(),
        };
        assert_eq!(gaps(&disk), [span(MIB, 64 * GIB - 2 * MIB)]);
    }

    #[test]
    fn luft_s_partitions_go_after_the_room_at_the_end_of_the_gap() {
        let gap = span(10 * GIB + 4096, 60 * GIB);
        let plan = inside(
            gap,
            Head::Room { smallest: 34 * GIB },
            &[(Role::Start, 512 * MIB), (Role::Live, 3 * GIB)],
        )
        .unwrap();
        assert_eq!(plan.windows_size, None);
        assert_eq!(plan.room.offset, 10 * GIB + MIB);
        assert_eq!(plan.partitions[0].span.offset, plan.room.end());
        assert_eq!(plan.partitions[1].span.end(), align_down(gap.end()));
    }

    #[test]
    fn a_gap_too_small_for_luft_is_refused() {
        let shortfall = inside(
            span(GIB, 36 * GIB),
            Head::Room { smallest: 34 * GIB },
            &[(Role::Live, 3 * GIB)],
        )
        .unwrap_err();
        assert_eq!(shortfall.needed, 37 * GIB);
        assert_eq!(shortfall.available, 36 * GIB);
    }

    #[test]
    fn a_kept_room_stays_as_it_is() {
        let room = span(GIB, 40 * GIB);
        let plan = inside(
            span(41 * GIB, 5 * GIB),
            Head::Kept(room),
            &[(Role::Live, 4 * GIB)],
        )
        .unwrap();
        assert_eq!(plan.room, room);
        assert_eq!(plan.partitions[0].span, span(42 * GIB, 4 * GIB));
        assert!(
            inside(
                span(41 * GIB, 3 * GIB),
                Head::Kept(room),
                &[(Role::Live, 4 * GIB)]
            )
            .is_err()
        );
    }
}
