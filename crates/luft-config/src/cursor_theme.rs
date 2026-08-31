use serde::{Deserialize, Serialize};
use std::{path::PathBuf, process::Command};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct CursorConfig {
    pub theme: String,
    pub size: u32,
    pub path: Option<PathBuf>,
}

impl Default for CursorConfig {
    fn default() -> Self {
        Self {
            theme: "default".to_string(),
            size: 24,
            path: None,
        }
    }
}

impl CursorConfig {
    pub fn apply_to_command(&self, command: &mut Command) {
        command.env("XCURSOR_THEME", &self.theme);
        command.env("XCURSOR_SIZE", self.size.to_string());
        match &self.path {
            Some(path) => {
                command.env("XCURSOR_PATH", path);
                command.env("LUFT_CURSOR_THEME_DIR", path.join(&self.theme));
            }
            None => {
                command.env_remove("XCURSOR_PATH");
                command.env_remove("LUFT_CURSOR_THEME_DIR");
            }
        }
    }
}
