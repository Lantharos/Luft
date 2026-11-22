use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use super::super::DNF_CACHE;
use super::super::resolve::download;
use crate::command::run;
use crate::state::sources::Sources;
use crate::state::{self, deployment};

/// The folders of a mounted build root: the system it's for, what installing changes over it,
/// the two together, the extension being staged and the downloaded packages.
pub struct Folders {
    pub tree: PathBuf,
    pub upper: PathBuf,
    pub root: PathBuf,
    pub stage: PathBuf,
    pub store: PathBuf,
}

const WORK: &str = "/var/cache/luft/system-packages/build";

/// The folder a build is made in, with what it mounted there, which goes away with it.
pub struct Workspace {
    path: PathBuf,
    mounts: Vec<PathBuf>,
}

impl Workspace {
    pub fn new() -> Result<Self> {
        state::remove_folder(Path::new(WORK))?;
        fs::create_dir(WORK).context("Making a folder to build in")?;
        Ok(Self {
            path: PathBuf::from(WORK),
            mounts: Vec::new(),
        })
    }

    /// Mounts the system `digest` with `layers`, oldest first, and a writable layer over it,
    /// with dnf's cache and the added sources in it.
    pub fn mount(
        &mut self,
        digest: &str,
        layers: &[PathBuf],
        sources: &Sources,
    ) -> Result<Folders> {
        let (tree, upper, overlay, root) = (
            self.folder("tree")?,
            self.folder("upper")?,
            self.folder("overlay")?,
            self.folder("root")?,
        );
        let stage = self.folder("stage")?;
        deployment::mount(digest, &tree)?;
        self.mounted(&tree);
        let lower: Vec<String> = layers
            .iter()
            .rev()
            .chain([&tree])
            .map(|layer| layer.display().to_string())
            .collect();
        run(Command::new("mount")
            .args(["-t", "overlay", "overlay", "-o"])
            .arg(format!(
                "lowerdir={},upperdir={},workdir={}",
                lower.join(":"),
                upper.display(),
                overlay.display()
            ))
            .arg(&root))?;
        self.mounted(&root);
        let cache = root.join("var/cache/libdnf5");
        fs::create_dir_all(&cache)?;
        fs::create_dir_all(DNF_CACHE)?;
        run(Command::new("mount")
            .arg("--bind")
            .arg(DNF_CACHE)
            .arg(&cache))?;
        self.mounted(&cache);
        download::offer(&root, sources)?;
        Ok(Folders {
            tree,
            upper,
            root,
            stage,
            store: self.path.join("store"),
        })
    }

    fn folder(&self, name: &str) -> Result<PathBuf> {
        let path = self.path.join(name);
        fs::create_dir_all(&path)?;
        Ok(path)
    }

    fn mounted(&mut self, at: &Path) {
        self.mounts.push(at.to_path_buf());
    }

    fn release(&mut self) -> bool {
        while let Some(at) = self.mounts.last() {
            let unmounted = Command::new("umount")
                .arg(at)
                .status()
                .is_ok_and(|status| status.success());
            if !unmounted {
                return false;
            }
            self.mounts.pop();
        }
        true
    }

    /// Unmounts everything, so what was built can be moved out.
    pub fn unmount(&mut self) -> Result<()> {
        if !self.release() {
            bail!("The build's folders couldn't be unmounted.");
        }
        Ok(())
    }
}

impl Drop for Workspace {
    fn drop(&mut self) {
        if self.release() {
            let _ = fs::remove_dir_all(&self.path);
        }
    }
}
