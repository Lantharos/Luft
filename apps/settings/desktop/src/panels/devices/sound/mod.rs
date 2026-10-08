mod card;
mod meter;
mod model;
mod pulse;
mod service;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use service::Command;

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    Output,
    Input,
}

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Target {
    Output,
    Input,
    App,
}

#[derive(Deserialize)]
pub struct DefaultDevice {
    direction: Direction,
    name: String,
}

#[derive(Deserialize)]
pub struct Volume {
    target: Target,
    index: u32,
    volume: f64,
}

#[derive(Deserialize)]
pub struct Mute {
    target: Target,
    index: u32,
    muted: bool,
}

#[derive(Deserialize)]
pub struct Balance {
    index: u32,
    balance: f32,
}

#[derive(Deserialize)]
pub struct Port {
    direction: Direction,
    index: u32,
    port: String,
}

#[derive(Deserialize)]
pub struct Profile {
    card: u32,
    profile: String,
}

#[derive(Deserialize)]
pub struct MoveApp {
    index: u32,
    output: u32,
}

#[derive(Deserialize)]
pub struct AlertVolume {
    volume: f64,
}

#[derive(Deserialize)]
pub struct Meter {
    enabled: bool,
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("sound_start", events, |events, _: Value| {
            service::send(events, Command::Publish)
        })
        .with("sound_set_default", events, |events, request| {
            service::send(events, Command::SetDefault(request))
        })
        .with("sound_set_volume", events, |events, request| {
            service::send(events, Command::SetVolume(request))
        })
        .with("sound_set_mute", events, |events, request| {
            service::send(events, Command::SetMute(request))
        })
        .with("sound_set_balance", events, |events, request| {
            service::send(events, Command::SetBalance(request))
        })
        .with("sound_set_port", events, |events, request| {
            service::send(events, Command::SetPort(request))
        })
        .with("sound_set_profile", events, |events, request| {
            service::send(events, Command::SetProfile(request))
        })
        .with("sound_move_app", events, |events, request| {
            service::send(events, Command::MoveApp(request))
        })
        .with("sound_set_alert_volume", events, |events, request| {
            service::send(events, Command::SetAlertVolume(request))
        })
        .with("sound_meter", events, |events, request| {
            service::send(events, Command::Meter(request))
        })
}
