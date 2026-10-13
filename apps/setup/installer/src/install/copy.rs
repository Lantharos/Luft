use std::time::Duration;

use anyhow::Result;

use super::drive::target::Mounted;
use crate::config::{Config, Image};
use crate::system::command::{Tool, finished};
use crate::system::used_space;

const POLL: Duration = Duration::from_millis(500);

fn command(config: &Config, image: &Image, mounted: &Mounted) -> Tool {
    let mut bootc = Tool::new("bootc")
        .args(["install", "to-filesystem", "--skip-fetch-check", "--skip-finalize"])
        .arg(format!("--source-imgref={}", image.source))
        .arg(format!("--target-imgref={}", image.target))
        .arg(format!("--root-mount-spec=UUID={}", mounted.root_uuid))
        .arg(format!("--boot-mount-spec=UUID={}", mounted.boot_uuid));
    if let Some(bootloader) = &config.bootloader {
        bootc = bootc.arg(format!("--bootloader={bootloader}"));
    }
    for argument in &config.kernel_arguments {
        bootc = bootc.arg(format!("--karg={argument}"));
    }
    bootc.arg(mounted.root())
}

pub fn run(
    config: &Config,
    image: &Image,
    mounted: &Mounted,
    progress: impl Fn(f64),
) -> Result<()> {
    let start = used_space(mounted.root()).unwrap_or(0);
    let mut child = command(config, image, mounted).spawn()?;
    while child.try_wait()?.is_none() {
        let written = used_space(mounted.root()).unwrap_or(start) - start;
        progress((written as f64 / image.size as f64).min(1.0));
        std::thread::sleep(POLL);
    }
    finished(child, "bootc")?;
    progress(1.0);
    Ok(())
}
