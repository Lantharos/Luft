use std::path::Path;

use anyhow::{Context, Result};

use crate::keys::{self, Unsealed};
use crate::system::command::Tool;

use super::cmdline;
use super::kernels::Kernel;

pub fn build(kernel: &Kernel, initrd: &Path, output: &Path, keys: &Unsealed) -> Result<()> {
    let partial = output.with_extension("partial");
    let mut ukify = Tool::new("ukify")
        .arg("build")
        .arg(format!("--linux={}", kernel.image.display()))
        .arg(format!("--initrd={}", initrd.display()))
        .arg(format!("--cmdline={}", cmdline::read()))
        .arg(format!("--uname={}", kernel.version))
        .arg("--os-release=@/etc/os-release")
        .arg("--signtool=systemd-sbsign")
        .arg("--no-sign-kernel")
        .arg(format!(
            "--secureboot-private-key={}",
            keys.signing_key().display()
        ))
        .arg(format!(
            "--secureboot-certificate={}",
            keys::certificate().display()
        ))
        .arg(format!("--output={}", partial.display()));
    if let Some(pcr_key) = keys.pcr_key() {
        ukify = ukify
            .arg(format!("--pcr-private-key={}", pcr_key.display()))
            .arg(format!(
                "--pcr-public-key={}",
                keys::pcr_public_key().display()
            ))
            .arg("--phases=enter-initrd")
            .arg("--pcr-banks=sha256");
    }
    if let Some(folder) = output.parent() {
        std::fs::create_dir_all(folder)?;
    }
    ukify.status().with_context(|| {
        format!(
            "The signed startup image for Linux {} couldn't be built.",
            kernel.version
        )
    })?;
    std::fs::rename(&partial, output)?;
    Ok(())
}
