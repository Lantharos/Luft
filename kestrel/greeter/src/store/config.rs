use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Config {
    pub show_users: bool,
    pub hidden_users: Vec<String>,
    pub default_session: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            show_users: true,
            hidden_users: Vec::new(),
            default_session: String::new(),
        }
    }
}
