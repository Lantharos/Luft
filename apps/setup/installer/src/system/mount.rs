use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::command::Tool;

pub struct Mounted {
    at: PathBuf,
}

impl Mounted {
    pub fn new(device: &str, options: &str, at: &Path) -> Result<Self> {
        std::fs::create_dir_all(at)?;
        let mut mount = Tool::new("mount");
        if !options.is_empty() {
            mount = mount.args(["-o", options]);
        }
        mount
            .arg(device)
            .arg(at)
            .run()
            .with_context(|| format!("{device} couldn't be opened"))?;
        Ok(Self { at: at.to_owned() })
    }

    pub fn path(&self) -> &Path {
        &self.at
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg(&self.at).run() {
            eprintln!("{} couldn't be closed: {error:#}", self.at.display());
        }
    }
}

pub fn looking_into(fs_type: &str) -> &'static str {
    match fs_type {
        "btrfs" => "ro,subvolid=5",
        "ext4" => "ro,noload",
        "xfs" => "ro,norecovery",
        _ => "ro",
    }
}

pub fn top_level(fs_type: &str) -> &'static str {
    if fs_type == "btrfs" { "subvolid=5" } else { "" }
}
