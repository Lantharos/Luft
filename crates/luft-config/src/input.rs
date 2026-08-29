use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct InputConfig {
    pub num_lock: bool,
}

impl Default for InputConfig {
    fn default() -> Self {
        Self { num_lock: true }
    }
}
