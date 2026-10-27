use std::collections::HashMap;
use std::fmt::Display;
use std::fs::File;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::dbus::{self, error_message, error_name, failed, service::absent};
use luft_app::portal::{self, Filter};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::proxy::MethodFlags;
use zbus::{DynamicType, Fd, OwnedVariant, Proxy};

use crate::L10N;
use crate::panels::personalization::appearance::wallpaper;

const LOGIN_CHANGED: BridgeEvent<LoginScreen> = BridgeEvent::new("login.changed");

const GREETER: &str = "com.lantharos.Greeter1";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";
const GREETER_ERROR: &str = "com.lantharos.Greeter1.Error.";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const PICTURES: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];

static WATCH: Once = Once::new();

type Properties = HashMap<String, OwnedVariant>;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct LoginSession {
    id: String,
    name: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct LoginScreen {
    shared_wallpaper: Option<String>,
    show_users: bool,
    hidden_users: Vec<String>,
    default_session: String,
    automatic_login: String,
    sessions: Vec<LoginSession>,
}

#[derive(Deserialize, Type)]
struct ShowUsers {
    enabled: bool,
}

#[derive(Deserialize, Type)]
struct HiddenUsers {
    users: Vec<String>,
}

#[derive(Deserialize, Type)]
struct DefaultSession {
    session: String,
}

#[derive(Deserialize, Type)]
struct AutomaticLogin {
    user: String,
}

fn explain(error: zbus::Error) -> String {
    let name = error_name(&error).unwrap_or_default();
    if name.ends_with("NotAuthorized") {
        return t!(L10N, "desktop-admin-required");
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
        .ok_or_else(|| t!(L10N, "desktop-login-missing-property", property = name))?
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
            .map(|(id, name)| LoginSession { id, name })
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

async fn screen(events: Events, Empty {}: Empty) -> Result<Option<LoginScreen>, String> {
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

async fn choose_wallpaper(Empty {}: Empty) -> Result<bool, String> {
    let title = t!(L10N, "desktop-picture-choose-title");
    let filter = t!(L10N, "desktop-picture-filter");
    let Some(uri) = portal::open_file(
        &title,
        Filter {
            name: &filter,
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
    let path = portal::uri_path(&uri).ok_or_else(|| t!(L10N, "desktop-picture-unopenable"))?;
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
        .bridge_event(&LOGIN_CHANGED)
        .with_async("login_screen", events, screen)
        .command_async("login_choose_wallpaper", choose_wallpaper)
        .command_async("login_clear_wallpaper", |Empty {}| {
            change("ClearSharedWallpaper", &())
        })
        .command_async("login_set_show_users", |ShowUsers { enabled }| async move {
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
