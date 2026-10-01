use std::path::Path;

use anyhow::Result;

use crate::paths;
use crate::system::command::Tool;

const FILE: &str = "/etc/kernel/cmdline";

pub fn read() -> String {
    std::fs::read_to_string(FILE)
        .ok()
        .filter(|line| !line.trim().is_empty())
        .unwrap_or_else(|| {
            std::fs::read_to_string("/proc/cmdline")
                .unwrap_or_default()
                .split_whitespace()
                .filter(|word| !word.starts_with("BOOT_IMAGE=") && !word.starts_with("initrd="))
                .collect::<Vec<_>>()
                .join(" ")
        })
        .trim()
        .to_owned()
}

fn key(argument: &str) -> &str {
    argument.split_once('=').map_or(argument, |(key, _)| key)
}

pub fn with(line: &str, add: &[String], remove: &[&str]) -> String {
    let mut words: Vec<String> = line
        .split_whitespace()
        .filter(|word| !remove.contains(&key(word)))
        .filter(|word| !add.iter().any(|added| added == word))
        .map(str::to_owned)
        .collect();
    words.extend(add.iter().cloned());
    words.join(" ")
}

pub fn change(add: &[String], remove: &[&str]) -> Result<()> {
    let updated = with(&read(), add, remove);
    paths::write_private(Path::new(FILE), format!("{updated}\n").as_bytes())?;
    std::fs::set_permissions(FILE, std::os::unix::fs::PermissionsExt::from_mode(0o644))?;
    if Path::new("/usr/sbin/grubby").exists() || Path::new("/usr/bin/grubby").exists() {
        let removals: Vec<&str> = remove
            .iter()
            .copied()
            .filter(|key| !add.iter().any(|added| self::key(added) == *key))
            .collect();
        let mut grubby = Tool::new("grubby").arg("--update-kernel=ALL");
        if !add.is_empty() {
            grubby = grubby.arg(format!("--args={}", add.join(" ")));
        }
        if !removals.is_empty() {
            grubby = grubby.arg(format!("--remove-args={}", removals.join(" ")));
        }
        grubby.status()?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::with;

    #[test]
    fn replaces_arguments_by_key() {
        let line = "root=UUID=1 ro rd.luks.uuid=luks-old rhgb quiet";
        assert_eq!(
            with(
                line,
                &["rd.luks.uuid=luks-new".to_owned()],
                &["rd.luks.uuid", "rd.luks.options"]
            ),
            "root=UUID=1 ro rhgb quiet rd.luks.uuid=luks-new"
        );
    }
}
