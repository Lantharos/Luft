mod meter;
mod model;
mod pulse;
mod service;

use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;
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
pub struct AlertVolume {
    volume: f64,
}

#[derive(Deserialize)]
pub struct Meter {
    enabled: bool,
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_events("sound_start", events, |events, _: Value| {
            service::send(events, Command::Publish)
        })
        .with_events("sound_set_default", events, |events, request| {
            service::send(events, Command::SetDefault(request))
        })
        .with_events("sound_set_volume", events, |events, request| {
            service::send(events, Command::SetVolume(request))
        })
        .with_events("sound_set_mute", events, |events, request| {
            service::send(events, Command::SetMute(request))
        })
        .with_events("sound_set_balance", events, |events, request| {
            service::send(events, Command::SetBalance(request))
        })
        .with_events("sound_set_alert_volume", events, |events, request| {
            service::send(events, Command::SetAlertVolume(request))
        })
        .with_events("sound_meter", events, |events, request| {
            service::send(events, Command::Meter(request))
        })
}
