use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use super::rpm::Rpm;
use crate::command::run;

const KEYS: &str = "usr/share/pki/rpm-gpg";
const DEVICES: [(&str, u32); 4] = [("null", 3), ("zero", 5), ("random", 8), ("urandom", 9)];

/// Gives the build root a /dev of its own with only the devices scriptlets write to or read
/// from, so they never reach the computer's disks.
pub fn devices(root: &Path) -> Result<PathBuf> {
    let dev = root.join("dev");
    fs::create_dir_all(&dev)?;
    run(Command::new("mount")
        .args(["-t", "tmpfs", "-o", "mode=0755,nosuid,noexec", "devices"])
        .arg(&dev))?;
    for (name, minor) in DEVICES {
        run(Command::new("mknod")
            .args(["-m", "666"])
            .arg(dev.join(name))
            .args(["c", "1", &minor.to_string()]))?;
    }
    Ok(dev)
}

fn keys(root: &Path, release: &str) -> Result<Vec<PathBuf>> {
    let prefix = format!("RPM-GPG-KEY-fedora-{release}-");
    let keys: Vec<PathBuf> = fs::read_dir(root.join(KEYS))?
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .is_some_and(|name| name.as_bytes().starts_with(prefix.as_bytes()))
        })
        .collect();
    if keys.is_empty() {
        bail!("This system has no keys to check Fedora's packages with.");
    }
    Ok(keys)
}

/// Installs the packages into the build root with Fedora's signatures required. Their
/// scriptlets run there too, so files they make for the package, such as libvirt's default
/// network, can be taken along; nothing else they change leaves the build root.
pub fn install(root: &Path, release: &str, rpms: &[Rpm]) -> Result<()> {
    run(Command::new("rpmkeys")
        .arg(format!("--root={}", root.display()))
        .arg("--import")
        .args(keys(root, release)?))?;
    run(Command::new("rpm")
        .arg(format!("--root={}", root.display()))
        .args(["--install", "--define", "_pkgverify_level all"])
        .args(rpms.iter().map(|rpm| &rpm.path)))
    .context("Installing the packages")
    .map(drop)
}
