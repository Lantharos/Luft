use std::collections::BTreeSet;

use anyhow::{Result, bail};

use super::rpm::Rpm;

const KERNEL_MODULES: [&str; 2] = ["/usr/lib/modules/", "/lib/modules/"];
const MERGED: [&str; 2] = ["/usr/", "/opt/"];
const PLACED: [&str; 2] = ["/etc/", "/var/"];
const RUNTIME: [&str; 4] = ["/run/", "/var/run/", "/var/lock/", "/tmp/"];

pub enum Place {
    Merged,
    Placed,
    Runtime,
}

pub fn place(path: &str) -> Option<Place> {
    let inside = |prefixes: &[&str]| {
        prefixes
            .iter()
            .any(|prefix| path.starts_with(prefix) || path == prefix.trim_end_matches('/'))
    };
    if inside(&RUNTIME) {
        Some(Place::Runtime)
    } else if inside(&MERGED) {
        Some(Place::Merged)
    } else if inside(&PLACED) {
        Some(Place::Placed)
    } else {
        None
    }
}

/// Refuses what a system extension can't carry without changing Luft itself.
pub fn check(requested: &BTreeSet<String>, rpms: &[Rpm], base: &BTreeSet<String>) -> Result<()> {
    if let Some(name) = requested.iter().find(|name| base.contains(*name)) {
        bail!("{name} is already part of Luft.");
    }
    for rpm in rpms {
        let name = &rpm.name;
        if base.contains(name) {
            bail!(
                "These packages need a newer {name} than this version of Luft has. \
                 Try again after the next update."
            );
        }
        let has = |prefix: &str| rpm.files.iter().any(|file| file.path.starts_with(prefix));
        if KERNEL_MODULES.iter().any(|prefix| has(prefix))
            || name.starts_with("kmod-")
            || name.starts_with("akmod-")
        {
            bail!(
                "{name} adds drivers to the kernel. With Secure Boot, the kernel only loads drivers \
                 signed with a key the computer trusts, and they can't be signed on the computer, \
                 so {name} can't be a system package."
            );
        }
        if let Some(file) = rpm.files.iter().find(|file| place(&file.path).is_none()) {
            bail!(
                "{name} puts files in {}, outside the folders system packages can add to.",
                file.path
            );
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::super::rpm::File;
    use super::*;

    fn rpm(name: &str, paths: &[&str]) -> Rpm {
        Rpm {
            path: format!("{name}.rpm").into(),
            name: name.to_owned(),
            version: "1-1".to_owned(),
            arch: "x86_64".to_owned(),
            summary: String::new(),
            files: paths
                .iter()
                .map(|path| File {
                    path: (*path).to_owned(),
                    user: "root".to_owned(),
                    group: "root".to_owned(),
                    mode: 0o100644,
                    ghost: false,
                })
                .collect(),
            origin: crate::system_packages::manifest::Origin::Fedora,
        }
    }

    fn refused(rpms: &[Rpm]) -> String {
        let base = BTreeSet::from(["glibc".to_owned()]);
        let requested = BTreeSet::from([rpms[0].name.clone()]);
        check(&requested, rpms, &base)
            .err()
            .map(|error| error.to_string())
            .unwrap_or_default()
    }

    #[test]
    fn refuses_kernel_modules() {
        let rpms = [rpm(
            "v4l2loopback",
            &["/usr/lib/modules/7.2.9/extra/v4l2loopback.ko.xz"],
        )];
        assert!(refused(&rpms).contains("drivers"));
    }

    #[test]
    fn refuses_replacing_a_package_of_the_image() {
        let rpms = [
            rpm("tailscale", &["/usr/bin/tailscaled"]),
            rpm("glibc", &["/usr/lib64/libc.so.6"]),
        ];
        assert!(refused(&rpms).contains("newer glibc"));
    }

    #[test]
    fn takes_services_with_their_configuration_and_state() {
        let rpms = [rpm(
            "tailscale",
            &[
                "/usr/bin/tailscaled",
                "/etc/default/tailscaled",
                "/var/lib/tailscale",
                "/run/tailscale",
            ],
        )];
        assert_eq!(refused(&rpms), "");
    }

    #[test]
    fn refuses_files_outside_what_extensions_and_placing_cover() {
        assert!(refused(&[rpm("odd", &["/boot/odd.img"])]).contains("/boot/odd.img"));
    }
}
