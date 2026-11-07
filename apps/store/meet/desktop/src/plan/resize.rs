use luft_meet::resize::needed;

use super::layout::Windows;
use super::sizes::{GIB, SMALLEST_SYSTEM, align_down, align_up};
use crate::protocol::answers::Range;

pub struct Room {
    pub before: u64,
    pub after: u64,
    pub startup: u64,
    pub root: u64,
    pub allocated: u64,
}

impl Room {
    fn free(&self) -> u64 {
        self.before + self.after
    }

    fn least_move(&self) -> u64 {
        let moving_twice = if self.root < 2 * needed(self.allocated) {
            needed(self.allocated)
        } else {
            0
        };
        GIB.max(self.startup).max(moving_twice)
    }

    fn moves_into(&self, front: u64) -> bool {
        front == 0 || front >= self.least_move()
    }

    fn free_alone(&self) -> bool {
        self.free() > 0 && self.moves_into(self.before)
    }

    fn most_trim(&self) -> u64 {
        align_down(
            self.root
                .saturating_sub(SMALLEST_SYSTEM.max(needed(self.allocated))),
        )
    }

    pub fn range(&self) -> Option<Range> {
        let grows = self.free_alone();
        let trim = self.most_trim();
        let trims = trim >= GIB;
        (grows || trims).then(|| Range {
            smallest: if trims { self.root - trim } else { self.root },
            most: self.root + if grows { self.free() } else { 0 },
            free: self.free(),
            free_alone: grows,
            least_grow: self.free(),
            least_shrink: GIB,
        })
    }
}

pub struct Geometry {
    pub windows: Windows,
    pub room: Room,
}

impl Geometry {
    fn spare(&self) -> u64 {
        align_down(self.windows.partition.size - self.windows.smallest())
    }

    fn least_taken(&self) -> u64 {
        let room = &self.room;
        GIB.max(room.least_move().saturating_sub(room.before))
    }

    pub fn taken(&self, change: u64) -> u64 {
        align_up(change.saturating_sub(self.room.free()))
    }

    fn most_shrink(&self) -> u64 {
        let room = &self.room;
        let need = needed(room.allocated);
        let kept = if room.root >= 3 * need {
            SMALLEST_SYSTEM.max(need)
        } else {
            2 * need
        };
        align_down(room.root.saturating_sub(kept.max(SMALLEST_SYSTEM)))
    }

    fn least_shrink(&self) -> u64 {
        GIB.max(self.room.startup)
    }

    pub fn range(&self) -> Option<Range> {
        let room = &self.room;
        let free_alone = room.free_alone();
        let takes = self.spare() >= self.least_taken();
        let grows = free_alone || takes;
        let shrinks = self.most_shrink() >= self.least_shrink();
        (grows || shrinks).then(|| Range {
            smallest: if shrinks {
                room.root - self.most_shrink()
            } else {
                room.root
            },
            most: room.root
                + match (takes, free_alone) {
                    (true, _) => room.free() + self.spare(),
                    (false, true) => room.free(),
                    (false, false) => 0,
                },
            free: room.free(),
            free_alone,
            least_grow: if takes {
                room.free() + self.least_taken()
            } else {
                room.free()
            },
            least_shrink: self.least_shrink(),
        })
    }
}

impl Range {
    pub fn allows(&self, current: u64, wanted: u64) -> bool {
        if wanted > current {
            let change = wanted - current;
            return wanted <= self.most
                && ((self.free_alone && change == self.free) || change >= self.least_grow);
        }
        wanted < current && wanted >= self.smallest && current - wanted >= self.least_shrink
    }
}

#[cfg(test)]
mod tests {
    use super::super::layout::Span;
    use super::*;

    fn room(root: u64, allocated: u64, before: u64, after: u64) -> Room {
        Room {
            before,
            after,
            startup: 2 * GIB,
            root,
            allocated,
        }
    }

