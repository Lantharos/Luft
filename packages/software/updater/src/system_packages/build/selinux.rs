use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use crate::command::run;

const STORE: &str = "etc/selinux/targeted/active";
const POLICY: &str = "etc/selinux/targeted/policy";
pub const FILE_CONTEXTS: &str = "etc/selinux/targeted/contexts/files/file_contexts";
pub const SHIPPED: &str = "usr/lib/luft-system-packages/selinux-policy";
const ENABLED: &str = "usr/bin/selinuxenabled";

/// The modules in a policy store, as `priority/name`.
fn modules(root: &Path) -> BTreeSet<String> {
    let folder = root.join(STORE).join("modules");
    fs::read_dir(&folder)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|priority| priority.path().is_dir())
        .flat_map(|priority| {
            let level = priority.file_name().to_string_lossy().into_owned();
            fs::read_dir(priority.path())
                .into_iter()
                .flatten()
                .flatten()
                .map(move |module| format!("{level}/{}", module.file_name().to_string_lossy()))
        })
        .collect()
}

fn name(module: &str) -> &str {
    module.split_once('/').map_or(module, |(_, name)| name)
}

/// The policy modules the packages added, refusing any that would replace or take away one of
/// Luft's own.
pub fn added(before: &BTreeSet<String>, after: &BTreeSet<String>) -> Result<Vec<String>> {
    if let Some(gone) = before.difference(after).next() {
        bail!(
            "These packages take {} out of Luft's security policy, so they can't be system packages.",
            name(gone)
        );
    }
    let own: BTreeSet<&str> = before.iter().map(|module| name(module)).collect();
    let added: Vec<String> = after
        .difference(before)
        .map(|module| name(module).to_owned())
        .collect();
    if let Some(replacing) = added.iter().find(|module| own.contains(module.as_str())) {
        bail!(
            "These packages replace {replacing} in Luft's security policy, so they can't be system packages."
        );
    }
    Ok(added)
}

/// What the store holds before the packages are installed: Luft's own modules, with the
/// computer's own settings, such as booleans set with `setsebool -P`, so a policy built with
/// the packages' modules keeps them.
pub struct Before {
    modules: BTreeSet<String>,
}

pub fn before(root: &Path) -> Result<Before> {
    let local = Path::new("/").join(STORE);
    for entry in fs::read_dir(&local).into_iter().flatten().flatten() {
        let is_local = entry.file_name().to_string_lossy().ends_with(".local");
        if is_local && entry.path().is_file() {
            fs::copy(entry.path(), root.join(STORE).join(entry.file_name()))
                .with_context(|| format!("Copying {}", entry.path().display()))?;
        }
    }
    Ok(Before {
        modules: modules(root),
    })
}

/// The arguments that let scriptlets see SELinux as on inside the sandbox, so the modules they
/// load go into the build root's policy store, where the build can take them along.
pub fn seen_as_on(root: &Path) -> Vec<PathBuf> {
    if !root.join(ENABLED).exists() {
        return Vec::new();
    }
    vec![
        "--ro-bind".into(),
        root.join("usr/bin/true"),
        Path::new("/").join(ENABLED),
    ]
}

fn newest_policy(root: &Path) -> Result<PathBuf> {
    fs::read_dir(root.join(POLICY))?
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with("policy."))
        })
        .max()
        .context("The packages' policy wasn't built")
}

/// Puts the policy built with the packages' modules into the extension, to be loaded once
/// it's merged. Returns the modules it adds.
pub fn ship(
    before: &Before,
    root: &Path,
    stage: &Path,
    rebuild: impl FnOnce() -> Result<()>,
) -> Result<Vec<String>> {
    let added = added(&before.modules, &modules(root))?;
    if added.is_empty() {
        return Ok(added);
    }
    rebuild()?;
    let shipped = stage.join(SHIPPED);
    if let Some(parent) = shipped.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::copy(newest_policy(root)?, &shipped)?;
    Ok(added)
}

/// Whether the running system enforces or at least loads an SELinux policy.
fn active() -> bool {
    Path::new("/sys/fs/selinux/load").exists()
}

/// Loads the policy the merged extension brings into the kernel. The policy on disk in /etc
/// stays Luft's own, so updates of it keep arriving.
pub fn load_shipped() -> Result<()> {
    if !active() {
        return Ok(());
    }
    let policy = fs::read(Path::new("/").join(SHIPPED)).context("Reading the packages' policy")?;
    fs::write("/sys/fs/selinux/load", policy).context("Loading the packages' policy")
}

/// Goes back to Luft's own policy.
pub fn load_own() -> Result<()> {
    if !active() {
        return Ok(());
    }
    run(&mut Command::new("load_policy")).map(drop)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn set(modules: &[&str]) -> BTreeSet<String> {
        modules.iter().map(|module| (*module).to_owned()).collect()
    }

    #[test]
    fn takes_new_modules_and_refuses_changing_luft_s_own() {
        let own = set(&["100/base", "200/container", "400/luft-keyring"]);
        let docker = set(&[
            "100/base",
            "200/container",
            "400/luft-keyring",
            "400/docker-af-alg-deny",
        ]);
        assert_eq!(added(&own, &docker).unwrap(), ["docker-af-alg-deny"]);
        assert!(
            added(
                &own,
                &set(&[
                    "100/base",
                    "200/container",
                    "400/luft-keyring",
                    "400/container"
                ])
            )
            .is_err()
        );
        assert!(added(&own, &set(&["100/base", "400/luft-keyring"])).is_err());
    }
}
