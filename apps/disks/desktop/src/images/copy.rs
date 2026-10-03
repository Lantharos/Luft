use std::fs::File;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use luft_app::Events;
use serde::Serialize;

use crate::udisks::{self, BLOCK, no_options};

pub const PROGRESS: &str = "disks.image";

const CHUNK: usize = 4 * 1024 * 1024;
const REPORT_EVERY: Duration = Duration::from_millis(250);

pub enum Direction {
    Create {
        source: File,
        output: File,
        destination: PathBuf,
    },
    Restore {
        input: File,
        target: File,
        size: u64,
    },
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Progress<'a> {
    block: &'a str,
    restoring: bool,
    copied: u64,
    total: u64,
    rate: u64,
    finished: bool,
    error: Option<String>,
}

pub fn run(events: &Events, block: &str, direction: Direction, cancelled: &AtomicBool) {
    let restoring = matches!(direction, Direction::Restore { .. });
    let report = |copied: u64, total: u64, rate: u64, finished: bool, error: Option<String>| {
        events.emit(
            PROGRESS,
            Progress {
                block,
                restoring,
                copied,
                total,
                rate,
                finished,
                error,
            },
        );
    };
    let outcome = match direction {
        Direction::Create {
            mut source,
            mut output,
            destination,
        } => {
            let total = source
                .metadata()
                .map(|meta| meta.len())
                .ok()
                .filter(|size| *size > 0)
                .unwrap_or_else(|| device_size(block));
            let copied = pump(&mut source, &mut output, total, cancelled, &report);
            if copied.is_err() {
                let _ = std::fs::remove_file(&destination);
            }
            copied.map(|copied| (copied, total))
        }
        Direction::Restore {
            mut input,
            mut target,
            size,
        } => {
            let copied = pump(&mut input, &mut target, size, cancelled, &report);
            let _ = udisks::run(block, BLOCK, "Rescan", &(no_options(),));
            copied.map(|copied| (copied, size))
        }
    };
    match outcome {
        Ok((copied, total)) => report(copied, total, 0, true, None),
        Err(error) => report(0, 0, 0, true, Some(error)),
    }
}

fn pump(
    from: &mut File,
    to: &mut File,
    total: u64,
    cancelled: &AtomicBool,
    report: &impl Fn(u64, u64, u64, bool, Option<String>),
) -> Result<u64, String> {
    let mut buffer = vec![0_u8; CHUNK];
    let started = Instant::now();
    let mut reported = Instant::now();
    let mut copied = 0_u64;
    loop {
        if cancelled.load(Ordering::Relaxed) {
            return Err(udisks::CANCELLED.to_owned());
        }
        let read = from.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        to.write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        copied += read as u64;
        if reported.elapsed() >= REPORT_EVERY {
            reported = Instant::now();
            let rate = (copied as f64 / started.elapsed().as_secs_f64()) as u64;
            report(copied, total, rate, false, None);
        }
    }
    to.sync_all().map_err(|error| error.to_string())?;
    Ok(copied)
}

fn device_size(block: &str) -> u64 {
    udisks::objects()
        .ok()
        .and_then(|objects| {
            objects
                .get(block, BLOCK)
                .and_then(|target| target.get::<u64>("Size"))
        })
        .unwrap_or(0)
}