    fn beside(room: Room) -> Geometry {
        Geometry {
            windows: Windows {
                partition: Span {
                    offset: GIB,
                    size: 300 * GIB,
                },
                used: 100 * GIB,
                supported_min: 90 * GIB,
            },
            room,
        }
    }

    #[test]
    fn a_roomy_luft_can_go_either_way() {
        let range = beside(room(200 * GIB, 20 * GIB, 0, 0)).range().unwrap();
        assert_eq!(range.smallest, SMALLEST_SYSTEM);
        assert_eq!(range.most, 200 * GIB + 300 * GIB - 120 * GIB);
        assert_eq!(range.least_grow, 2 * GIB);
        assert_eq!(range.least_shrink, 2 * GIB);
        assert!(range.allows(200 * GIB, 150 * GIB));
        assert!(!range.allows(200 * GIB, 199 * GIB));
    }

    #[test]
    fn a_luft_more_than_half_full_moves_only_into_enough_new_space() {
        let range = beside(room(100 * GIB, 60 * GIB, 0, 0)).range().unwrap();
        assert_eq!(range.smallest, 100 * GIB);
        assert_eq!(range.least_grow, needed(60 * GIB));
        assert!(!range.allows(100 * GIB, 110 * GIB));
        assert!(range.allows(100 * GIB, 100 * GIB + needed(60 * GIB)));
    }

    #[test]
    fn free_space_beside_windows_goes_to_luft_before_windows_gives_any() {
        let geometry = beside(room(152 * GIB, 40 * GIB, 101 * GIB, 3 * GIB));
        let range = geometry.range().unwrap();
        assert_eq!(range.free, 104 * GIB);
        assert!(range.free_alone);
        assert!(range.allows(152 * GIB, 256 * GIB));
        assert!(!range.allows(152 * GIB, 200 * GIB));
        assert_eq!(range.most, 256 * GIB + 180 * GIB);
        assert_eq!(geometry.taken(104 * GIB), 0);
        assert_eq!(geometry.taken(110 * GIB), 6 * GIB);
    }

    #[test]
    fn free_space_after_luft_grows_it_in_place_or_together_with_what_windows_gives() {
        let range = beside(room(100 * GIB, 20 * GIB, 0, 10 * GIB))
            .range()
            .unwrap();
        assert!(range.allows(100 * GIB, 110 * GIB));
        assert!(!range.allows(100 * GIB, 111 * GIB));
        assert!(range.allows(100 * GIB, 112 * GIB));
    }

    #[test]
    fn a_sliver_in_front_of_luft_needs_windows_to_give_enough_to_move() {
        let range = beside(room(100 * GIB, 20 * GIB, GIB / 2, 0))
            .range()
            .unwrap();
        assert!(!range.free_alone);
        assert_eq!(range.least_grow, 2 * GIB);
        assert!(!range.allows(100 * GIB, 100 * GIB + GIB / 2));
    }

    #[test]
    fn a_windows_that_cant_shrink_still_leaves_the_free_space_to_luft() {
        let mut geometry = beside(room(152 * GIB, 40 * GIB, 101 * GIB, 0));
        geometry.windows.supported_min = geometry.windows.partition.size;
        let range = geometry.range().unwrap();
        assert_eq!(range.most, 253 * GIB);
        assert!(range.allows(152 * GIB, 253 * GIB));
    }

    #[test]
    fn luft_on_a_drive_of_its_own_takes_all_the_free_space_next_to_it() {
        let range = room(60 * GIB, 10 * GIB, 5 * GIB, 20 * GIB).range().unwrap();
        assert_eq!(range.smallest, SMALLEST_SYSTEM);
        assert_eq!(range.most, 85 * GIB);
        assert!(range.allows(60 * GIB, 85 * GIB));
        assert!(!range.allows(60 * GIB, 70 * GIB));
        assert_eq!(range.least_shrink, GIB);
    }

    #[test]
    fn giving_space_back_keeps_room_to_move_twice() {
        let range = beside(room(100 * GIB, 30 * GIB, 0, 0)).range().unwrap();
        assert_eq!(range.smallest, 2 * needed(30 * GIB));
    }
}
