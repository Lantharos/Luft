use std::path::{Path, PathBuf};

use anyhow::Result;

use super::account;
use crate::system::command::Tool;

pub const NAME: &str = "luft-setup";
pub const HOME: &str = "lib/luft-setup";
pub const FILES: [&str; 4] = ["passwd", "shadow", "group", "gshadow"];

pub fn create(root: &Path) -> Result<()> {
    Tool::new("useradd")
        .arg("--prefix")
        .arg(root)
        .args(["--system", "--no-create-home", "--shell", "/bin/bash"])
        .args(["--home-dir", &format!("/var/{HOME}")])
        .args(["--comment", "Luft setup", NAME])
        .run()
}

pub fn make_home(root: &Path, var: &Path) -> Result<PathBuf> {
    let home = var.join(HOME);
    std::fs::create_dir_all(&home)?;
    Tool::new("chown")
        .arg(account::ids(&root.join("etc"), NAME)?)
        .arg(&home)
        .run()?;
    Tool::new("chmod").arg("0700").arg(&home).run()?;
    Ok(home)
}

pub fn remove() -> Result<()> {
    Tool::new("userdel")
        .args(["--force", "--remove", NAME])
        .run()
}
