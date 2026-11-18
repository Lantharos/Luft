use std::collections::{BTreeSet, HashMap, HashSet};
use std::os::unix::fs::MetadataExt;
use std::path::Path;

use anyhow::Result;
use walkdir::WalkDir;

use super::resolve::rpm::Rpm;
use crate::state::manifest::{Build, Declared, Origin};

const KIND: u32 = 0o170000;
const DIRECTORY: u32 = 0o040000;
const REGULAR: u32 = 0o100000;
const SPECIAL: u32 = 0o6000;
const CAPABILITIES: &str = "security.capability";
const FACTORY: &str = "/usr/share/factory";
const ACCOUNTS: [&str; 3] = ["user(", "group(", "groupmember("];
const VENDOR: &str = "/usr/lib/";
const SETTINGS: &str = "/etc/";
const MANAGER: &str = "systemd/";
const PER_ACCOUNT: [&str; 2] = ["user/", "user-"];
const SPOOLED: &str = "/var/spool/cron/";

/// What changes what the system does as root or who may do what, in folders read both as
/// defaults in /usr/lib and as settings in /etc: device rules, kernel modules and their
/// settings, what runs at startup, accounts, sign-in, polkit and network hooks. Services are
/// in systemd's folder, but for those of each account.
const CONFIGURED: [&str; 14] = [
    "udev/",
    "modules-load.d/",
    "modprobe.d/",
    "tmpfiles.d/",
    "sysctl.d/",
    "binfmt.d/",
    "sysusers.d/",
    "userdb/",
    "kernel/",
    "pam.d/",
    "security/",
    "polkit-1/",
    "NetworkManager/",
    "dracut",
];

/// The same in the rest of /usr: kernel modules, PAM and NSS modules, polkit, D-Bus system
/// services, sudo's plugins, security policy, trusted certificates and the plugins of the
/// package managers that run as root.
const BUILT_IN: [&str; 11] = [
    "/usr/lib/modules/",
    "/usr/lib64/security/",
    "/usr/lib64/libnss_",
    "/usr/lib/libnss_",
    "/usr/share/polkit-1/",
    "/usr/share/dbus-1/system",
    "/usr/libexec/sudo/",
    "/usr/share/selinux/",
    "/usr/share/pki/",
    "/usr/lib64/libdnf5/plugins/",
    "/usr/lib64/rpm-plugins/",
];

/// The same in /etc alone: name lookups, D-Bus, sudo, security policy, the libraries every
/// program loads, scheduled and startup scripts, SSH, certificates and dnf.
const SET: [&str; 13] = [
    "nsswitch.conf",
    "dbus-1/system",
    "sudo",
    "selinux/",
    "ld.so.",
    "cron",
    "anacrontab",
    "rc.d/",
    "init.d/",
    "logrotate",
    "ssh/",
    "pki/",
    "dnf/",
];

fn privileged(path: &str) -> bool {
    let configured = [VENDOR, SETTINGS]
        .iter()
        .filter_map(|root| path.strip_prefix(root))
        .any(|rest| match rest.strip_prefix(MANAGER) {
            Some(managed) => !PER_ACCOUNT.iter().any(|own| managed.starts_with(own)),
            None => CONFIGURED.iter().any(|folder| rest.starts_with(folder)),
        });
    configured
        || BUILT_IN.iter().any(|prefix| path.starts_with(prefix))
        || path
            .strip_prefix(SETTINGS)
            .is_some_and(|rest| SET.iter().any(|name| rest.starts_with(name)))
        || path.starts_with(SPOOLED)
}

fn special(mode: u32) -> bool {
    mode & KIND == REGULAR && mode & SPECIAL != 0
}

/// Whether a package only adds programs and files that run with the rights of whoever starts
/// them: it comes from Fedora's own repositories, and brings none of what changes what the
/// system does as root, no setuid, setgid or file capability programs, and no users or groups.
pub fn package(rpm: &Rpm) -> bool {
    rpm.origin == Origin::Fedora
        && rpm.files.iter().all(|file| {
            !file.capabilities
                && !special(file.mode)
                && (file.mode & KIND == DIRECTORY || !privileged(&file.path))
        })
        && !rpm
            .provides
            .iter()
            .any(|provided| ACCOUNTS.iter().any(|kind| provided.starts_with(kind)))
}

/// Whether the packages a change brings in and those it takes away are all plain, against
/// `current`, the build the running system has merged.
pub fn change(current: Option<&Build>, rpms: &[Rpm]) -> bool {
    let before: HashMap<&str, &Origin> = current
        .map(|build| {
            build
                .packages
                .iter()
                .map(|package| (package.name.as_str(), &package.origin))
                .collect()
        })
        .unwrap_or_default();
    let after: HashSet<&str> = rpms.iter().map(|rpm| rpm.name.as_str()).collect();
    let entering = rpms
        .iter()
        .filter(|rpm| before.get(rpm.name.as_str()) != Some(&&rpm.origin));
    let leaving = current
        .into_iter()
        .flat_map(|build| &build.packages)
        .filter(|package| !after.contains(package.name.as_str()));
    entering.into_iter().all(package) && leaving.into_iter().all(|package| package.plain)
}

fn capable(path: &Path) -> bool {
    rustix::fs::lgetxattr(path, CAPABILITIES, &mut [0u8; 0][..]).is_ok()
}

