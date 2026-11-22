use anyhow::Result;

use super::journal::{Journal, Working};
use super::parts::{btrfs, drive};
use super::plan::Step;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Stage {
    Moving,
    Finishing,
    Paused,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Changing {
    pub stage: Stage,
    pub progress: f64,
    pub drive: String,
    pub parts: Vec<u64>,
}

fn parts(steps: &[Step]) -> Vec<u64> {
    let mut parts: Vec<u64> = steps
        .iter()
        .filter_map(|step| match step {
            Step::Create { at, .. } | Step::Leave { at } | Step::Shrink { at, .. } => Some(*at),
            _ => None,
        })
        .collect();
    parts.sort_unstable();
    parts.dedup();
    parts
}

fn moved_off(drive: &str, at: u64) -> Result<f64> {
    let disk = drive::read(drive)?;
    let Some(part) = disk.at(at) else {
        return Ok(1.0);
    };
    let Some(member) = btrfs::member(part.filesystem_device())? else {
        return Ok(1.0);
    };
    let allocated = btrfs::allocated(&part.fs_uuid)?;
    Ok(1.0 - member.used.min(allocated) as f64 / allocated.max(1) as f64)
}

fn share(journal: &Journal, current: f64) -> f64 {
    let leaves: Vec<usize> = journal
        .steps
        .iter()
        .enumerate()
        .filter_map(|(index, step)| matches!(step, Step::Leave { .. }).then_some(index))
        .collect();
    if leaves.is_empty() {
        return 1.0;
    }
    let done = leaves.iter().filter(|index| **index < journal.next).count();
    let running = if leaves.contains(&journal.next) {
        current
    } else {
        0.0
    };
    (done as f64 + running) / leaves.len() as f64
}

pub fn changing() -> Option<Changing> {
    let journal = Journal::load()?;
    let leaving = match journal.steps.get(journal.next) {
        Some(Step::Leave { at }) => moved_off(&journal.drive, *at).unwrap_or(0.0),
        _ => 0.0,
    };
    let progress = share(&journal, leaving);
    let stage = if matches!(Working::try_take(), Ok(Some(_))) {
        Stage::Paused
    } else if progress < 1.0 {
        Stage::Moving
    } else {
        Stage::Finishing
    };
    Some(Changing {
        stage,
        progress,
        parts: parts(&journal.steps),
        drive: journal.drive,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn journal(next: usize) -> Journal {
        let mut journal = Journal::new(
            "drive".into(),
            vec![
                Step::Shrink { at: 10, size: 4 },
                Step::Create { at: 20, size: 8 },
                Step::Leave { at: 10 },
                Step::Delete { at: 10 },
                Step::Create { at: 5, size: 8 },
                Step::Leave { at: 20 },
                Step::Grow { at: 5, end: 30 },
            ],
        );
        journal.next = next;
        journal
    }

    #[test]
    fn a_move_twice_over_counts_each_half_of_the_copying() {
        assert_eq!(share(&journal(1), 0.5), 0.0);
        assert_eq!(share(&journal(2), 0.5), 0.25);
        assert_eq!(share(&journal(5), 0.5), 0.75);
        assert_eq!(share(&journal(6), 0.5), 1.0);
        assert_eq!(parts(&journal(0).steps), [5, 10, 20]);
    }
}
