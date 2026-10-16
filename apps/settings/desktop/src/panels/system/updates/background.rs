use std::collections::HashMap;
use std::time::Duration;

use luft_app::dbus;
use zbus::blocking::MessageIterator;
use zbus::zvariant::Value;

use super::backend::{self, Notice};
use super::schedule;
use super::store::Preferences;

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const NOTIFICATIONS_PATH: &str = "/org/freedesktop/Notifications";
const PAGE: &str = "kestrel-settings:updates";
const WAIT_FOR_CLICK: Duration = Duration::from_secs(6 * 60 * 60);

type Properties<'a> = Vec<(&'a str, Value<'a>)>;

fn open_updates() -> Result<(), String> {
    let settings = std::env::current_exe()
        .map_err(|error| error.to_string())?
        .to_string_lossy()
        .into_owned();
    let unit = format!("app-com.lantharos.settings-{}.service", std::process::id());
    let command = vec![(settings.clone(), vec![settings, PAGE.to_owned()], false)];
    let properties: Properties = vec![
        ("Description", Value::from("Settings")),
        ("ExecStart", Value::from(command)),
    ];
    let auxiliary: Vec<(&str, Properties)> = Vec::new();
    schedule::call("StartTransientUnit", &(unit, "fail", properties, auxiliary))
}

pub fn notify(summary: &str, body: &str) -> Result<(), String> {
    let connection = dbus::session()?;
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .interface(NOTIFICATIONS)
        .map_err(|error| error.to_string())?
        .build();
    let signals = MessageIterator::for_match_rule(rule, connection, Some(16))
        .map_err(|error| error.to_string())?;
    let hints: HashMap<&str, Value> =
        HashMap::from([("desktop-entry", Value::from("com.lantharos.settings"))]);
    let id: u32 = connection
        .call_method(
            Some(NOTIFICATIONS),
            NOTIFICATIONS_PATH,
            Some(NOTIFICATIONS),
            "Notify",
            &(
                "Settings",
                0u32,
                "com.lantharos.settings",
                summary,
                body,
                vec!["default", "Open"],
                hints,
                -1i32,
            ),
        )
        .and_then(|reply| reply.body().deserialize())
        .map_err(|error| error.to_string())?;
    std::thread::spawn(|| {
        std::thread::sleep(WAIT_FOR_CLICK);
        std::process::exit(0);
    });
    for message in signals.flatten() {
        let member = message
            .header()
            .member()
            .map(|member| member.to_string())
            .unwrap_or_default();
        let ours = |closed: Option<u32>| closed == Some(id);
        match member.as_str() {
            "ActionInvoked"
                if ours(
                    message
                        .body()
                        .deserialize::<(u32, String)>()
                        .ok()
                        .map(|(clicked, _)| clicked),
                ) =>
            {
                if let Err(error) = open_updates() {
                    eprintln!("Opening Settings failed: {error}");
                }
                break;
            }
            "NotificationClosed"
                if ours(
                    message
                        .body()
                        .deserialize::<(u32, u32)>()
                        .ok()
                        .map(|(closed, _)| closed),
                ) =>
            {
                break;
            }
            _ => {}
        }
    }
    Ok(())
}

fn check() -> Result<(), String> {
    match backend::current().check_in_background(Preferences::load().download)? {
        Some(Notice { summary, body }) => notify(summary, body),
        None => Ok(()),
    }
}

pub fn run() {
    if let Err(error) = check() {
        eprintln!("Checking for updates failed: {error}");
        std::process::exit(1);
    }
}
