use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::keys::{self, Unsealed};
use crate::system::command::Tool;

use super::kernels::Kernel;

pub const TRIAL: &str = "trial";

pub struct Lines {
    pub main: String,
    pub rescue: String,
    pub trial: Option<String>,
}

fn profile(keys: &Unsealed, id: &str, title: Option<&str>, line: &str) -> Result<PathBuf> {
    let output = keys.scratch(&format!("{id}.profile.efi"));
    let description = match title {
        Some(title) => format!("ID={id}\nTITLE={title}"),
        None => format!("ID={id}"),
    };
    Tool::new("ukify")
        .arg("build")
        .arg(format!("--profile={description}"))
        .arg(format!("--cmdline={line}"))
        .arg(format!("--output={}", output.display()))
        .status()?;
    Ok(output)
}

pub fn build(
    kernel: &Kernel,
    initrd: &Path,
    output: &Path,
    keys: &Unsealed,
    lines: &Lines,
) -> Result<()> {
    let partial = output.with_extension("partial");
    let rescue = profile(keys, "rescue", Some("Rescue"), &lines.rescue)?;
    let trial = lines
        .trial
        .as_deref()
        .map(|line| profile(keys, TRIAL, None, line))
        .transpose()?;
    let mut ukify = Tool::new("ukify")
        .arg("build")
        .arg(format!("--linux={}", kernel.image.display()))
        .arg(format!("--initrd={}", initrd.display()))
        .arg(format!("--cmdline={}", lines.main))
        .arg(format!("--uname={}", kernel.version))
        .arg("--os-release=@/etc/os-release")
        .arg("--profile=ID=main")
        .arg(format!("--join-profile={}", rescue.display()))
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
    if let Some(trial) = &trial {
        ukify = ukify.arg(format!("--join-profile={}", trial.display()));
    }
    if let Some(pcr_key) = keys.pcr_key() {
        ukify = ukify
            .arg(format!("--pcr-private-key={}", pcr_key.display()))
            .arg(format!(
                "--pcr-public-key={}",
                keys::pcr_public_key().display()
            ))
            .arg("--phases=enter-initrd")
            .arg("--pcr-banks=sha256")
            .arg("--sign-profile=main")
            .arg(format!("--sign-profile={TRIAL}"));
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

fn u16_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?) as usize)
}

fn u32_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?) as usize)
}

fn initrd_section(headers: &[u8]) -> Option<(u64, u64)> {
    let pe = u32_at(headers, 0x3c)?;
    if headers.get(pe..pe + 4)? != b"PE\0\0" {
        return None;
    }
    let table = pe + 24 + u16_at(headers, pe + 20)?;
    (0..u16_at(headers, pe + 6)?).find_map(|index| {
        let entry = headers.get(table + index * 40..table + index * 40 + 40)?;
        (entry[..8] == *b".initrd\0").then_some((
            u32_at(entry, 20)? as u64,
            u32_at(entry, 8)?.min(u32_at(entry, 16)?) as u64,
        ))
    })
}

pub fn extract_initrd(image: &Path, output: &Path) -> Result<()> {
    let mut file = File::open(image)?;
    let mut headers = vec![0u8; 4096];
    let read = file.read(&mut headers)?;
    let (offset, size) = initrd_section(&headers[..read])
        .with_context(|| format!("{} has no initrd.", image.display()))?;
    file.seek(SeekFrom::Start(offset))?;
    let mut target = File::create(output)?;
    std::io::copy(&mut file.take(size), &mut target)?;
    target.sync_all()?;
    Ok(())
}
