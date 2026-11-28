use std::io::ErrorKind;
use std::path::Path;

use anyhow::Result;

use super::STAGED;
use crate::system::host::command::Tool;

const DEPLOYMENTS: &str = "state/deploy";
const VAR: &str = "state/os/default/var";

fn remove(folder: &Path) -> Result<()> {
    match std::fs::remove_dir_all(folder) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}

fn delete_subvolumes(top: &Path, under: &str) -> Result<()> {
    let listed = Tool::new("btrfs")
        .args(["subvolume", "list"])
        .arg(top)
        .output()?;
    let mut inside: Vec<&str> = listed
        .lines()
        .filter_map(|line| line.split_once(" path ").map(|(_, path)| path))
        .filter(|path| path.starts_with(&format!("{under}/")))
        .collect();
    inside.sort_by_key(|path| std::cmp::Reverse(path.len()));
    for path in inside {
        Tool::new("btrfs")
            .args(["subvolume", "delete"])
            .arg(top.join(path))
            .unhurried()
            .status()?;
    }
    Ok(())
}

fn replace_etc(top: &Path, staged: &Path) -> Result<()> {
    for entry in std::fs::read_dir(staged).into_iter().flatten().flatten() {
        let (fresh, deployment) = (
            entry.path().join("etc"),
            top.join(DEPLOYMENTS).join(entry.file_name()),
        );
        if fresh.is_dir() && deployment.is_dir() {
            remove(&deployment.join("etc"))?;
            std::fs::rename(fresh, deployment.join("etc"))?;
        }
    }
    Ok(())
}

pub fn replace(top: &Path) -> Result<()> {
    let staged = top.join(STAGED);
    replace_etc(top, &staged)?;
    if staged.join("var").is_dir() {
        delete_subvolumes(top, VAR)?;
        remove(&top.join(VAR))?;
        std::fs::rename(staged.join("var"), top.join(VAR))?;
    }
    Ok(())
}
