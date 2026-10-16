use std::path::{Component, Path, PathBuf};

use luft_meet::Layout;

use super::disks::{self, Block, Mount};
use crate::check::linux::{Place, Readable};

const HOME_FOLDER: &str = "/home/.luft-meet";
const SYSTEM_FOLDER: &str = "/var/lib/luft-meet/live";
const READABLE: [&str; 3] = ["ext4", "btrfs", "xfs"];

pub struct Spot {
    pub folder: PathBuf,
    pub mount: Mount,
    pub on_filesystem: String,
    pub readable: Readable,
}

fn readable(blocks: &[Block], mount: &Mount) -> Readable {
    let lineage = disks::lineage(blocks, &mount.source).unwrap_or_default();
    if lineage.iter().any(|block| block.kind == "crypt") {
        Readable::Encrypted
    } else if lineage
        .iter()
        .any(|block| block.kind == "lvm" || block.kind.starts_with("raid"))
    {
        Readable::Combined
    } else if !READABLE.contains(&mount.fstype.as_str()) {
        Readable::Filesystem
    } else {
        Readable::Yes
    }
}

fn on_filesystem(mount: &Mount, folder: &Path) -> Option<String> {
    let inside = folder.strip_prefix(&mount.target).ok()?;
    let path = Path::new(&mount.fsroot).join(inside);
    let plain = path
        .components()
        .all(|part| matches!(part, Component::RootDir | Component::Normal(_)));
    let text = path.to_str()?.to_owned();
    (plain && !text.contains(char::is_whitespace)).then_some(text)
}

fn spot(blocks: &[Block], folder: &Path) -> Result<Spot, String> {
    let mount = disks::mount_of(folder.parent().unwrap_or(Path::new("/")))?;
    let on_filesystem = on_filesystem(&mount, folder)
        .ok_or_else(|| format!("{} can't be started from", folder.display()))?;
    Ok(Spot {
        folder: folder.to_owned(),
        readable: readable(blocks, &mount),
        on_filesystem,
        mount,
    })
}

pub fn choose(blocks: &[Block], made: Option<&Path>) -> Result<Spot, String> {
    if let Some(folder) = made {
        return spot(blocks, folder);
    }
    let home = spot(blocks, Path::new(HOME_FOLDER))?;
    if home.readable == Readable::Yes {
        return Ok(home);
    }
    match spot(blocks, Path::new(SYSTEM_FOLDER)) {
        Ok(system) if system.readable == Readable::Yes => Ok(system),
        _ => Ok(home),
    }
}

impl Spot {
    pub fn describe(&self) -> Place {
        let parent = self.folder.parent().unwrap_or(Path::new("/"));
        Place {
            filesystem: self.mount.fstype.clone(),
            readable: self.readable,
            free: disks::free_space(parent).unwrap_or(0) + disks::used_by(&self.folder),
        }
    }

    pub fn uuid(&self) -> Result<&str, String> {
        self.mount
            .uuid
            .as_deref()
            .filter(|uuid| !uuid.is_empty())
            .ok_or_else(|| "The drive Luft is kept on has no UUID".to_owned())
    }
}

pub fn layout(blocks: &[Block]) -> Layout {
    let (Ok(root), Ok(home)) = (
        disks::mount_of(Path::new("/")),
        disks::mount_of(Path::new("/home")),
    ) else {
        return Layout::Unknown;
    };
    match (readable(blocks, &root), readable(blocks, &home)) {
        (Readable::Encrypted, _) | (_, Readable::Encrypted) => return Layout::Encrypted,
        (Readable::Yes, Readable::Yes) => {}
        _ => return Layout::Unknown,
    }
    if root.source != home.source {
        Layout::SeparateHome
    } else if root.fstype == "btrfs" && home.target != root.target && root.fsroot != "/" {
        Layout::Subvolumes
    } else if home.target == root.target {
        Layout::Single
    } else {
        Layout::Unknown
    }
}
