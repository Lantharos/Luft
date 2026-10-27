use luft_meet::resize::needed;

use super::layout::Windows;
use super::sizes::{GIB, SMALLEST_SYSTEM, align_down};
use crate::protocol::answers::Range;

pub struct Geometry {
    pub windows: Windows,
    pub gap: u64,
    pub startup: u64,
    pub root: u64,
    pub allocated: u64,
}

pub struct InPlace {
    pub root: u64,
    pub after: u64,
    pub allocated: u64,
}

impl InPlace {
    pub fn range(&self) -> Option<Range> {
        let shrink = align_down(
            self.root
                .saturating_sub(SMALLEST_SYSTEM.max(needed(self.allocated))),
        );
        let grow = align_down(self.after);
        (shrink >= GIB || grow >= GIB).then(|| Range {
            smallest: if shrink >= GIB {
                self.root - shrink
            } else {
                self.root
            },
            most: if grow >= GIB {
                self.root + grow
            } else {
                self.root
            },
            least_grow: GIB,
            least_shrink: GIB,
        })
    }
}

impl Geometry {
    fn most_grow(&self) -> u64 {
        self.gap + align_down(self.windows.partition.size - self.windows.smallest())
    }

    fn least_grow(&self) -> u64 {
        let moving_twice = if self.root < 2 * needed(self.allocated) {
            needed(self.allocated)
        } else {
            0
        };
        GIB.max(self.startup).max(moving_twice)
    }

    fn most_shrink(&self) -> u64 {
        let need = needed(self.allocated);
        let kept = if self.root >= 3 * need {
            SMALLEST_SYSTEM.max(need)
        } else {
            2 * need
        };
        align_down(self.root.saturating_sub(kept.max(SMALLEST_SYSTEM)))
    }

    fn least_shrink(&self) -> u64 {
        GIB.max(self.startup)
    }

    pub fn range(&self) -> Option<Range> {
        let grows = self.most_grow() >= self.least_grow();
        let shrinks = self.most_shrink() >= self.least_shrink();
        (grows || shrinks).then(|| Range {
            smallest: if shrinks {
                self.root - self.most_shrink()
            } else {
                self.root
            },
            most: if grows {
                self.root + self.most_grow()
            } else {
                self.root
            },
            least_grow: self.least_grow(),
            least_shrink: self.least_shrink(),
        })
    }
}

impl Range {
    pub fn allows(&self, current: u64, wanted: u64) -> bool {
        (wanted > current && wanted <= self.most && wanted - current >= self.least_grow)
            || (wanted < current
                && wanted >= self.smallest
                && current - wanted >= self.least_shrink)
    }
}

#[cfg(test)]
mod tests {
    use super::super::layout::Span;
    use super::*;

    fn geometry(root: u64, allocated: u64) -> Geometry {
        Geometry {
            windows: Windows {
                partition: Span {
                    offset: GIB,
                    size: 300 * GIB,
                },
                used: 100 * GIB,
                supported_min: 90 * GIB,
            },
            gap: 0,
            startup: 2 * GIB,
            root,
            allocated,
        }
    }

    #[test]
    fn a_roomy_luft_can_go_either_way() {
        let range = geometry(200 * GIB, 20 * GIB).range().unwrap();
        assert_eq!(range.smallest, SMALLEST_SYSTEM);
        assert_eq!(range.most, 200 * GIB + 300 * GIB - 120 * GIB);
        assert_eq!(range.least_grow, 2 * GIB);
        assert_eq!(range.least_shrink, 2 * GIB);
        assert!(range.allows(200 * GIB, 150 * GIB));
        assert!(!range.allows(200 * GIB, 199 * GIB));
    }

    #[test]
    fn a_luft_more_than_half_full_moves_only_into_enough_new_space() {
        let geometry = geometry(100 * GIB, 60 * GIB);
        let range = geometry.range().unwrap();
        assert_eq!(range.smallest, 100 * GIB);
        assert_eq!(range.least_grow, needed(60 * GIB));
        assert!(!range.allows(100 * GIB, 110 * GIB));
        assert!(range.allows(100 * GIB, 100 * GIB + needed(60 * GIB)));
    }

    #[test]
    fn luft_on_a_drive_of_its_own_changes_size_in_place() {
        let range = InPlace {
            root: 60 * GIB,
            after: 20 * GIB,
            allocated: 30 * GIB,
        }
        .range()
        .unwrap();
        assert_eq!(range.smallest, needed(30 * GIB));
        assert_eq!(range.most, 80 * GIB);
        assert_eq!(range.least_shrink, GIB);
    }

    #[test]
    fn giving_space_back_keeps_room_to_move_twice() {
        let range = geometry(100 * GIB, 30 * GIB).range().unwrap();
        assert_eq!(range.smallest, 2 * needed(30 * GIB));
    }
}
