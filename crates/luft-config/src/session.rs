use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct SessionConfig {
    pub lock_command: String,
    pub reboot_command: String,
    pub poweroff_command: String,
    pub startup_apps: Vec<String>,
    pub idle_lock_seconds: Option<u64>,
    pub idle_suspend_seconds: Option<u64>,
}

impl Default for SessionConfig {
    fn default() -> Self {
        Self {
            lock_command: default_lock_command(),
            reboot_command: "systemctl reboot".to_string(),
            poweroff_command: "systemctl poweroff".to_string(),
            startup_apps: Vec::new(),
            idle_lock_seconds: None,
            idle_suspend_seconds: None,
        }
    }
}

fn default_lock_command() -> String {
    [
        "if command -v luft-lock >/dev/null 2>&1; then exec luft-lock",
        "elif command -v swaylock >/dev/null 2>&1; then exec swaylock",
        "elif command -v waylock >/dev/null 2>&1; then exec waylock",
        "else echo 'Install swaylock or waylock to lock this session' >&2; exit 127; fi",
    ]
    .join("; ")
}