/// Everything in a staged extension that changes what the system does as root or who may do
/// what, with the users, groups and policy modules it brings. A change whose build has the
/// same as the one before is plain, whatever its packages' scriptlets made.
pub fn privileges(
    stage: &Path,
    declared: &Declared,
    selinux_modules: &[String],
) -> Result<BTreeSet<String>> {
    let mut found = BTreeSet::new();
    for entry in WalkDir::new(stage).min_depth(1) {
        let entry = entry?;
        if entry.file_type().is_dir() {
            continue;
        }
        let inside = Path::new("/").join(entry.path().strip_prefix(stage)?);
        let path = inside.to_string_lossy();
        let path = path.strip_prefix(FACTORY).unwrap_or(&path);
        let mode = entry.metadata()?.mode();
        if privileged(path) || special(mode) || (mode & KIND == REGULAR && capable(entry.path())) {
            found.insert(path.to_owned());
        }
    }
    found.extend(declared.users.iter().map(|user| format!("user {user}")));
    found.extend(declared.groups.iter().map(|group| format!("group {group}")));
    found.extend(
        selinux_modules
            .iter()
            .map(|module| format!("policy {module}")),
    );
    Ok(found)
}

/// Whether the build the running system has merged changes the system as much as `privileges`.
pub fn same(current: Option<&Build>, privileges: &BTreeSet<String>) -> bool {
    current.map_or(privileges.is_empty(), |build| {
        build.privileges == *privileges
    })
}

#[cfg(test)]
mod tests {
    use super::super::resolve::rpm::sample;
    use super::*;
    use crate::state::manifest::Package;

    fn plain(name: &str, paths: &[&str]) -> bool {
        package(&sample(name, paths))
    }

    #[test]
    fn programs_and_their_files_are_plain() {
        assert!(plain(
            "gh",
            &[
                "/usr/bin/gh",
                "/usr/share/man/man1/gh.1.gz",
                "/usr/share/bash-completion/completions/gh",
                "/usr/lib/systemd/user/gh-sync.service",
                "/usr/share/dbus-1/services/org.example.Gh.service",
                "/etc/gh/config.yml",
            ]
        ));
    }

    #[test]
    fn what_runs_as_root_or_hands_out_rights_is_not() {
        for path in [
            "/usr/lib/systemd/system/sshd.service",
            "/usr/lib/systemd/system-generators/odd",
            "/usr/lib/systemd/userdb/odd.user",
            "/etc/systemd/system/odd.service",
            "/usr/lib/udev/rules.d/70-odd.rules",
            "/usr/lib64/security/pam_odd.so",
            "/usr/lib64/libnss_odd.so.2",
            "/usr/share/polkit-1/actions/org.example.policy",
            "/usr/share/polkit-1/rules.d/50-odd.rules",
            "/usr/share/dbus-1/system-services/org.example.service",
            "/usr/share/dbus-1/system.d/org.example.conf",
            "/etc/sudoers.d/odd",
            "/usr/share/selinux/packages/odd.pp.bz2",
            "/usr/lib/sysusers.d/odd.conf",
            "/usr/lib/tmpfiles.d/odd.conf",
            "/etc/cron.d/odd",
            "/etc/ld.so.conf.d/odd.conf",
        ] {
            assert!(!plain("odd", &[path]), "{path}");
        }
    }

    #[test]
    fn folders_alone_change_nothing() {
        let mut rpm = sample("odd", &["/usr/lib/systemd/system"]);
        rpm.files[0].mode = DIRECTORY | 0o755;
        assert!(package(&rpm));
    }

    #[test]
    fn special_rights_accounts_and_other_sources_are_not_plain() {
        let mut setuid = sample("odd", &["/usr/bin/odd"]);
        setuid.files[0].mode = REGULAR | 0o4755;
        let mut capable = sample("odd", &["/usr/bin/odd"]);
        capable.files[0].capabilities = true;
        let mut account = sample("odd", &["/usr/bin/odd"]);
        account.provides.push("user(odd)".to_owned());
        let mut elsewhere = sample("odd", &["/usr/bin/odd"]);
        elsewhere.origin = Origin::Repository("odd.repo".to_owned());
        for rpm in [setuid, capable, account, elsewhere] {
            assert!(!package(&rpm));
        }
    }

    fn built(packages: &[(&str, bool)]) -> Build {
        Build {
            packages: packages
                .iter()
                .map(|(name, plain)| Package {
                    name: (*name).to_owned(),
                    version: "1-1".to_owned(),
                    arch: "x86_64".to_owned(),
                    summary: String::new(),
                    requested: true,
                    units: Vec::new(),
                    apps: Vec::new(),
                    commands: Vec::new(),
                    origin: Origin::Fedora,
                    plain: *plain,
                })
                .collect(),
            ..Build::default()
        }
    }

    #[test]
    fn a_change_is_plain_when_what_comes_and_goes_is() {
        let current = built(&[("docker", false), ("htop", true)]);
        let docker = sample("docker", &["/usr/lib/systemd/system/docker.service"]);
        let gh = sample("gh", &["/usr/bin/gh"]);
        let htop = sample("htop", &["/usr/bin/htop"]);
        assert!(change(Some(&current), &[docker.clone(), gh, htop.clone()]));
        assert!(change(Some(&current), std::slice::from_ref(&docker)));
        assert!(!change(Some(&current), std::slice::from_ref(&htop)));
        assert!(!change(None, &[docker, htop]));
    }
}
