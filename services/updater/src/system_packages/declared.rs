use std::fs;
use std::path::Path;

use super::manifest::Declared;

const CREATING_TMPFILES: &str = "fFdDvqQpLcbC";
const CONVENTIONAL: [&str; 4] = ["/var/lib", "/var/cache", "/var/log", "/etc"];
const UNIT_DIRECTORIES: [(&str, &str); 4] = [
    ("StateDirectory=", "/var/lib"),
    ("CacheDirectory=", "/var/cache"),
    ("LogsDirectory=", "/var/log"),
    ("ConfigurationDirectory=", "/etc"),
];

fn lines(directory: &Path, extension: &str) -> Vec<String> {
    let Ok(entries) = fs::read_dir(directory) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|found| found == extension)
        })
        .filter_map(|entry| fs::read_to_string(entry.path()).ok())
        .flat_map(|text| text.lines().map(str::to_owned).collect::<Vec<_>>())
        .filter(|line| !line.trim_start().starts_with('#'))
        .collect()
}

fn kept(path: &str) -> bool {
    (path.starts_with("/etc/") || path.starts_with("/var/")) && !path.contains('%')
}

pub fn sysusers(line: &str, declared: &mut Declared) {
    let mut fields = line.split_whitespace();
    let (Some(kind), Some(name)) = (fields.next(), fields.next()) else {
        return;
    };
    match kind {
        "u" | "u!" => {
            declared.users.insert(name.to_owned());
            declared.groups.insert(name.to_owned());
        }
        "g" => {
            declared.groups.insert(name.to_owned());
        }
        _ => {}
    }
}

pub fn tmpfiles(line: &str, declared: &mut Declared) {
    let mut fields = line.split_whitespace();
    let (Some(kind), Some(path)) = (fields.next(), fields.next()) else {
        return;
    };
    let creates = kind
        .chars()
        .next()
        .is_some_and(|first| CREATING_TMPFILES.contains(first));
    if creates && kept(path) {
        declared.paths.insert(path.trim_end_matches('/').to_owned());
    }
}

pub fn unit(line: &str, declared: &mut Declared) {
    let line = line.trim();
    for (setting, base) in UNIT_DIRECTORIES {
        let Some(names) = line.strip_prefix(setting) else {
            continue;
        };
        for name in names.split_whitespace() {
            let name = name.split(':').next().unwrap_or(name).trim_matches('/');
            if !name.is_empty() && !name.contains("..") {
                let path = format!("{base}/{name}");
                if kept(&path) {
                    declared.paths.insert(path);
                }
            }
        }
    }
}

/// The folders daemons conventionally make for themselves at runtime, named after their package
/// or unit, such as containerd's /var/lib/containerd.
pub fn conventional<'a>(names: impl IntoIterator<Item = &'a str>, declared: &mut Declared) {
    for name in names {
        let name = name.rsplit_once('.').map_or(name, |(base, _)| base);
        if name.is_empty() || name.contains(['/', '@']) {
            continue;
        }
        for base in CONVENTIONAL {
            declared.paths.insert(format!("{base}/{name}"));
        }
    }
}

pub fn read(
    stage: &Path,
    placed: impl IntoIterator<Item = String>,
    names: impl IntoIterator<Item = String>,
) -> Declared {
    let mut declared = Declared::default();
    let names: Vec<String> = names.into_iter().collect();
    conventional(names.iter().map(String::as_str), &mut declared);
    for line in lines(&stage.join("usr/lib/sysusers.d"), "conf") {
        sysusers(&line, &mut declared);
    }
    for line in lines(&stage.join("usr/lib/tmpfiles.d"), "conf") {
        tmpfiles(&line, &mut declared);
    }
    for line in lines(&stage.join("usr/lib/systemd/system"), "service") {
        unit(&line, &mut declared);
    }
    declared.paths.extend(placed);
    declared
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_what_tmpfiles_creates_under_etc_and_var() {
        let mut declared = Declared::default();
        for line in [
            "d /var/lib/libvirt/qemu 0751 qemu qemu -",
            "d /run/libvirt 0755 root root -",
            "z /var/lib/existing 0700 root root -",
            "C! /etc/default/thing - - - -",
            "d %S/thing 0700 - - -",
        ] {
            tmpfiles(line, &mut declared);
        }
        assert_eq!(
            declared.paths.into_iter().collect::<Vec<_>>(),
            ["/etc/default/thing", "/var/lib/libvirt/qemu"]
        );
    }

    #[test]
    fn reads_the_directories_systemd_makes_for_a_service() {
        let mut declared = Declared::default();
        unit("StateDirectory=tailscale", &mut declared);
        unit(
            "CacheDirectory=tailscale docker/cache:/var/cache/alias",
            &mut declared,
        );
        unit("LogsDirectory=../escape", &mut declared);
        assert_eq!(
            declared.paths.into_iter().collect::<Vec<_>>(),
            [
                "/var/cache/docker/cache",
                "/var/cache/tailscale",
                "/var/lib/tailscale"
            ]
        );
    }

    #[test]
    fn counts_the_folders_named_after_packages_and_services() {
        let mut declared = Declared::default();
        conventional(
            ["containerd", "docker.service", "getty@.service"],
            &mut declared,
        );
        assert!(declared.paths.contains("/var/lib/containerd"));
        assert!(declared.paths.contains("/etc/docker"));
        assert!(!declared.paths.iter().any(|path| path.contains("getty")));
    }

    #[test]
    fn a_user_brings_its_own_group() {
        let mut declared = Declared::default();
        sysusers(
            "u tailscale - \"Tailscale\" /var/lib/tailscale",
            &mut declared,
        );
        sysusers("g docker -", &mut declared);
        sysusers("m qemu kvm", &mut declared);
        assert_eq!(
            declared.users.into_iter().collect::<Vec<_>>(),
            ["tailscale"]
        );
        assert_eq!(
            declared.groups.into_iter().collect::<Vec<_>>(),
            ["docker", "tailscale"]
        );
    }
}
