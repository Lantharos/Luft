use std::collections::HashMap;
use std::time::Duration;

use luft_app::dbus;
use luft_software::packagekit::{self, Mode, PackageId, offline};
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use luft_software::updates::PackageUpdates;
use zbus::blocking::MessageIterator;
use zbus::zvariant::Value;

use super::store::{Checked, Preferences};

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const NOTIFICATIONS_PATH: &str = "/org/freedesktop/Notifications";
const PAGE: &str = "kestrel-settings:updates";
const WAIT_FOR_CLICK: Duration = Duration::from_secs(6 * 60 * 60);

pub fn covered(updates: &[PackageId]) -> bool {
    let prepared: Vec<PackageId> = offline::prepared().unwrap_or_default();
    !updates.is_empty()
        && updates
            .iter()
            .all(|update| prepared.iter().any(|ready| ready.id == update.id))
}

fn notify(summary: &str, body: &str) -> Result<(), String> {
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
                let _ = gio::AppInfo::launch_default_for_uri(PAGE, gio::AppLaunchContext::NONE);
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
    packagekit::refresh(false, Mode::Background, None)?;
    Checked::now()?;
    let updates: Vec<PackageId> = PackageUpdates::load(Mode::Background)?
        .system
        .into_iter()
        .map(|update| update.package)
        .collect();
    if updates.is_empty() || covered(&updates) {
        return Ok(());
    }
    if !Preferences::load().download {
        return notify(
            "System updates are available",
            "Open Settings to download and install them.",
        );
    }
    let quiet = |_: Progress| {};
    packagekit::prepare(
        &updates,
        Task {
            report: &quiet,
            cancel: &Cancel::default(),
        },
    )?;
    notify(
        "Updates are ready to install",
        "Restart when it suits you to install them.",
    )
}

pub fn run() {
    if let Err(error) = check() {
        eprintln!("Checking for updates failed: {error}");
        std::process::exit(1);
    }
}
