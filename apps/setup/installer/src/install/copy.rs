use std::path::Path;
use std::time::Duration;

use anyhow::Result;

use super::drive::target::Mounted;
use crate::config::Image;
use crate::system::command::{Tool, finished};
use crate::system::mount;
use crate::system::used_space;

const POLL: Duration = Duration::from_millis(500);
const SCRATCH: &str = "luft-install-scratch";
const LARGE_TEMPORARY_FILES: &str = "/var/tmp";

fn command(image: &Image, mounted: &Mounted) -> Tool {
    Tool::new("bootc")
        .args([
            "install",
            "to-filesystem",
            "--composefs-backend",
            "--skip-fetch-check",
            "--skip-finalize",
        ])
        .arg(format!("--source-imgref={}", image.source))
        .arg(format!("--target-imgref={}", image.target))
        .arg(format!("--root-mount-spec=UUID={}", mounted.root_uuid))
        .arg(mounted.root())
}

pub fn run(image: &Image, mounted: &Mounted, progress: impl Fn(f64)) -> Result<()> {
    let start = used_space(mounted.root()).unwrap_or(0);
    let scratch = mounted.root().join(SCRATCH);
    let source = scratch.to_string_lossy().into_owned();
    let copied = {
        let _left_to_bootc = mount::Mounted::new(&source, "bind", &scratch)?;
        let _on_the_new_drive =
            mount::Mounted::new(&source, "bind", Path::new(LARGE_TEMPORARY_FILES))?;
        copy(image, mounted, start, progress)
    };
    std::fs::remove_dir_all(&scratch)?;
    copied
}

fn copy(image: &Image, mounted: &Mounted, start: u64, progress: impl Fn(f64)) -> Result<()> {
    let mut child = command(image, mounted).spawn()?;
    let mut shown = 0.0_f64;
    while child.try_wait()?.is_none() {
        let written = used_space(mounted.root()).unwrap_or(start).saturating_sub(start);
        shown = shown.max((written as f64 / image.size as f64).min(1.0));
        progress(shown);
        std::thread::sleep(POLL);
    }
    finished(child, "bootc")?;
    progress(1.0);
    Ok(())
}
