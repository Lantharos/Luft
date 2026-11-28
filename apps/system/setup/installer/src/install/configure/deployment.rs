use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;

use crate::L10N;
use crate::system::command::Tool;

const DEPLOYMENTS: &str = "state/deploy";
const SHARED_VAR: &str = "state/os/default/var";
const REPOSITORY: &str = "composefs";
const CONTEXTS: &str = "etc/selinux/targeted/contexts/files/file_contexts";

pub struct Deployment {
    pub root: PathBuf,
    mounted: bool,
}

fn bind(source: &Path, target: &Path) -> Result<()> {
    Tool::new("mount")
        .arg("--bind")
        .arg(source)
        .arg(target)
        .run()
}

pub fn installed(target: &Path) -> Result<Vec<PathBuf>> {
    Ok(std::fs::read_dir(target.join(DEPLOYMENTS))
        .with_context(|| t!(L10N, "installer-no-deployment"))?
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.is_dir())
        .collect())
}

pub fn relabel_in(root: &Path, contexts: &Path, flags: &[&str], paths: &[PathBuf]) -> Result<()> {
    if paths.is_empty() || !contexts.exists() {
        return Ok(());
    }
    Tool::new("setfiles")
        .args(flags)
        .arg("-r")
        .arg(root)
        .arg(contexts)
        .args(paths)
        .run()
}

impl Deployment {
    pub fn running() -> Self {
        Self {
            root: PathBuf::from("/"),
            mounted: false,
        }
    }

    pub fn image(target: &Path, state: &Path, at: &Path) -> Result<Self> {
        let id = state
            .file_name()
            .with_context(|| t!(L10N, "installer-deployment-unnamed"))?;
        std::fs::create_dir_all(at)?;
        Tool::new("bootc")
            .args(["internals", "cfs", "--repo"])
            .arg(target.join(REPOSITORY))
            .args(["mount", "--fuse=no"])
            .arg(id)
            .arg(at)
            .run()
            .with_context(|| t!(L10N, "installer-deployment-unopened"))?;
        Ok(Self {
            root: at.to_owned(),
            mounted: true,
        })
    }

    pub fn mount(target: &Path, at: &Path) -> Result<Self> {
        let state = installed(target)?
            .into_iter()
            .next()
            .with_context(|| t!(L10N, "installer-no-deployment"))?;
        let deployment = Self::image(target, &state, at)?;
        bind(&state.join("etc"), &at.join("etc"))?;
        bind(&target.join(SHARED_VAR), &at.join("var"))?;
        Ok(deployment)
    }

    pub fn etc(&self, path: &str) -> PathBuf {
        self.root.join("etc").join(path)
    }

    pub fn var(&self, path: &str) -> PathBuf {
        self.root.join("var").join(path)
    }

    pub fn relabel(&self, paths: &[PathBuf]) -> Result<()> {
        self.set_contexts(&["-F"], paths)
    }

    pub fn relabel_kept(&self, paths: &[PathBuf]) -> Result<()> {
        self.set_contexts(&[], paths)
    }

    pub fn contexts(&self) -> PathBuf {
        self.root.join(CONTEXTS)
    }

    fn set_contexts(&self, flags: &[&str], paths: &[PathBuf]) -> Result<()> {
        relabel_in(&self.root, &self.contexts(), flags, paths)
    }
}

impl Drop for Deployment {
    fn drop(&mut self) {
        if !self.mounted {
            return;
        }
        if let Err(error) = Tool::new("umount").arg("--recursive").arg(&self.root).run() {
            eprintln!("The new system's deployment couldn't be unmounted: {error:#}");
        }
    }
}
