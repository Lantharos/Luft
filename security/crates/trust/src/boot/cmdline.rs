use std::path::Path;

use anyhow::Result;

use crate::paths;

const FILE: &str = "/etc/kernel/cmdline";
const RESCUE_DROPS: [&str; 6] = [
    "quiet",
    "rhgb",
    "loglevel",
    "systemd.show_status",
    "sushi",
    "systemd.unit",
];
const RESCUE: &str = "systemd.unit=rescue.target";
const SHELL_WITHOUT_PASSWORD: &str = "systemd.setenv=SYSTEMD_SULOGIN_FORCE=1";

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

pub fn with<S: AsRef<str>>(line: &str, add: &[String], remove: &[S]) -> String {
    let mut words: Vec<String> = line
        .split_whitespace()
        .filter(|word| !remove.iter().any(|removed| removed.as_ref() == key(word)))
        .filter(|word| !add.iter().any(|added| added == word))
        .map(str::to_owned)
        .collect();
    words.extend(add.iter().cloned());
    words.join(" ")
}

pub fn rescue(line: &str, encrypted: bool) -> String {
    let mut add = vec![RESCUE.to_owned()];
    if encrypted {
        add.push(SHELL_WITHOUT_PASSWORD.to_owned());
    }
    with(line, &add, &RESCUE_DROPS)
}

pub fn write(line: &str) -> Result<()> {
    paths::write_private(Path::new(FILE), format!("{line}\n").as_bytes())?;
    std::fs::set_permissions(FILE, std::os::unix::fs::PermissionsExt::from_mode(0o644))?;
    Ok(())
}

pub fn change(add: &[String], remove: &[&str]) -> Result<()> {
    write(&with(&read(), add, remove))
}

#[cfg(test)]
mod tests {
    use super::{rescue, with};

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

    #[test]
    fn rescue_starts_the_rescue_target_with_messages() {
        let line = "root=UUID=1 ro rd.luks.uuid=luks-1 sushi quiet loglevel=3";
        assert_eq!(
            rescue(line, true),
            "root=UUID=1 ro rd.luks.uuid=luks-1 systemd.unit=rescue.target systemd.setenv=SYSTEMD_SULOGIN_FORCE=1"
        );
        assert_eq!(
            rescue(line, false),
            "root=UUID=1 ro rd.luks.uuid=luks-1 systemd.unit=rescue.target"
        );
    }
}
