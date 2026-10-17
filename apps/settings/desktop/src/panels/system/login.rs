use std::collections::HashMap;
use std::fmt::Display;
use std::fs::File;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::dbus::{self, error_message, error_name, failed, service::absent};
use luft_app::portal::{self, Filter};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::proxy::MethodFlags;
use zbus::{DynamicType, Fd, OwnedVariant, Proxy};

use crate::panels::personalization::appearance::wallpaper;

pub const LOGIN_CHANGED: &str = "login.changed";

const GREETER: &str = "com.lantharos.Greeter1";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";
const GREETER_ERROR: &str = "com.lantharos.Greeter1.Error.";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const PICTURES: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];

static WATCH: Once = Once::new();

type Properties = HashMap<String, OwnedVariant>;

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

fn explain(error: zbus::Error) -> String {
    let name = error_name(&error).unwrap_or_default();
    if name.ends_with("NotAuthorized") {
        return "Administrator rights are needed to change this".to_owned();
    }
    match error_message(&error) {
        Some(message) if name.starts_with(GREETER_ERROR) => message.to_owned(),
        _ => error.to_string(),
    }
}

async fn greeter(interface: &'static str) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, GREETER, GREETER_PATH, interface)
        .await
        .map_err(failed)
}

fn take<T>(properties: &mut Properties, name: &str) -> Result<T, String>
where
    T: TryFrom<OwnedVariant>,
    T::Error: Display,
{
    properties
        .remove(name)
        .ok_or_else(|| format!("The login screen left out {name}"))?
        .try_into()
        .map_err(failed)
}

async fn read() -> Result<Option<LoginScreen>, String> {
    let mut properties: Properties = match greeter(PROPERTIES).await?.call("GetAll", &GREETER).await
    {
        Ok(properties) => properties,
        Err(error) if absent(&error) => return Ok(None),
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
    luft_app::spawn(async move {
        let Ok(properties) = greeter(PROPERTIES).await else {
            return;
        };
        let Ok(mut changes) = properties.receive_signal("PropertiesChanged").await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(Some(screen)) = read().await {
                events.emit(LOGIN_CHANGED, screen);
            }
        }
    });
}

async fn screen(events: Events, _: Value) -> Result<Option<LoginScreen>, String> {
    let screen = read().await?;
    if screen.is_some() {
        WATCH.call_once(|| watch(events));
    }
    Ok(screen)
}

async fn change<B: Serialize + DynamicType>(method: &str, body: &B) -> Result<(), String> {
    greeter(GREETER)
        .await?
        .call_with_flags::<_, _, ()>(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await
        .map(|_| ())
        .map_err(explain)
}

async fn choose_wallpaper(_: Value) -> Result<bool, String> {
    let Some(uri) = portal::open_file(
        "Choose a Picture",
        Filter {
            name: "Images",
            patterns: PICTURES
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )
    .await?
    else {
        return Ok(false);
    };
    let path = portal::uri_path(&uri).ok_or("This picture can't be opened")?;
    let picture = File::open(&path).map_err(failed)?;
    let focus: (f64, f64) = tokio::task::spawn_blocking(move || wallpaper::focus::of(&path))
        .await
        .map_err(failed)?
        .into();
    change("SetSharedWallpaper", &(Fd::from(&picture), focus)).await?;
    Ok(true)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("login_screen", events, screen)
        .command_async("login_choose_wallpaper", choose_wallpaper)
        .command_async("login_clear_wallpaper", |_: Value| {
            change("ClearSharedWallpaper", &())
        })
        .command_async("login_set_show_users", |Enabled { enabled }| async move {
            change("SetShowUsers", &enabled).await
        })
        .command_async(
            "login_set_hidden_users",
            |HiddenUsers { users }| async move { change("SetHiddenUsers", &users).await },
        )
        .command_async(
            "login_set_default_session",
            |DefaultSession { session }| async move { change("SetDefaultSession", &session).await },
        )
        .command_async(
            "login_set_automatic_login",
            |AutomaticLogin { user }| async move { change("SetAutomaticLogin", &user).await },
        )
}
