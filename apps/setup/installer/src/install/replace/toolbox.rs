use anyhow::Result;

use crate::install::configure::deployment::Deployment;
use crate::survey::linux::Family;
use crate::survey::linux::old::OldSystem;
use crate::system::files::write;

const DEFINITIONS: &str = "lib/luft/carried-tools";
const FEDORA: &str = "registry.fedoraproject.org/fedora-toolbox";
const ARCH: &str = "quay.io/toolbx/arch-toolbox:latest";

fn containerfile(old: &OldSystem) -> Option<String> {
    if old.packages.is_empty() {
        return None;
    }
    let packages = old.packages.join(" ");
    match old.release.family {
        Family::Fedora => Some(format!(
            "FROM {FEDORA}:{}\nRUN dnf install --assumeyes --skip-unavailable {packages} && dnf clean all\n",
            old.release.version
        )),
        Family::Arch => Some(format!(
            "FROM {ARCH}\nRUN pacman -Syu --noconfirm && for package in {packages}; do pacman -S --noconfirm --needed \"$package\" || true; done\n"
        )),
        Family::Other => None,
    }
}

pub fn define(deployment: &Deployment, old: &OldSystem, user: &str) -> Result<()> {
    let Some(containerfile) = containerfile(old) else {
        return Ok(());
    };
    let folder = deployment.var(&format!("{DEFINITIONS}/{user}"));
    write(&folder.join("Containerfile"), &containerfile)?;
    write(&folder.join("name"), &format!("{}\n", old.release.id))?;
    deployment.relabel(&[folder])
}
