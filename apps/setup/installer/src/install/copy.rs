use std::time::Duration;

use anyhow::Result;

use super::drive::target::Mounted;
use crate::config::Image;
use crate::system::command::{Tool, finished};
use crate::system::used_space;

const POLL: Duration = Duration::from_millis(500);

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
    let mut child = command(image, mounted).spawn()?;
    while child.try_wait()?.is_none() {
        let written = used_space(mounted.root()).unwrap_or(start) - start;
        progress((written as f64 / image.size as f64).min(1.0));
        std::thread::sleep(POLL);
    }
    finished(child, "bootc")?;
    progress(1.0);
    Ok(())
}
