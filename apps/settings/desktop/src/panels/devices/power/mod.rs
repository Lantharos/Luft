mod battery;
mod keyboard;
mod limit;
mod profiles;
mod properties;
mod sleep;

use futures_util::StreamExt;
use luft_app::dbus::{self, failed};
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use tokio::sync::OnceCell;
use zbus::message::Type;
use zbus::{Connection, MatchRule, MessageStream};

const POWER_CHANGED: BridgeEvent<PowerState> = BridgeEvent::new("power.changed");

const UPOWER_NAMESPACE: &str = "/org/freedesktop/UPower";

static WATCH: OnceCell<()> = OnceCell::const_new();

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct PowerState {
    battery: Option<battery::Battery>,
    devices: Vec<battery::PowerDevice>,
    keyboard: Option<keyboard::Keyboard>,
    profiles: Option<profiles::Profiles>,
    can_hibernate: bool,
}

#[derive(Deserialize, specta::Type)]
struct PowerProfile {
    profile: String,
}

#[derive(Deserialize, specta::Type)]
struct ChargeLimitChange {
    enabled: bool,
}

#[derive(Deserialize, specta::Type)]
struct PowerOffAfter {
    seconds: u32,
}

#[derive(Deserialize, specta::Type)]
struct KeyboardBrightness {
    id: String,
    level: i32,
}

async fn can_hibernate(connection: &Connection) -> bool {
    connection
        .call_method(
            Some("org.freedesktop.login1"),
            "/org/freedesktop/login1",
            Some("org.freedesktop.login1.Manager"),
            "CanHibernate",
            &(),
        )
        .await
        .and_then(|reply| reply.body().deserialize::<String>())
        .is_ok_and(|answer| matches!(answer.as_str(), "yes" | "challenge"))
}

pub async fn has_battery() -> bool {
    match dbus::system().await {
        Ok(connection) => battery::present(connection).await,
        Err(_) => false,
    }
}

async fn read() -> Result<PowerState, String> {
    let connection = dbus::system().await?;
    let (battery, devices) = battery::read(connection).await.unwrap_or_default();
    Ok(PowerState {
        battery,
        devices,
        keyboard: keyboard::read(connection).await.ok().flatten(),
        profiles: profiles::read(connection).await.ok(),
        can_hibernate: can_hibernate(connection).await,
    })
}

async fn watch(events: Events) -> Result<(), String> {
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .path_namespace(UPOWER_NAMESPACE)
        .build()
        .map_err(failed)?;
    let mut signals = MessageStream::for_match_rule(rule, dbus::system().await?, None)
        .await
        .map_err(failed)?;
    luft_app::spawn(async move {
        while let Some(signal) = signals.next().await {
            if signal.is_ok()
                && let Ok(state) = read().await
            {
                events.emit(POWER_CHANGED, state);
            }
        }
    });
    Ok(())
}

async fn state(events: Events, Empty {}: Empty) -> Result<PowerState, String> {
    WATCH.get_or_try_init(|| watch(events)).await?;
    read().await
}

async fn set_profile(PowerProfile { profile }: PowerProfile) -> Result<(), String> {
    profiles::set(dbus::system().await?, &profile).await
}

async fn set_charge_limit(ChargeLimitChange { enabled }: ChargeLimitChange) -> Result<(), String> {
    limit::set(dbus::system().await?, enabled).await
}

async fn power_off_after(Empty {}: Empty) -> Result<Option<u32>, String> {
    Ok(sleep::power_off_after(dbus::system().await?).await)
}

async fn set_power_off_after(PowerOffAfter { seconds }: PowerOffAfter) -> Result<(), String> {
    sleep::set_power_off_after(dbus::system().await?, seconds).await
}

async fn set_keyboard(KeyboardBrightness { id, level }: KeyboardBrightness) -> Result<(), String> {
    keyboard::set(dbus::system().await?, &id, level).await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&POWER_CHANGED)
        .with_async("power_state", events, state)
        .command_async("power_set_profile", set_profile)
        .command_async("power_set_charge_limit", set_charge_limit)
        .command_async("power_set_keyboard", set_keyboard)
        .command_async("power_off_after", power_off_after)
        .command_async("power_set_power_off_after", set_power_off_after)
}
