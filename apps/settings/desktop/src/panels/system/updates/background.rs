use std::collections::HashMap;
use std::future::ready;
use std::num::NonZeroUsize;
use std::time::Duration;

use futures_util::StreamExt;
use luft_app::dbus::{self, failed};
use luft_i18n::t;
use zbus::message::Type;
use zbus::{MatchRule, MessageStream, Variant};

use super::backend::{self, Notice};
use super::schedule;
use super::store::Preferences;
use crate::L10N;

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const NOTIFICATIONS_PATH: &str = "/org/freedesktop/Notifications";
const PAGE: &str = "kestrel-settings:updates";
const WAIT_FOR_CLICK: Duration = Duration::from_secs(6 * 60 * 60);

type Properties<'a> = Vec<(&'a str, Variant<'a>)>;

async fn open_updates() -> Result<(), String> {
    let settings = std::env::current_exe()
        .map_err(|error| error.to_string())?
        .to_string_lossy()
        .into_owned();
    let unit = format!("app-com.lantharos.settings-{}.service", std::process::id());
    let command = vec![(settings.clone(), vec![settings, PAGE.to_owned()], false)];
    let properties: Properties = vec![
        ("Description", Variant::from("Settings")),
        ("ExecStart", Variant::from(command)),
    ];
    let auxiliary: Vec<(&str, Properties)> = Vec::new();
    schedule::call("StartTransientUnit", &(unit, "fail", properties, auxiliary)).await
}

async fn answered(signals: MessageStream, id: u32) {
    let mut signals = signals.filter_map(|message| ready(message.ok()));
    while let Some(message) = signals.next().await {
        let ours = |notification: Option<u32>| notification == Some(id);
        match message.header().member().map(|member| member.as_str()) {
            Some("ActionInvoked")
                if ours(
                    message
                        .body()
                        .deserialize::<(u32, String)>()
                        .ok()
                        .map(|(clicked, _)| clicked),
                ) =>
            {
                if let Err(error) = open_updates().await {
                    eprintln!("Opening Settings failed: {error}");
                }
                return;
            }
            Some("NotificationClosed")
                if ours(
                    message
                        .body()
                        .deserialize::<(u32, u32)>()
                        .ok()
                        .map(|(closed, _)| closed),
                ) =>
            {
                return;
            }
            _ => {}
        }
    }
}

pub async fn notify(summary: &str, body: &str) -> Result<(), String> {
    let connection = dbus::session().await?;
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .interface(NOTIFICATIONS)
        .build()
        .map_err(failed)?;
    let signals = MessageStream::for_match_rule(rule, connection, NonZeroUsize::new(16))
        .await
        .map_err(failed)?;
    let hints: HashMap<&str, Variant> =
        HashMap::from([("desktop-entry", Variant::from("com.lantharos.settings"))]);
    let id: u32 = connection
        .call_method(
            Some(NOTIFICATIONS),
            NOTIFICATIONS_PATH,
            Some(NOTIFICATIONS),
            "Notify",
            &(
                t!(L10N, "desktop-app-name"),
                0u32,
                "com.lantharos.settings",
                summary,
                body,
                vec![
                    "default".to_owned(),
                    t!(L10N, "desktop-updates-notification-open"),
                ],
                hints,
                -1i32,
            ),
        )
        .await
        .and_then(|reply| reply.body().deserialize())
        .map_err(failed)?;
    let _ = tokio::time::timeout(WAIT_FOR_CLICK, answered(signals, id)).await;
    Ok(())
}

fn check() -> Result<(), String> {
    match backend::current().check_in_background(Preferences::load().download)? {
        Some(Notice { summary, body }) => {
            luft_app::block_on(notify(&t!(L10N, summary), &t!(L10N, body)))
        }
        None => Ok(()),
    }
}

pub fn run() {
    if let Err(error) = check() {
        eprintln!("Checking for updates failed: {error}");
        std::process::exit(1);
    }
}
