use std::os::fd::{AsFd, OwnedFd};
use std::path::{Component, Path};

use rustix::fs::{Mode, OFlags, ResolveFlags, mkdirat, openat2};
use rustix::io::Errno;

const FOLDER_MODE: u32 = 0o755;

fn resolve() -> ResolveFlags {
    ResolveFlags::BENEATH
        | ResolveFlags::NO_SYMLINKS
        | ResolveFlags::NO_MAGICLINKS
        | ResolveFlags::NO_XDEV
}

fn open(at: impl AsFd, name: &Path, flags: OFlags) -> Result<OwnedFd, Errno> {
    openat2(
        at,
        name,
        flags | OFlags::DIRECTORY | OFlags::CLOEXEC | OFlags::NOFOLLOW,
        Mode::empty(),
        resolve(),
    )
}

/// Makes an empty folder at `point` in the sandbox whose root is `root` and
/// returns it opened, when nothing is there yet. It never follows a link or
/// leaves the root's own filesystem on the way, so whatever the app made
/// there, or a folder it was given, can't send it anywhere else, and a place
/// the sandbox shows from outside, such as `/run/media` given to the app,
/// is left alone.
pub fn stand_in(root: &OwnedFd, point: &Path) -> Option<OwnedFd> {
    let parts: Vec<&Path> = point
        .components()
        .filter_map(|part| match part {
            Component::Normal(name) => Some(Path::new(name)),
            _ => None,
        })
        .collect();
    if parts.is_empty()
        || point
            .components()
            .any(|part| matches!(part, Component::ParentDir))
    {
        return None;
    }
    let mut at = open(root, Path::new("."), OFlags::PATH).ok()?;
    for (index, part) in parts.iter().enumerate() {
        let last = index + 1 == parts.len();
        let flags = if last { OFlags::RDONLY } else { OFlags::PATH };
        at = match open(&at, part, OFlags::PATH) {
            Ok(_) if last => return None,
            Ok(next) => next,
            Err(Errno::NOENT) => {
                mkdirat(&at, *part, Mode::from_raw_mode(FOLDER_MODE)).ok()?;
                open(&at, part, flags).ok()?
            }
            Err(_) => return None,
        };
    }
    Some(at)
}

#[cfg(test)]
mod tests {
    use std::os::fd::OwnedFd;
    use std::os::unix::fs::symlink;
    use std::path::Path;

    use rustix::fs::{Mode, OFlags};

    use super::stand_in;

    fn root(path: &Path) -> OwnedFd {
        rustix::fs::open(path, OFlags::PATH | OFlags::DIRECTORY, Mode::empty()).unwrap()
    }

    #[test]
    fn a_stand_in_is_made_inside_the_sandbox_only() {
        let sandbox = tempfile::tempdir().unwrap();
        let outside = tempfile::tempdir().unwrap();
        assert!(stand_in(&root(sandbox.path()), Path::new("/run/media/ada/Games")).is_some());
        assert!(sandbox.path().join("run/media/ada/Games").is_dir());

        std::fs::create_dir_all(sandbox.path().join("var")).unwrap();
        symlink(outside.path(), sandbox.path().join("var/mnt")).unwrap();
        assert!(stand_in(&root(sandbox.path()), Path::new("/var/mnt/backup")).is_none());
        assert!(!outside.path().join("backup").exists());

        assert!(stand_in(&root(sandbox.path()), Path::new("/run/media/ada/Games")).is_none());
        assert!(stand_in(&root(sandbox.path()), Path::new("/run/../../escape")).is_none());
    }
}
