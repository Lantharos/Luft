mod files;
mod place;
mod plan;
mod system;
mod wake;

use std::path::Path;
use std::process::ExitCode;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};

use files::Swaps;
use plan::{GIB, Plan, Reading, Step};
use wake::Wake;

const RETRY_AFTER: Duration = Duration::from_secs(60);

fn main() -> ExitCode {
    let directory = Path::new(place::DIRECTORY);
    let result = match std::env::args().nth(1).as_deref() {
        Some("prepare") => place::prepare(directory),
        None => run(directory),
        _ => Err(anyhow::anyhow!("Usage: luft-swap [prepare]")),
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}

fn run(directory: &Path) -> Result<()> {
    if !directory.is_dir() || !place::encrypted(directory)? {
        eprintln!("Memory isn't swapped to this drive, since it isn't encrypted");
        return Ok(());
    }
    system::turn_on_zswap();
    let mut swaps = Swaps::open(directory, place::is_btrfs(directory)?)?;
    let mut plan = Plan::default();
    let wake = Wake::on_pressure().context("couldn't follow memory pressure")?;
    loop {
        let reading = read(directory, &swaps)?;
        match plan.next(&reading, Instant::now()) {
            Step::Add { index, size } => match swaps.add(index, size) {
                Ok(()) => eprintln!("Swapping to {} GiB more", gigabytes(size)),
                Err(error) => {
                    eprintln!("Couldn't add {} GiB of swap: {error:#}", gigabytes(size));
                    wake.wait(RETRY_AFTER);
                }
            },
            Step::Remove(index) => match swaps.remove(index) {
                Ok(()) => eprintln!("Gave back a swap file nothing was using"),
                Err(error) => {
                    eprintln!("Couldn't give back a swap file: {error:#}");
                    wake.wait(RETRY_AFTER);
                }
            },
            Step::Wait => wake.wait(reading.check_again()),
        }
    }
}

fn read(directory: &Path, swaps: &Swaps) -> Result<Reading> {
    let memory = system::memory()?;
    Ok(Reading {
        memory: memory.total,
        available: memory.available,
        files: swaps.files(&system::active_files()?),
        drive: place::drive(directory)?,
    })
}

fn gigabytes(bytes: u64) -> String {
    format!("{:.1}", bytes as f64 / GIB as f64)
}
