use std::collections::HashMap;
use std::fmt::Display;
use std::fs::File;
use std::sync::Once;

use luft_app::dbus;
use luft_app::portal::{self, Filter};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;
use zbus::zvariant::{DynamicType, Fd, OwnedValue};

pub const LOGIN_CHANGED: &str = "login.changed";

const GREETER: &str = "com.lantharos.Greeter1";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";
const GREETER_ERROR: &str = "com.lantharos.Greeter1.Error.";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const SERVICE_UNKNOWN: &str = "org.freedesktop.DBus.Error.ServiceUnknown";
const PICTURES: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];

static WATCH: Once = Once::new();

type Properties = HashMap<String, OwnedValue>;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Session {
    id: String,
    name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LoginScreen {
    shared_wallpaper: Option<String>,
    show_users: bool,
    hidden_users: Vec<String>,
    default_session: String,
    automatic_login: String,
    sessions: Vec<Session>,
}

#[derive(Deserialize)]
struct Enabled {
    enabled: bool,
}

#[derive(Deserialize)]
struct HiddenUsers {
    users: Vec<String>,
}

#[derive(Deserialize)]
struct DefaultSession {
    session: String,
}

#[derive(Deserialize)]
struct AutomaticLogin {
    user: String,
}

fn failed(error: impl Display) -> String {
    error.to_string()
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(name, _, _) if name.ends_with("NotAuthorized") => {
            "Administrator rights are needed to change this".to_owned()
        }
        zbus::Error::MethodError(name, Some(message), _) if name.starts_with(GREETER_ERROR) => {
            message
        }
        error => error.to_string(),
    }
}

fn greeter(interface: &'static str) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, GREETER, GREETER_PATH, interface).map_err(failed)
}

fn take<T>(properties: &mut Properties, name: &str) -> Result<T, String>
where
    T: TryFrom<OwnedValue>,
    T::Error: Display,
{
    properties
        .remove(name)
        .ok_or_else(|| format!("The login screen left out {name}"))?
        .try_into()
        .map_err(failed)
}

fn read() -> Result<Option<LoginScreen>, String> {
    let mut properties: Properties = match greeter(PROPERTIES)?.call("GetAll", &GREETER) {
        Ok(properties) => properties,
        Err(zbus::Error::MethodError(name, _, _)) if name.as_str() == SERVICE_UNKNOWN => {
            return Ok(None);
        }
        Err(error) => return Err(explain(error)),
    };
    let wallpaper: String = take(&mut properties, "SharedWallpaper")?;
    let sessions: Vec<(String, String)> = take(&mut properties, "Sessions")?;
    Ok(Some(LoginScreen {
        shared_wallpaper: (!wallpaper.is_empty()).then_some(wallpaper),
        show_users: take(&mut properties, "ShowUsers")?,
        hidden_users: take(&mut properties, "HiddenUsers")?,
        default_session: take(&mut properties, "DefaultSession")?,
        automatic_login: take(&mut properties, "AutomaticLogin")?,
        sessions: sessions
            .into_iter()
            .map(|(id, name)| Session { id, name })
            .collect(),
    }))
}

fn watch(events: Events) {
    std::thread::spawn(move || {
        let Ok(properties) = greeter(PROPERTIES) else {
            return;
        };
        let Ok(changes) = properties.receive_signal("PropertiesChanged") else {
            return;
        };
        for _ in changes {
            if let Ok(Some(screen)) = read() {
                events.emit(LOGIN_CHANGED, screen);
            }
        }
    });
}

fn screen(events: &Events, _: Value) -> Result<Option<LoginScreen>, String> {
    let screen = read()?;
    if screen.is_some() {
        WATCH.call_once(|| watch(events.clone()));
    }
    Ok(screen)
}

fn change<B: Serialize + DynamicType>(method: &str, body: &B) -> Result<(), String> {
    greeter(GREETER)?
        .call_with_flags::<_, _, ()>(method, MethodFlags::AllowInteractiveAuth.into(), body)
        .map(|_| ())
        .map_err(explain)
}

fn choose_wallpaper(_: Value) -> Result<bool, String> {
    let Some(uri) = portal::open_file(
        "Choose a Picture",
        Filter {
            name: "Images",
            patterns: PICTURES
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )?
    else {
        return Ok(false);
    };
    let path = portal::uri_path(&uri).ok_or("This picture can't be opened")?;
    let picture = File::open(path).map_err(failed)?;
    change("SetSharedWallpaper", &Fd::from(&picture))?;
    Ok(true)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("login_screen", events, screen)
        .command("login_choose_wallpaper", choose_wallpaper)
        .command("login_clear_wallpaper", |_: Value| {
            change("ClearSharedWallpaper", &())
        })
        .command("login_set_show_users", |Enabled { enabled }| {
            change("SetShowUsers", &enabled)
        })
        .command("login_set_hidden_users", |HiddenUsers { users }| {
            change("SetHiddenUsers", &users)
        })
        .command("login_set_default_session", |DefaultSession { session }| {
            change("SetDefaultSession", &session)
        })
        .command("login_set_automatic_login", |AutomaticLogin { user }| {
            change("SetAutomaticLogin", &user)
        })
}
