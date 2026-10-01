use anyhow::Result;

use crate::system::command::Tool;

use super::esp::Esp;

const LABEL: &str = "Luft";
const MENU_ARGUMENT: &str = "\\EFI\\sushi\\SushiBoot.efi ";

pub fn luft() -> Option<String> {
    let entries = Tool::new("efibootmgr").output().ok()?;
    entries.lines().find_map(|line| {
        let (number, rest) = line.strip_prefix("Boot")?.split_once(' ')?;
        let label = rest.trim_start_matches('*').trim_start();
        let number = number.trim_end_matches('*');
        (label.split('\t').next()? == LABEL && number.len() == 4).then(|| number.to_owned())
    })
}

pub fn remove() -> Result<()> {
    if let Some(number) = luft() {
        Tool::new("efibootmgr")
            .args(["--bootnum", &number, "--delete-bootnum"])
            .status()?;
    }
    Ok(())
}

pub fn create(esp: &Esp, shim: &str) -> Result<()> {
    remove()?;
    Tool::new("efibootmgr")
        .arg("--create")
        .arg("--disk")
        .arg(format!("/dev/{}", esp.disk))
        .arg("--part")
        .arg(esp.partition.to_string())
        .args([
            "--label",
            LABEL,
            "--loader",
            shim,
            "--unicode",
            MENU_ARGUMENT,
        ])
        .status()
}
