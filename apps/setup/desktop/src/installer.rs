use futures_util::StreamExt;
use luft_app::dbus::service::{Map, Service, absent, get};
use luft_app::dbus::{error_message, error_name, failed};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use luft_installer_contract::{InstallPlan, Regional, Survey};
use sabine::{BridgeEvent, SabineWindow};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;
use zbus::DynamicType;
use zbus::wire::DynamicDeserialize;

use crate::L10N;

pub const INSTALLER: Service = Service {
    name: "com.lantharos.Installer1",
    path: "/com/lantharos/Installer1",
    interface: "com.lantharos.Installer1",
};
const ERROR: &str = "com.lantharos.Installer1.Error.";
const CHANGED: BridgeEvent<InstallerState> = BridgeEvent::new("installer.changed");

#[derive(Serialize, Deserialize, Default, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Phase {
    Live,
    FirstBoot,
    #[default]
    Installed,
}

#[derive(Serialize, Deserialize, Default, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Stage {
    #[default]
    Idle,
    Preparing,
    Copying,
    Waiting,
    Configuring,
    Finished,
    Failed,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct InstallerState {
    phase: Phase,
    stage: Stage,
    progress: f64,
    error: String,
    secure_boot_code: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Account {
    name: String,
    full_name: String,
    password: String,
}

fn text(map: &Map, key: &str) -> String {
    get(map, key).unwrap_or_default()
}

/// Reads one of a service's names for a state, such as `first-boot`, as the matching variant.
pub fn named<T: DeserializeOwned + Default>(name: Option<String>) -> T {
    name.and_then(|name| serde_json::from_value(Value::String(name)).ok())
        .unwrap_or_default()
}

pub async fn state() -> Result<Option<InstallerState>, String> {
    Ok(INSTALLER.read().await?.map(|map| InstallerState {
        phase: named(get(&map, "Phase")),
        stage: named(get(&map, "Stage")),
        progress: get(&map, "Progress").unwrap_or_default(),
        error: text(&map, "Error"),
        secure_boot_code: text(&map, "SecureBootCode"),
    }))
}

fn explain(error: &zbus::Error) -> String {
    match (error_name(error), error_message(error)) {
        (Some(name), Some(message)) if name.starts_with(ERROR) => message.to_owned(),
        _ if absent(error) => t!(L10N, "desktop-installer-unavailable"),
        _ => failed(error),
    }
}

pub async fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    INSTALLER
        .change(method, body)
        .await
        .map_err(|error| explain(&error))
}

async fn survey(Empty {}: Empty) -> Result<Survey, String> {
    let survey: String = call("Survey", &()).await?;
    serde_json::from_str(&survey).map_err(failed)
}

async fn install(plan: InstallPlan) -> Result<(), String> {
    call("Install", &(serde_json::to_string(&plan).map_err(failed)?,)).await
}

async fn configure(regional: Regional) -> Result<(), String> {
    call(
        "Configure",
        &(serde_json::to_string(&regional).map_err(failed)?,),
    )
    .await
}

async fn create_account(
    Account {
        name,
        full_name,
        password,
    }: Account,
) -> Result<(), String> {
    if let Err(error) = luft_network::store_secrets_system_wide().await {
        eprintln!("Saved networks weren't readied for the new system: {error}");
    }
    call("CreateAccount", &(name, full_name, password)).await
}

async fn finish_first_boot(Empty {}: Empty) -> Result<(), String> {
    call("FinishFirstBoot", &()).await
}

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(mut changes) = INSTALLER.changes().await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(Some(state)) = state().await {
                events.emit(CHANGED, state);
            }
        }
    });
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .command_async("installer_state", |Empty {}| state())
        .command_async("installer_survey", survey)
        .command_async("installer_install", install)
        .command_async("installer_configure", configure)
        .command_async("installer_account", create_account)
        .command_async("installer_finish_first_boot", finish_first_boot)
}
