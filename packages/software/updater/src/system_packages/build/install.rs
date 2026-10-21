use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use super::rpm::Rpm;
use crate::command::run;
use crate::system_packages::manifest::Origin;

const KEYS: &str = "usr/share/pki/rpm-gpg";
const ADDED_KEYS: &str = "etc/pki/rpm-gpg";
const PACKAGES: &str = "/run/luft-packages";
const HIDDEN: [&str; 3] = ["/tmp", "/run", "/var/cache/libdnf5"];
const CAPABILITIES: [&str; 8] = [
    "chown",
    "dac_override",
    "dac_read_search",
    "fowner",
    "fsetid",
    "setfcap",
    "setgid",
    "setuid",
];
const NARROWING: &str = "setpcap";

/// Fedora's keys for this release, and those of the repositories that were added.
fn keys(root: &Path, release: &str) -> Result<Vec<PathBuf>> {
    let prefix = format!("RPM-GPG-KEY-fedora-{release}-");
    let fedora: Vec<PathBuf> = fs::read_dir(root.join(KEYS))?
        .flatten()
        .filter(|entry| entry.file_name().as_bytes().starts_with(prefix.as_bytes()))
        .map(|entry| Path::new("/").join(KEYS).join(entry.file_name()))
        .collect();
    if fedora.is_empty() {
        bail!("This system has no keys to check Fedora's packages with.");
    }
    let added = fs::read_dir(root.join(ADDED_KEYS))
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| Path::new("/").join(ADDED_KEYS).join(entry.file_name()));
    Ok(fedora.into_iter().chain(added).collect())
}

/// A command run with the build root as its whole filesystem: no network, no other processes,
/// a `/dev` with only the harmless devices, and none of the capabilities that reach past files,
/// not even through programs it gives file capabilities to.
fn sandboxed(root: &Path, packages: &Path) -> Command {
    let mut command = Command::new("bwrap");
    command.arg("--bind").arg(root).arg("/");
    for hidden in HIDDEN {
        command.args(["--tmpfs", hidden]);
    }
    command
        .arg("--ro-bind")
        .arg(packages)
        .arg(PACKAGES)
        .args(["--dev", "/dev"])
        .args([
            "--unshare-net",
            "--unshare-pid",
            "--unshare-ipc",
            "--unshare-uts",
        ])
        .args(["--unshare-cgroup-try", "--die-with-parent", "--new-session"])
        .args(["--clearenv", "--setenv", "PATH", "/usr/bin:/usr/sbin"])
        .args(["--cap-drop", "ALL"]);
    for capability in CAPABILITIES.iter().chain([&NARROWING]) {
        command
            .arg("--cap-add")
            .arg(format!("CAP_{}", capability.to_ascii_uppercase()));
    }
    command
        .args(["--", "setpriv"])
        .arg(format!("--bounding-set=-all,+{}", CAPABILITIES.join(",+")))
        .arg(format!("--inh-caps=-{NARROWING}"))
        .arg(format!("--ambient-caps=-{NARROWING}"))
        .arg("--");
    command
}

fn transaction(root: &Path, packages: &Path, level: &str, rpms: &[&Rpm]) -> Result<()> {
    if rpms.is_empty() {
        return Ok(());
    }
    run(sandboxed(root, packages)
        .args(["rpm", "--install", "--define"])
        .arg(format!("_pkgverify_level {level}"))
        .args(rpms.iter().filter_map(|rpm| {
            rpm.path
                .file_name()
                .map(|name| Path::new(PACKAGES).join(name))
        })))
    .context("Installing the packages")
    .map(drop)
}

/// Installs the packages into the build root, those from Fedora and the added repositories
/// only with a valid signature from their keys. Package files installed by themselves come
/// after them, checked against their digests like dnf does with a local file. Scriptlets run
/// there too, so files they make for the package, such as libvirt's default network, can be
/// taken along; nothing else they change leaves the build root.
pub fn install(root: &Path, release: &str, packages: &Path, rpms: &[Rpm]) -> Result<()> {
    run(sandboxed(root, packages)
        .args(["rpmkeys", "--import"])
        .args(keys(root, release)?))?;
    let (files, signed): (Vec<&Rpm>, Vec<&Rpm>) =
        rpms.iter().partition(|rpm| rpm.origin == Origin::File);
    transaction(root, packages, "all", &signed)?;
    transaction(root, packages, "digest", &files)
}
