use luft_app::dbus::service::{Map, Service, absent, failed, get};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const INSTALLER: Service = Service {
    name: "com.lantharos.Installer1",
    path: "/com/lantharos/Installer1",
    interface: "com.lantharos.Installer1",
};
const ERROR: &str = "com.lantharos.Installer1.Error.";
const CHANGED: &str = "installer.changed";

#[derive(Serialize)]
pub struct State {
    phase: String,
    stage: String,
    progress: f64,
    error: String,
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

pub fn state() -> Result<Option<State>, String> {
    Ok(INSTALLER.read()?.map(|map| State {
        phase: text(&map, "Phase"),
        stage: text(&map, "Stage"),
        progress: get(&map, "Progress").unwrap_or_default(),
        error: text(&map, "Error"),
    }))
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(name, Some(message), _) if name.starts_with(ERROR) => message,
        error if absent(&error) => "The installer isn't available on this computer".to_owned(),
        error => failed(error),
    }
}

fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + zbus::zvariant::DynamicType,
    R: for<'d> zbus::zvariant::DynamicDeserialize<'d>,
{
    INSTALLER.change(method, body).map_err(explain)
}

fn survey(_: Value) -> Result<Value, String> {
    let survey: String = call("Survey", &())?;
    serde_json::from_str(&survey).map_err(failed)
}

fn install(Json { value }: Json) -> Result<(), String> {
    call("Install", &(value.to_string(),))
}

fn configure(Json { value }: Json) -> Result<(), String> {
    call("Configure", &(value.to_string(),))
}

pub fn watch(events: &Events) {
    let events = events.clone();
    INSTALLER.watch(move || {
        if let Ok(Some(state)) = state() {
            events.emit(CHANGED, state);
        }
    });
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("installer_state", |_: Value| state())
        .command("installer_survey", survey)
        .command("installer_install", install)
        .command("installer_configure", configure)
        .command(
            "installer_account",
            |Account {
                 name,
                 full_name,
                 password,
             }| call::<_, ()>("CreateAccount", &(name, full_name, password)),
        )
        .command("installer_finish_first_boot", |_: Value| {
            call::<_, ()>("FinishFirstBoot", &())
        })
}
