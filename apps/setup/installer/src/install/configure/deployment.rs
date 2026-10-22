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
}

fn bind(source: &Path, target: &Path) -> Result<()> {
    Tool::new("mount")
        .arg("--bind")
        .arg(source)
        .arg(target)
        .run()
}

impl Deployment {
    pub fn mount(target: &Path, at: &Path) -> Result<Self> {
        let state = std::fs::read_dir(target.join(DEPLOYMENTS))
            .with_context(|| t!(L10N, "installer-no-deployment"))?
            .flatten()
            .map(|entry| entry.path())
            .find(|path| path.is_dir())
            .with_context(|| t!(L10N, "installer-no-deployment"))?;
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
        let deployment = Self {
            root: at.to_owned(),
        };
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

    fn set_contexts(&self, flags: &[&str], paths: &[PathBuf]) -> Result<()> {
        let contexts = self.root.join(CONTEXTS);
        if paths.is_empty() || !contexts.exists() {
            return Ok(());
        }
        Tool::new("setfiles")
            .args(flags)
            .arg("-r")
            .arg(&self.root)
            .arg(contexts)
            .args(paths)
            .run()
    }
}

impl Drop for Deployment {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg("--recursive").arg(&self.root).run() {
            eprintln!("The new system's deployment couldn't be unmounted: {error:#}");
        }
    }
}
