use std::collections::BTreeSet;
use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use super::rpm::Rpm;
use super::selinux;
use crate::command::run;
use crate::repositories;
use crate::state::manifest::Origin;

const KEYS: &str = "usr/share/pki/rpm-gpg";
const PACKAGES: &str = "/run/luft-packages";
const SOURCE_KEYS: &str = "var/lib/luft-packages-source-keys";
const HIDDEN: [&str; 3] = ["/tmp", "/run", "/var/cache/libdnf5"];
const CAPABILITIES: [&str; 7] = [
    "chown",
    "dac_override",
    "fowner",
    "fsetid",
    "setfcap",
    "setgid",
    "setuid",
];
const NARROWING: &str = "setpcap";

fn fedora_keys(root: &Path, release: &str) -> Result<Vec<PathBuf>> {
    let prefix = format!("RPM-GPG-KEY-fedora-{release}-");
    let fedora: Vec<PathBuf> = fs::read_dir(root.join(KEYS))?
        .flatten()
        .filter(|entry| entry.file_name().as_bytes().starts_with(prefix.as_bytes()))
        .map(|entry| Path::new("/").join(KEYS).join(entry.file_name()))
        .collect();
    if fedora.is_empty() {
        bail!("This system has no keys to check Fedora's packages with.");
    }
    Ok(fedora)
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
        .args(selinux::seen_as_on(root))
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

fn in_sandbox<'a>(rpms: &'a [&Rpm]) -> impl Iterator<Item = PathBuf> + 'a {
    rpms.iter().filter_map(|rpm| {
        rpm.path
            .file_name()
            .map(|name| Path::new(PACKAGES).join(name))
    })
}

/// Checks packages against the keys of where they came from and no others, in a key database
/// made for the check, so a source's key can't vouch for Fedora's packages or another
/// source's.
fn verify(root: &Path, packages: &Path, keys: &[PathBuf], rpms: &[&Rpm]) -> Result<()> {
    if rpms.is_empty() {
        return Ok(());
    }
    let database = Path::new("/").join(SOURCE_KEYS);
    let kept = root.join(SOURCE_KEYS);
    fs::create_dir_all(&kept)?;
    let checked = run(sandboxed(root, packages)
        .args(["rpmkeys", "--dbpath"])
        .arg(&database)
        .arg("--import")
        .args(keys))
    .and_then(|_| {
        run(sandboxed(root, packages)
            .args(["rpmkeys", "--dbpath"])
            .arg(&database)
            .args(["--checksig", "--define", "_pkgverify_level all"])
            .args(in_sandbox(rpms)))
    });
    fs::remove_dir_all(&kept)?;
    checked.map(drop)
}

fn transaction(root: &Path, packages: &Path, level: &str, rpms: &[&Rpm]) -> Result<()> {
    if rpms.is_empty() {
        return Ok(());
    }
    run(sandboxed(root, packages)
        .args(["rpm", "--install", "--define"])
        .arg(format!("_pkgverify_level {level}"))
        .args(in_sandbox(rpms)))
    .context("Installing the packages")
    .map(drop)
}

/// Builds the build root's policy again from its store, with the packages' modules.
pub fn rebuild_policy(root: &Path, packages: &Path) -> Result<()> {
    run(sandboxed(root, packages).args(["semodule", "-B"]))
        .context("Building the security policy with the packages' modules")
        .map(drop)
}

/// Installs the packages into the build root. Those from Fedora must carry a valid signature
/// from Fedora's keys, and those from an added repository one from the keys it was added
/// with. Package files installed by themselves come after them, checked against their digests
/// like dnf does with a local file. Scriptlets run there too, so files they make for the
/// package, such as libvirt's default network, can be taken along; nothing else they change
/// leaves the build root.
pub fn install(root: &Path, release: &str, packages: &Path, rpms: &[Rpm]) -> Result<()> {
    let (files, signed): (Vec<&Rpm>, Vec<&Rpm>) =
        rpms.iter().partition(|rpm| rpm.origin == Origin::File);
    let from = |origin: &Origin| -> Vec<&Rpm> {
        signed
            .iter()
            .copied()
            .filter(|rpm| rpm.origin == *origin)
            .collect()
    };
    let mut keys = fedora_keys(root, release)?;
    verify(root, packages, &keys, &from(&Origin::Fedora))
        .context("A package from Fedora isn't signed with Fedora's keys.")?;
    let added: BTreeSet<&String> = signed
        .iter()
        .filter_map(|rpm| match &rpm.origin {
            Origin::Repository(file) => Some(file),
            _ => None,
        })
        .collect();
    for file in added {
        let source = repositories::key_paths(file);
        verify(
            root,
            packages,
            &source,
            &from(&Origin::Repository(file.clone())),
        )
        .with_context(|| {
            format!("A package from {file} isn't signed with the keys that source was added with.")
        })?;
        keys.extend(source);
    }
    run(sandboxed(root, packages)
        .args(["rpmkeys", "--import"])
        .args(keys))?;
    transaction(root, packages, "all", &signed)?;
    transaction(root, packages, "digest", &files)
}
