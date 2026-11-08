mod notes;
mod transcription;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::Serialize;
use specta::Type;

pub const ON_BATTERY: BridgeEvent<bool> = BridgeEvent::new("power.battery");

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PowerState {
    battery: bool,
    on_battery: bool,
}

/// Whether the computer has a battery and runs on it; without UPower it counts as plugged in.
async fn power_state(Empty {}: Empty) -> Result<PowerState, String> {
    let system = luft_app::dbus::system().await?;
    Ok(PowerState {
        battery: luft_app::dbus::power::has_battery(system).await,
        on_battery: luft_app::dbus::power::on_battery(system).await,
    })
}

/// Tells the page whenever the charger is plugged in or out, so recordings
/// waiting for it start then.
async fn watch_power(events: Events) {
    let Ok(system) = luft_app::dbus::system().await else {
        return;
    };
    let Ok(changes) = luft_app::dbus::power::on_battery_changes(system).await else {
        return;
    };
    let mut changes = std::pin::pin!(changes);
    while let Some(on_battery) = changes.next().await {
        events.emit(ON_BATTERY, on_battery);
    }
}

pub fn watch(events: &Events) {
    luft_app::spawn(watch_power(events.clone()));
    luft_app::spawn(transcription::watch(events.clone()));
    luft_app::spawn(notes::watch(events.clone()));
}

pub fn register(window: SabineWindow) -> SabineWindow {
    notes::register(transcription::register(window))
        .bridge_event(&ON_BATTERY)
        .command_async("power_state", power_state)
}
