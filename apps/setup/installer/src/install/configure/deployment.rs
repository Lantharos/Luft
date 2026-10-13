use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::system::command::Tool;

const STATEROOT: &str = "ostree/deploy/default";
const CONTEXTS: &str = "etc/selinux/targeted/contexts/files/file_contexts";

pub struct Deployment {
    pub root: PathBuf,
    pub state: PathBuf,
}

impl Deployment {
    pub fn find(target: &Path) -> Result<Self> {
        let stateroot = target.join(STATEROOT);
        let root = std::fs::read_dir(stateroot.join("deploy"))
            .context("The new system has no deployment")?
            .flatten()
            .map(|entry| entry.path())
            .find(|path| path.is_dir())
            .context("The new system has no deployment")?;
        Ok(Self {
            root,
            state: stateroot,
        })
    }

    pub fn etc(&self, path: &str) -> PathBuf {
        self.root.join("etc").join(path)
    }

    pub fn var(&self, path: &str) -> PathBuf {
        self.state.join("var").join(path)
    }

    pub fn relabel_etc(&self, paths: &[PathBuf]) -> Result<()> {
        relabel(&self.root, &self.root.join(CONTEXTS), paths)
    }

    pub fn relabel_var(&self, paths: &[PathBuf]) -> Result<()> {
        relabel(&self.state, &self.root.join(CONTEXTS), paths)
    }
}

fn relabel(root: &Path, contexts: &Path, paths: &[PathBuf]) -> Result<()> {
    if !contexts.exists() {
        return Ok(());
    }
    Tool::new("setfiles")
        .args(["-F", "-r"])
        .arg(root)
        .arg(contexts)
        .args(paths)
        .run()
}
