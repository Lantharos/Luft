use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

use crate::locations::drives::MountEntry;

#[derive(Debug, Default, PartialEq)]
pub(super) struct Scope {
    pub roots: Vec<PathBuf>,
    pub skipped: HashSet<PathBuf>,
}

struct Region {
    device: (u32, u32),
    path: PathBuf,
}

impl Region {
    fn covers(&self, other: &Region) -> bool {
        self.device == other.device && other.path.starts_with(&self.path)
    }
}

#[derive(PartialEq)]
enum Kind {
    Selected,
    Storage,
    Foreign,
}

struct Node {
    path: PathBuf,
    kind: Kind,
    region: Option<Region>,
}

pub(super) fn resolve(path: &str) -> PathBuf {
    let path = Path::new(path);
    match (path.parent(), path.file_name()) {
        (Some(parent), Some(name)) => {
            fs::canonicalize(parent).map_or_else(|_| path.to_path_buf(), |parent| parent.join(name))
        }
        _ => path.to_path_buf(),
    }
}

pub(super) fn plan(paths: Vec<PathBuf>, mounts: &[MountEntry]) -> Scope {
    let visible = visible(mounts);
    let mut nodes: Vec<Node> = paths
        .into_iter()
        .filter_map(|path| selected(path, &visible))
        .collect();
    let selected_count = nodes.len();
    let mut nested: Vec<&MountEntry> = visible
        .into_iter()
        .filter(|mount| {
            nodes.iter().any(|node| {
                mount.mount_point != node.path && mount.mount_point.starts_with(&node.path)
            })
        })
        .collect();
    nested.sort_by(|a, b| a.mount_point.cmp(&b.mount_point));
    nodes.extend(nested.into_iter().map(|mount| Node {
        path: mount.mount_point.clone(),
        kind: if mount.is_local_storage() {
            Kind::Storage
        } else {
            Kind::Foreign
        },
        region: Some(Region {
            device: mount.device,
            path: mount.root.clone(),
        }),
    }));

    let walked: Vec<bool> = (0..nodes.len())
        .map(|index| nodes[index].kind != Kind::Foreign && !is_redundant(&nodes, index))
        .collect();
    let mut scope = Scope::default();
    for (index, node) in nodes.iter().enumerate() {
        let reached = index >= selected_count
            && enclosing(&nodes, index).is_some_and(|parent| walked[parent]);
        match (walked[index], reached) {
            (true, false) => scope.roots.push(node.path.clone()),
            (false, true) => {
                scope.skipped.insert(node.path.clone());
            }
            _ => {}
        }
    }
    scope
}

fn visible(mounts: &[MountEntry]) -> Vec<&MountEntry> {
    let mut by_point: HashMap<&Path, &MountEntry> = HashMap::new();
    for mount in mounts {
        by_point.insert(&mount.mount_point, mount);
    }
    by_point.into_values().collect()
}

fn selected(path: PathBuf, visible: &[&MountEntry]) -> Option<Node> {
    let owner = visible
        .iter()
        .filter(|mount| path.starts_with(&mount.mount_point))
        .max_by_key(|mount| mount.mount_point.as_os_str().len());
    if owner.is_some_and(|mount| mount.is_virtual()) {
        return None;
    }
    let region = owner.and_then(|mount| {
        let inner = path.strip_prefix(&mount.mount_point).ok()?;
        Some(Region {
            device: mount.device,
            path: mount.root.join(inner),
        })
    });
    Some(Node {
        path,
        kind: Kind::Selected,
        region,
    })
}

fn is_redundant(nodes: &[Node], index: usize) -> bool {
    let Some(region) = &nodes[index].region else {
        return false;
    };
    nodes.iter().enumerate().any(|(other_index, other)| {
        other_index != index
            && other.kind != Kind::Foreign
            && other.region.as_ref().is_some_and(|other| {
                other.covers(region) && (!region.covers(other) || other_index < index)
            })
    })
}

fn enclosing(nodes: &[Node], index: usize) -> Option<usize> {
    let path = &nodes[index].path;
    nodes[..index]
        .iter()
        .enumerate()
        .filter(|(_, node)| path.starts_with(&node.path))
        .max_by_key(|(_, node)| node.path.as_os_str().len())
        .map(|(enclosing, _)| enclosing)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::locations::drives::parse_mountinfo;

    const LAPTOP: &str = include_str!("fixtures/laptop.mountinfo");

    fn plan_for(paths: &[&str]) -> Scope {
        plan(
            paths.iter().map(PathBuf::from).collect(),
            &parse_mountinfo(LAPTOP),
        )
    }

    fn paths(paths: &[&str]) -> Vec<PathBuf> {
        paths.iter().map(PathBuf::from).collect()
    }

    #[test]
    fn home_leaves_out_cloud_mounts() {
        let scope = plan_for(&["/var/home/mara"]);
        assert_eq!(scope.roots, paths(&["/var/home/mara"]));
        assert_eq!(
            scope.skipped,
            HashSet::from([PathBuf::from("/var/home/mara/Cloud/iCloud Drive")])
        );
    }

    #[test]
    fn root_counts_the_disk_once_and_skips_kernel_filesystems() {
        let scope = plan_for(&["/"]);
        assert_eq!(scope.roots, paths(&["/"]));
        for skipped in ["/proc", "/sys", "/dev", "/run", "/tmp", "/etc", "/var"] {
            assert!(scope.skipped.contains(Path::new(skipped)), "{skipped}");
        }
        assert!(!scope.skipped.contains(Path::new("/sysroot")));
    }

    #[test]
    fn kernel_filesystems_are_not_walked_when_selected() {
        assert_eq!(plan_for(&["/proc", "/sys/fs"]), Scope::default());
    }

    #[test]
    fn bind_mounted_folders_count_once() {
        let scope = plan_for(&["/sysroot", "/var"]);
        assert_eq!(scope.roots, paths(&["/sysroot"]));
    }

    #[test]
    fn storage_below_a_skipped_bind_mount_is_still_counted() {
        let mut mounts = parse_mountinfo(LAPTOP);
        mounts.extend(parse_mountinfo(
            "90 72 8:17 / /var/mnt/backup rw,relatime shared:90 - ext4 /dev/sdb1 rw",
        ));
        let scope = plan(paths(&["/sysroot", "/var"]), &mounts);
        assert_eq!(scope.roots, paths(&["/sysroot", "/var/mnt/backup"]));
    }
}
