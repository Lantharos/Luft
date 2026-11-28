use std::time::{Duration, Instant};

pub const GIB: u64 = 1 << 30;
const MIB: u64 = 1 << 20;
const BASELINE: u64 = 4 * GIB;
const STEP: u64 = 4 * GIB;
const SMALLEST: u64 = GIB;
const GRANULE: u64 = 256 * MIB;
const GROW_BELOW: u64 = 2 * GIB;
const KEEP_AFTER_SHRINKING: u64 = 2 * GROW_BELOW;
const LEFT_IN_EMPTY: u64 = 256 * MIB;
const EMPTY_FOR: Duration = Duration::from_secs(5 * 60);
const MARGIN_PERCENT: u64 = 10;
const MARGIN_LEAST: u64 = 4 * GIB;
const MARGIN_MOST: u64 = 20 * GIB;
const WATCH_CLOSELY_BELOW: u64 = GROW_BELOW + GIB;
const CLOSE_EVERY: Duration = Duration::from_secs(1);
const CALM_EVERY: Duration = Duration::from_secs(10);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct File {
    pub index: u32,
    pub size: u64,
    pub used: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Drive {
    pub size: u64,
    pub free: u64,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Reading {
    pub memory: u64,
    pub available: u64,
    pub files: Vec<File>,
    pub drive: Drive,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Step {
    Add { index: u32, size: u64 },
    Remove(u32),
    Wait,
}

impl Drive {
    fn margin(self) -> u64 {
        (self.size / 100 * MARGIN_PERCENT).clamp(MARGIN_LEAST, MARGIN_MOST)
    }

    fn room(self) -> u64 {
        self.free.saturating_sub(self.margin()) / GRANULE * GRANULE
    }

    fn crowded(self) -> bool {
        self.free < self.margin()
    }
}

impl Reading {
    fn total(&self) -> u64 {
        self.files.iter().map(|file| file.size).sum()
    }

    fn free(&self) -> u64 {
        self.files.iter().map(|file| file.size - file.used).sum()
    }

    fn cap(&self) -> u64 {
        self.memory.div_ceil(GIB).saturating_mul(GIB).max(BASELINE)
    }

    fn next_file(&self) -> Option<Step> {
        let total = self.total();
        let wanted = if self.files.is_empty() {
            BASELINE
        } else if self.free() < GROW_BELOW {
            STEP
        } else {
            return None;
        };
        let size = wanted
            .min(self.cap().saturating_sub(total))
            .min(self.drive.room())
            / GRANULE
            * GRANULE;
        let index = self.files.last().map_or(0, |file| file.index + 1);
        (size >= SMALLEST).then_some(Step::Add { index, size })
    }

    fn emptied_extra(&self) -> Option<File> {
        let last = *self.files.last()?;
        let free_elsewhere = self.free() - (last.size - last.used);
        (last.index != 0
            && last.used <= LEFT_IN_EMPTY
            && last.used <= self.available
            && free_elsewhere >= KEEP_AFTER_SHRINKING + last.used)
            .then_some(last)
    }

    pub fn check_again(&self) -> Duration {
        if self.free() < WATCH_CLOSELY_BELOW {
            CLOSE_EVERY
        } else {
            CALM_EVERY
        }
    }
}

#[derive(Default)]
pub struct Plan {
    empty: Option<(u32, Instant)>,
}

impl Plan {
    pub fn next(&mut self, reading: &Reading, now: Instant) -> Step {
        if let Some(add) = reading.next_file() {
            self.empty = None;
            return add;
        }
        let Some(extra) = reading.emptied_extra() else {
            self.empty = None;
            return Step::Wait;
        };
        let since = match self.empty {
            Some((index, since)) if index == extra.index => since,
            _ => now,
        };
        if reading.drive.crowded() || now.duration_since(since) >= EMPTY_FOR {
            self.empty = None;
            return Step::Remove(extra.index);
        }
        self.empty = Some((extra.index, since));
        Step::Wait
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const ROOMY: Drive = Drive {
        size: 500 * GIB,
        free: 300 * GIB,
    };

    fn reading(memory: u64, files: &[(u64, u64)], drive: Drive) -> Reading {
        Reading {
            memory,
            available: memory / 2,
            files: files
                .iter()
                .enumerate()
                .map(|(index, &(size, used))| File {
                    index: index as u32,
                    size,
                    used,
                })
                .collect(),
            drive,
        }
    }

    #[test]
    fn starts_with_the_baseline() {
        let step = Plan::default().next(&reading(16 * GIB, &[], ROOMY), Instant::now());
        assert_eq!(
            step,
            Step::Add {
                index: 0,
                size: 4 * GIB
            }
        );
    }

    #[test]
    fn grows_a_step_before_swap_fills() {
        let mut plan = Plan::default();
        let now = Instant::now();
        assert_eq!(
            plan.next(&reading(16 * GIB, &[(4 * GIB, 2 * GIB)], ROOMY), now),
            Step::Wait
        );
        assert_eq!(
            plan.next(&reading(16 * GIB, &[(4 * GIB, 3 * GIB)], ROOMY), now),
            Step::Add {
                index: 1,
                size: 4 * GIB
            }
        );
    }

    #[test]
    fn stops_at_the_size_of_memory() {
        let full = [(4 * GIB, 4 * GIB), (4 * GIB, 4 * GIB), (4 * GIB, 3 * GIB)];
        assert_eq!(
            Plan::default().next(&reading(14 * GIB, &full, ROOMY), Instant::now()),
            Step::Add {
                index: 3,
                size: 2 * GIB
            }
        );
        let capped = [
            (4 * GIB, 4 * GIB),
            (4 * GIB, 4 * GIB),
            (4 * GIB, 3 * GIB),
            (4 * GIB, 3 * GIB),
        ];
        assert_eq!(
            Plan::default().next(&reading(16 * GIB, &capped, ROOMY), Instant::now()),
            Step::Wait
        );
    }

    #[test]
    fn leaves_the_drive_its_margin() {
        let tight = Drive {
            size: 100 * GIB,
            free: 12 * GIB,
        };
        assert_eq!(
            Plan::default().next(
                &reading(16 * GIB, &[(4 * GIB, 3 * GIB)], tight),
                Instant::now()
            ),
            Step::Add {
                index: 1,
                size: 2 * GIB
            }
        );
        let full = Drive {
            size: 100 * GIB,
            free: 10 * GIB + 512 * MIB,
        };
        assert_eq!(
            Plan::default().next(&reading(16 * GIB, &[], full), Instant::now()),
            Step::Wait
        );
    }

    #[test]
    fn removes_an_extra_file_once_it_has_been_empty_for_a_while() {
        let mut plan = Plan::default();
        let start = Instant::now();
        let emptied = reading(
            16 * GIB,
            &[(4 * GIB, GIB), (4 * GIB, 0), (4 * GIB, 100 * MIB)],
            ROOMY,
        );
        assert_eq!(plan.next(&emptied, start), Step::Wait);
        assert_eq!(
            plan.next(&emptied, start + Duration::from_secs(60)),
            Step::Wait
        );
        assert_eq!(plan.next(&emptied, start + EMPTY_FOR), Step::Remove(2));
    }

    #[test]
    fn keeps_extra_files_that_are_in_use() {
        let mut plan = Plan::default();
        let start = Instant::now();
        let busy = reading(16 * GIB, &[(4 * GIB, GIB), (4 * GIB, GIB)], ROOMY);
        assert_eq!(plan.next(&busy, start), Step::Wait);
        assert_eq!(plan.next(&busy, start + 2 * EMPTY_FOR), Step::Wait);
        let elsewhere_full = reading(16 * GIB, &[(4 * GIB, 3 * GIB), (4 * GIB, 0)], ROOMY);
        assert_eq!(
            plan.next(&elsewhere_full, start + 3 * EMPTY_FOR),
            Step::Wait
        );
    }

    #[test]
    fn use_in_between_restarts_the_wait() {
        let mut plan = Plan::default();
        let start = Instant::now();
        let emptied = reading(16 * GIB, &[(4 * GIB, 0), (4 * GIB, 0)], ROOMY);
        let busy = reading(16 * GIB, &[(4 * GIB, 0), (4 * GIB, GIB)], ROOMY);
        assert_eq!(plan.next(&emptied, start), Step::Wait);
        assert_eq!(plan.next(&busy, start + EMPTY_FOR / 2), Step::Wait);
        assert_eq!(plan.next(&emptied, start + EMPTY_FOR), Step::Wait);
        assert_eq!(plan.next(&emptied, start + 2 * EMPTY_FOR), Step::Remove(1));
    }

    #[test]
    fn gives_space_back_at_once_when_the_drive_fills() {
        let crowded = Drive {
            size: 100 * GIB,
            free: 5 * GIB,
        };
        let emptied = reading(16 * GIB, &[(4 * GIB, 0), (4 * GIB, 0)], crowded);
        assert_eq!(
            Plan::default().next(&emptied, Instant::now()),
            Step::Remove(1)
        );
    }

    #[test]
    fn never_removes_the_baseline() {
        let idle = reading(16 * GIB, &[(4 * GIB, 0)], ROOMY);
        assert_eq!(
            Plan::default().next(&idle, Instant::now() + 2 * EMPTY_FOR),
            Step::Wait
        );
    }

    #[test]
    fn looks_closer_when_swap_gets_tight() {
        assert_eq!(
            reading(16 * GIB, &[(4 * GIB, 0)], ROOMY).check_again(),
            CALM_EVERY
        );
        assert_eq!(
            reading(16 * GIB, &[(4 * GIB, 2 * GIB)], ROOMY).check_again(),
            CLOSE_EVERY
        );
    }
}
