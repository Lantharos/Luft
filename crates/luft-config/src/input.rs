use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct InputConfig {
    pub num_lock: bool,
    pub keyboard_layout: String,
    pub keyboard_variant: String,
    pub keyboard_options: String,
    pub repeat_delay: i32,
    pub repeat_rate: i32,
    pub tap_to_click: bool,
    pub natural_scroll: bool,
    pub disable_while_typing: bool,
    pub pointer_acceleration: f64,
}

impl Default for InputConfig {
    fn default() -> Self {
        Self {
            num_lock: true,
            keyboard_layout: "us".into(),
            keyboard_variant: String::new(),
            keyboard_options: String::new(),
            repeat_delay: 200,
            repeat_rate: 25,
            tap_to_click: true,
            natural_scroll: false,
            disable_while_typing: true,
            pointer_acceleration: 0.0,
        }
    }
}
