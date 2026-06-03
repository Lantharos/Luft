use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct BackgroundEffectStatus {
    pub background_effect: String,
    pub background_effect_reason: String,
}

#[command]
pub fn get_background_effect_status() -> BackgroundEffectStatus {
    platform_background_effect_status()
}

#[cfg(target_os = "linux")]
fn platform_background_effect_status() -> BackgroundEffectStatus {
    let session_type =
        std::env::var("XDG_SESSION_TYPE").unwrap_or_else(|_| String::from("unknown"));
    let background_effect =
        if session_type == "wayland" && crate::platform::linux::background_effect::available() {
            "translucent"
        } else {
            "opaque"
        };
    let background_effect_reason = if background_effect == "translucent" {
        "Using compositor-provided ext-background-effect-v1".to_string()
    } else if session_type == "wayland" {
        "Opaque fallback until ext-background-effect-v1 is reported".to_string()
    } else {
        "Opaque fallback for this desktop session".to_string()
    };

    BackgroundEffectStatus {
        background_effect: background_effect.to_string(),
        background_effect_reason,
    }
}

#[cfg(not(target_os = "linux"))]
fn platform_background_effect_status() -> BackgroundEffectStatus {
    BackgroundEffectStatus {
        background_effect: "opaque".to_string(),
        background_effect_reason: "Opaque fallback for this platform".to_string(),
    }
}
