use std::fs;
use std::path::Path;

use crate::engine::formats::{self, Family};
use crate::engine::image;

const MEMORY_SHARE: u64 = 2;
const STREAMING_MEMORY: u64 = 256 << 20;
const VIDEO_ENCODER_MEMORY: u64 = 4 << 30;
const DOCUMENT_FACTOR: u64 = 4;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cost {
    pub processors: u32,
    pub memory: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Budget {
    pub processors: u32,
    pub memory: u64,
}

fn available_memory() -> u64 {
    let text = fs::read_to_string("/proc/meminfo").unwrap_or_default();
    let kilobytes = text
        .lines()
        .find_map(|line| line.strip_prefix("MemAvailable:"))
        .and_then(|rest| {
            rest.trim()
                .trim_end_matches("kB")
                .trim()
                .parse::<u64>()
                .ok()
        });
    kilobytes.map_or(1 << 32, |value| value * 1024)
}

pub fn budget() -> Budget {
    let processors = std::thread::available_parallelism().map_or(4, |count| count.get() as u32);
    Budget {
        processors,
        memory: available_memory() / MEMORY_SHARE,
    }
}

pub fn cost(input: &Path, target: &str, budget: Budget) -> Cost {
    let size = fs::metadata(input).map_or(0, |metadata| metadata.len());
    let source = formats::detect(input);
    let family = source.map(|format| format.family);
    let target_family = formats::by_id(target).map(|format| format.family);
    let heavy = (budget.processors / 2).max(1);
    match (family, target_family) {
        (Some(Family::Video), Some(Family::Video | Family::Image)) => Cost {
            processors: heavy,
            memory: VIDEO_ENCODER_MEMORY,
        },
        (Some(Family::Audio | Family::Video), _) => Cost {
            processors: 1,
            memory: STREAMING_MEMORY,
        },
        (Some(Family::Image), _) => Cost {
            processors: 1,
            memory: source.map_or(STREAMING_MEMORY, |format| {
                image::memory_estimate(input, format)
            }),
        },
        (_, Some(Family::Archive)) => Cost {
            processors: 2,
            memory: STREAMING_MEMORY,
        },
        _ => Cost {
            processors: 1,
            memory: size.saturating_mul(DOCUMENT_FACTOR).max(STREAMING_MEMORY),
        },
    }
}

pub fn fits(running: Cost, next: Cost, budget: Budget, count: usize) -> bool {
    count == 0
        || (running.processors + next.processors <= budget.processors
            && running.memory.saturating_add(next.memory) <= budget.memory)
}

#[cfg(test)]
mod tests {
    use super::*;

    const BUDGET: Budget = Budget {
        processors: 8,
        memory: 8 << 30,
    };

    #[test]
    fn a_job_too_big_for_the_budget_still_runs_alone() {
        let huge = Cost {
            processors: 32,
            memory: 1 << 40,
        };
        assert!(fits(
            Cost {
                processors: 0,
                memory: 0
            },
            huge,
            BUDGET,
            0
        ));
        assert!(!fits(
            Cost {
                processors: 1,
                memory: 1 << 20
            },
            huge,
            BUDGET,
            1
        ));
    }

    #[test]
    fn memory_limits_jobs_as_well_as_processors() {
        let picture = Cost {
            processors: 1,
            memory: 5 << 30,
        };
        assert!(!fits(picture, picture, BUDGET, 1));
    }
}
