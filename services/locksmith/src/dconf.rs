use std::collections::BTreeMap;
use std::fmt::Write;

use luft_policy::ScreenLockPolicy;

const SCREENSAVER: &str = "org/gnome/desktop/screensaver";
const SESSION: &str = "org/gnome/desktop/session";

/// A desktop setting the policy decides, with its value as GVariant text.
#[derive(Debug, PartialEq, Eq)]
pub struct Locked {
    pub folder: &'static str,
    pub key: &'static str,
    pub value: String,
}

pub fn locked(screen_lock: &ScreenLockPolicy) -> Vec<Locked> {
    let enabled = screen_lock.enabled.map(|enabled| Locked {
        folder: SCREENSAVER,
        key: "lock-enabled",
        value: enabled.to_string(),
    });
    let lock_after = screen_lock.lock_after.map(|seconds| Locked {
        folder: SCREENSAVER,
        key: "lock-delay",
        value: format!("uint32 {seconds}"),
    });
    let screen_off = screen_lock.screen_off.map(|seconds| Locked {
        folder: SESSION,
        key: "idle-delay",
        value: format!("uint32 {seconds}"),
    });
    [enabled, lock_after, screen_off]
        .into_iter()
        .flatten()
        .collect()
}

/// The keyfile `dconf compile` reads the values from.
pub fn keyfile(locked: &[Locked]) -> String {
    let mut folders: BTreeMap<&str, Vec<&Locked>> = BTreeMap::new();
    for setting in locked {
        folders.entry(setting.folder).or_default().push(setting);
    }
    let mut text = String::new();
    for (folder, settings) in folders {
        let _ = writeln!(text, "[{folder}]");
        for setting in settings {
            let _ = writeln!(text, "{}={}", setting.key, setting.value);
        }
        text.push('\n');
    }
    text
}

/// The locks file, one key per line.
pub fn locks(locked: &[Locked]) -> String {
    locked
        .iter()
        .map(|setting| format!("/{}/{}\n", setting.folder, setting.key))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writes_only_what_the_policy_decides() {
        let locked = locked(&ScreenLockPolicy {
            enabled: Some(true),
            screen_off: Some(300),
            lock_after: None,
        });
        assert_eq!(
            keyfile(&locked),
            "[org/gnome/desktop/screensaver]\nlock-enabled=true\n\n[org/gnome/desktop/session]\nidle-delay=uint32 300\n\n"
        );
        assert_eq!(
            locks(&locked),
            "/org/gnome/desktop/screensaver/lock-enabled\n/org/gnome/desktop/session/idle-delay\n"
        );
    }
}
