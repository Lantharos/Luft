mod accounts;
pub mod fstab;
pub mod old;
mod packages;
mod release;
mod volumes;

use std::path::{Path, PathBuf};

use luft_disks::udisks::snapshot;
use luft_installer_contract::{LinuxSystem, Owner, StartupPartition, SystemBlock};
use luft_meet::Layout;

pub use accounts::Account;
use fstab::Entry;
use old::OldSystem;
pub use release::Family;
pub use volumes::Part;

use crate::system::mount::{self, Mounted};

const READABLE: [&str; 3] = ["btrfs", "ext4", "xfs"];
const SMALLEST_SHARED_ESP: u64 = 1 << 30;
const SMALLEST_STARTUP: u64 = 1 << 30;
const LIVE_HOST: &str = "/run/luft/host";
const LIVE_MEDIUM: [&str; 2] = ["/run/initramfs", LIVE_HOST];
const NOT_A_DRIVE: [&str; 7] = ["swap", "tmpfs", "proc", "sysfs", "devpts", "none", "auto"];
const SYSTEM_MOUNTS: [&str; 5] = ["/", "/home", "/boot", "/boot/efi", "/efi"];

#[derive(Clone)]
pub struct Home {
    pub part: Part,
    pub subvolume: Option<String>,
    pub entry: Entry,
}

#[derive(Clone)]
pub struct Plan {
    pub root: Part,
    pub subvolume: Option<String>,
    pub home: Home,
    pub esp: Part,
    pub boot: Option<Part>,
    pub drives: Vec<Entry>,
}

struct Found<'a> {
    drive: &'a snapshot::Drive,
    root: &'a Part,
    subvolume: Option<String>,
    old: OldSystem,
}

fn home(found: &Found, parts: &[Part]) -> Result<(Layout, Option<Home>), Layout> {
    let Some(entry) = found.old.mount("/home") else {
        return Ok((Layout::Single, None));
    };
    let Some(part) = volumes::resolve(parts, &entry.spec) else {
        return Err(if entry.spec.starts_with("/dev/mapper/") {
            Layout::Encrypted
        } else {
            Layout::Unknown
        });
    };
    let home = Home {
        part: part.clone(),
        subvolume: entry.subvolume(),
        entry: entry.clone(),
    };
    if part.block != found.root.block {
        return Ok((Layout::SeparateHome, Some(home)));
    }
    match (&found.subvolume, &home.subvolume) {
        (Some(root), Some(kept)) if root != kept => Ok((Layout::Subvolumes, Some(home))),
        _ => Ok((Layout::Single, None)),
    }
}

fn startup(found: &Found, parts: &[Part]) -> Option<(Part, Option<Part>)> {
    let on_drive: Vec<&Part> = parts
        .iter()
        .filter(|part| part.drive == found.drive.block)
        .collect();
    let esp = on_drive.iter().find(|part| part.esp)?;
    if esp.size >= SMALLEST_SHARED_ESP {
        return Some(((*esp).clone(), None));
    }
    let boot = found
        .old
        .mount("/boot")
        .and_then(|entry| volumes::resolve(parts, &entry.spec))
        .or_else(|| on_drive.iter().copied().find(|part| part.xbootldr))
        .filter(|boot| {
            boot.drive == found.drive.block
                && boot.block != found.root.block
                && boot.size >= SMALLEST_STARTUP
        })?;
    Some(((*esp).clone(), Some(boot.clone())))
}

fn other_drives(old: &OldSystem, parts: &[Part], kept: &[&Part]) -> Vec<Entry> {
    old.fstab
        .iter()
        .filter(|entry| {
            !SYSTEM_MOUNTS.contains(&entry.file.as_str())
                && entry.file.starts_with('/')
                && !NOT_A_DRIVE.contains(&entry.vfs_type.as_str())
                && !entry.options.split(',').any(|option| option == "bind")
        })
        .filter(|entry| {
            volumes::resolve(parts, &entry.spec)
                .is_some_and(|part| kept.iter().all(|kept| kept.block != part.block))
        })
        .cloned()
        .collect()
}

fn running_from(part: &Part) -> bool {
    part.mount_points
        .iter()
        .any(|point| LIVE_MEDIUM.iter().any(|medium| point.starts_with(medium)))
}

