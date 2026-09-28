mod battery;
mod profiles;
mod properties;

use std::sync::Once;

use luft_app::dbus;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::{Connection, MessageIterator};

pub const POWER_CHANGED: &str = "power.changed";

const UPOWER_NAMESPACE: &str = "/org/freedesktop/UPower";

static WATCH: Once = Once::new();

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PowerState {
    battery: Option<battery::Battery>,
    devices: Vec<battery::Device>,
    profiles: Option<profiles::Profiles>,
    can_hibernate: bool,
}

#[derive(Deserialize)]
struct Profile {
    profile: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn can_hibernate(connection: &Connection) -> bool {
    connection
        .call_method(
            Some("org.freedesktop.login1"),
            "/org/freedesktop/login1",
            Some("org.freedesktop.login1.Manager"),
            "CanHibernate",
            &(),
        )
        .and_then(|reply| reply.body().deserialize::<String>())
        .is_ok_and(|answer| matches!(answer.as_str(), "yes" | "challenge"))
}

fn read() -> Result<PowerState, String> {
    let connection = dbus::system()?;
    let (battery, devices) = battery::read(connection).unwrap_or_default();
    Ok(PowerState {
        battery,
        devices,
        profiles: profiles::read(connection).ok(),
        can_hibernate: can_hibernate(connection),
    })
}

fn watch(events: Events) -> Result<(), String> {
    let connection = dbus::system()?;
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .path_namespace(UPOWER_NAMESPACE)
        .map_err(failed)?
        .build();
    let signals = MessageIterator::for_match_rule(rule, connection, None).map_err(failed)?;
    std::thread::Builder::new()
        .name("power-watch".into())
        .spawn(move || {
            for _ in signals.flatten() {
                if let Ok(state) = read() {
                    events.emit(POWER_CHANGED, state);
                }
            }
        })
        .map_err(failed)?;
    Ok(())
}

fn state(events: &Events, _: Value) -> Result<PowerState, String> {
    let mut started = Ok(());
    WATCH.call_once(|| started = watch(events.clone()));
    started?;
    read()
}

fn set_profile(Profile { profile }: Profile) -> Result<(), String> {
    profiles::set(dbus::system()?, &profile)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("power_state", events, state)
        .command("power_set_profile", set_profile)
}
