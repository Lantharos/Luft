use futures_util::StreamExt;
use luft_app::dbus::service::{Map, Service, absent, get};
use luft_app::dbus::{error_message, error_name, failed};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::DynamicType;
use zbus::wire::DynamicDeserialize;

const INSTALLER: Service = Service {
    name: "com.lantharos.Installer1",
    path: "/com/lantharos/Installer1",
    interface: "com.lantharos.Installer1",
};
const ERROR: &str = "com.lantharos.Installer1.Error.";
const CHANGED: &str = "installer.changed";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    phase: String,
    stage: String,
    progress: f64,
    error: String,
    secure_boot_code: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Account {
    name: String,
    full_name: String,
    password: String,
}

#[derive(Deserialize)]
struct Json {
    value: Value,
}

fn text(map: &Map, key: &str) -> String {
    get(map, key).unwrap_or_default()
}

pub async fn state() -> Result<Option<State>, String> {
    Ok(INSTALLER.read().await?.map(|map| State {
        phase: text(&map, "Phase"),
        stage: text(&map, "Stage"),
        progress: get(&map, "Progress").unwrap_or_default(),
        error: text(&map, "Error"),
        secure_boot_code: text(&map, "SecureBootCode"),
    }))
}

fn explain(error: &zbus::Error) -> String {
    match (error_name(error), error_message(error)) {
        (Some(name), Some(message)) if name.starts_with(ERROR) => message.to_owned(),
        _ if absent(error) => "The installer isn't available on this computer".to_owned(),
        _ => failed(error),
    }
}

async fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    INSTALLER
        .change(method, body)
        .await
        .map_err(|error| explain(&error))
}

async fn survey(_: Value) -> Result<Value, String> {
    let survey: String = call("Survey", &()).await?;
    serde_json::from_str(&survey).map_err(failed)
}

async fn install(Json { value }: Json) -> Result<(), String> {
    call("Install", &(value.to_string(),)).await
}

async fn configure(Json { value }: Json) -> Result<(), String> {
    call("Configure", &(value.to_string(),)).await
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

async fn finish_first_boot(_: Value) -> Result<(), String> {
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
        .command_async("installer_state", |_: Value| state())
        .command_async("installer_survey", survey)
        .command_async("installer_install", install)
        .command_async("installer_configure", configure)
        .command_async("installer_account", create_account)
        .command_async("installer_finish_first_boot", finish_first_boot)
}
