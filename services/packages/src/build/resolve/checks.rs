use std::collections::BTreeSet;
use std::path::{Component, Path};

use super::Refused;
use super::rpm::Rpm;

const KERNEL_MODULES: [&str; 2] = ["/usr/lib/modules/", "/lib/modules/"];
const MERGED: [&str; 2] = ["/usr/", "/opt/"];
const PLACED: [&str; 2] = ["/etc/", "/var/"];
const RUNTIME: [&str; 4] = ["/run/", "/var/run/", "/var/lock/", "/tmp/"];
const BY_HAND: [&str; 1] = ["/usr/local/"];

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
    if inside(&BY_HAND)
        || Path::new(path)
            .components()
            .any(|part| part == Component::ParentDir)
    {
        None
    } else if inside(&RUNTIME) {
        Some(Place::Runtime)
    } else if inside(&MERGED) {
        Some(Place::Merged)
    } else if inside(&PLACED) {
        Some(Place::Placed)
    } else {
        None
    }
}

/// What a system extension can't carry without changing Luft itself, one refusal per package.
pub fn check(rpms: &[Rpm], base: &BTreeSet<String>) -> Vec<Refused> {
    rpms.iter().filter_map(|rpm| refusal(rpm, base)).collect()
}

fn refusal(rpm: &Rpm, base: &BTreeSet<String>) -> Option<Refused> {
    let name = &rpm.name;
    let has = |prefix: &str| rpm.files.iter().any(|file| file.path.starts_with(prefix));
    let reason = if base.contains(name) {
        format!(
            "These packages need a newer {name} than this version of Luft has. \
             Try again after the next update."
        )
    } else if KERNEL_MODULES.iter().any(|prefix| has(prefix))
        || name.starts_with("kmod-")
        || name.starts_with("akmod-")
    {
        format!(
            "{name} adds drivers to the kernel. With Secure Boot, the kernel only loads drivers \
             signed with a key the computer trusts, and they can't be signed on the computer, \
             so {name} can't be a system package."
        )
    } else {
        let file = rpm.files.iter().find(|file| place(&file.path).is_none())?;
        format!(
            "{name} puts files in {}, outside the folders system packages can add to.",
            file.path
        )
    };
    Some(Refused {
        package: name.clone(),
        reason,
    })
}

#[cfg(test)]
mod tests {
    use super::super::rpm::sample as rpm;
    use super::*;

    fn refused(rpms: &[Rpm]) -> String {
        let base = BTreeSet::from(["glibc".to_owned()]);
        check(rpms, &base)
            .into_iter()
            .map(|refused| refused.reason)
            .collect()
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
        assert!(refused(&[rpm("odd", &["/usr/../boot/odd.img"])]).contains("/usr/../boot"));
        assert!(refused(&[rpm("odd", &["/usr/local/bin/odd"])]).contains("/usr/local/bin/odd"));
    }
}