fn describe(found: Found, parts: &[Part]) -> (LinuxSystem, Option<Plan>) {
    let old = &found.old;
    let (layout, home) = match home(&found, parts) {
        Ok(found) => found,
        Err(layout) => (layout, None),
    };
    let startup = startup(&found, parts);
    let mut kept = vec![found.root];
    kept.extend(home.as_ref().map(|home| &home.part));
    let drives = other_drives(old, parts, &kept);
    let owner = old.owner().map(|account| Owner {
        name: account.name.clone(),
        full_name: account.full_name.clone(),
        password: account.hash.is_some(),
    });
    let blocked = if !layout.replaceable() {
        Some(SystemBlock::Layout)
    } else if found.drive.read_only {
        Some(SystemBlock::ReadOnly)
    } else if startup.is_none() {
        Some(SystemBlock::Startup)
    } else if owner.is_none() {
        Some(SystemBlock::NoAccount)
    } else if layout == Layout::SeparateHome && running_from(found.root) {
        Some(SystemBlock::Running)
    } else {
        None
    };
    let plan = match (blocked, home, startup) {
        (None, Some(home), Some((esp, boot))) => Some(Plan {
            root: found.root.clone(),
            subvolume: found.subvolume.clone(),
            home,
            esp,
            boot,
            drives: drives.clone(),
        }),
        _ => None,
    };
    let system = LinuxSystem {
        id: format!(
            "{}:{}",
            found.root.block,
            found.subvolume.as_deref().unwrap_or_default()
        ),
        name: old.release.name.clone(),
        drive: found.drive.block.clone(),
        layout,
        blocked,
        accounts: old.accounts.len(),
        owner,
        hostname: old.hostname.clone(),
        networks: old.networks.len(),
        drives: drives.iter().map(|entry| entry.file.clone()).collect(),
        packages: old.packages.len(),
        keeps_old: layout == Layout::Subvolumes,
        startup: plan.as_ref().map(|plan| {
            if plan.boot.is_some() {
                StartupPartition::Boot
            } else {
                StartupPartition::Esp
            }
        }),
    };
    (system, plan)
}

fn roots_in(top: &Path, fs_type: &str) -> Vec<Option<String>> {
    let mut roots = Vec::new();
    if old::looks_installed(top) {
        roots.push(None);
    }
    if fs_type == "btrfs"
        && let Ok(entries) = std::fs::read_dir(top)
    {
        roots.extend(
            entries
                .flatten()
                .filter(|entry| old::looks_installed(&entry.path()))
                .filter_map(|entry| entry.file_name().to_str().map(|name| Some(name.to_owned()))),
        );
    }
    roots
}

enum Looking {
    Mounted(Mounted),
    Live(PathBuf),
}

impl Looking {
    fn open(root: &Part, scratch: &Path) -> anyhow::Result<Self> {
        if let Some(point) = root.mount_points.iter().find(|point| *point == LIVE_HOST) {
            return Ok(Self::Live(PathBuf::from(point)));
        }
        Mounted::new(&root.device, mount::looking_into(&root.fs_type), scratch).map(Self::Mounted)
    }

    fn path(&self) -> &Path {
        match self {
            Self::Mounted(mounted) => mounted.path(),
            Self::Live(path) => path,
        }
    }
}

fn systems_on(
    drive: &snapshot::Drive,
    root: &Part,
    parts: &[Part],
    scratch: &Path,
) -> Vec<(LinuxSystem, Option<Plan>)> {
    let opened = match Looking::open(root, scratch) {
        Ok(opened) => opened,
        Err(error) => {
            eprintln!("{} couldn't be looked into: {error:#}", root.device);
            return Vec::new();
        }
    };
    roots_in(opened.path(), &root.fs_type)
        .into_iter()
        .map(|subvolume| {
            let path = subvolume
                .as_deref()
                .map_or_else(|| opened.path().to_owned(), |name| opened.path().join(name));
            (subvolume, old::read(&path))
        })
        .filter(|(subvolume, old)| {
            old.mount("/").is_some_and(|entry| {
                volumes::resolve(parts, &entry.spec).is_some_and(|part| part.block == root.block)
                    && entry.subvolume() == *subvolume
            })
        })
        .map(|(subvolume, old)| {
            describe(
                Found {
                    drive,
                    root,
                    subvolume,
                    old,
                },
                parts,
            )
        })
        .collect()
}

pub fn find(drives: &[snapshot::Drive], scratch: &Path) -> Vec<(LinuxSystem, Option<Plan>)> {
    let parts = volumes::parts(drives);
    drives
        .iter()
        .flat_map(|drive| {
            parts
                .iter()
                .filter(|part| {
                    part.drive == drive.block && READABLE.contains(&part.fs_type.as_str())
                })
                .flat_map(|part| systems_on(drive, part, &parts, scratch))
                .collect::<Vec<_>>()
        })
        .collect()
}
