mod activity;
mod background;
mod firmware;
mod schedule;
mod store;

use std::sync::Once;

use luft_app::{Commands, Events, dbus};
use luft_software::packagekit::{self, Mode, PackageId, Results, Update, offline};
use luft_software::updates::{self, PackageUpdates};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use activity::{Activity, Kind};
use firmware::Firmware;
use store::{Checked, Preferences};

pub use background::run as check_in_background;
pub use schedule::CHECK_ARGUMENT;

const APP_UPDATES: &str = "schelf:updates";

static FIRST_RUN: Once = Once::new();

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Overview {
    checked: Option<u64>,
    updates: Vec<Update>,
    prepared: bool,
    results: Option<Results>,
    preferences: Preferences,
    activity: Activity,
}

#[derive(Deserialize)]
struct Device {
    id: String,
}

fn overview(refresh: bool) -> Result<Overview, String> {
    FIRST_RUN.call_once(|| {
        if !Preferences::exists() {
            let preferences = Preferences::default();
            let _ = preferences
                .save()
                .and_then(|_| schedule::apply(preferences.schedule));
        }
    });
    let checked = if refresh {
        packagekit::refresh(true, Mode::Interactive, None)?;
        Checked::now()?
    } else {
        Checked::load()
    };
    let updates = PackageUpdates::load(Mode::Quiet)?.system;
    let ids: Vec<PackageId> = updates
        .iter()
        .map(|update| update.package.clone())
        .collect();
    Ok(Overview {
        checked: checked.at,
        prepared: background::covered(&ids),
        updates,
        results: offline::results(),
        preferences: Preferences::load(),
        activity: activity::current(),
    })
}

fn download(events: &Events, _: Value) -> Result<(), String> {
    activity::start(events, Kind::Download, None, |task| {
        let updates: Vec<PackageId> = PackageUpdates::load(Mode::Quiet)?
            .system
            .into_iter()
            .map(|update| update.package)
            .collect();
        packagekit::prepare(&updates, task)
    })
}

fn install_firmware(events: &Events, Device { id }: Device) -> Result<(), String> {
    activity::start(events, Kind::Firmware, Some(id.clone()), move |task| {
        firmware::install(&id, task)
    })
}

fn firmware_updates(_: Value) -> Result<Vec<Firmware>, String> {
    if !firmware::available() {
        return Ok(Vec::new());
    }
    firmware::updates()
}

fn app_count(_: Value) -> Result<usize, String> {
    Ok(updates::app_count(&PackageUpdates::load(Mode::Quiet)?))
}

fn restart(_: Value) -> Result<(), String> {
    dbus::session()?
        .call_method(
            Some("org.gnome.SessionManager"),
            "/org/gnome/SessionManager",
            Some("org.gnome.SessionManager"),
            "Reboot",
            &(),
        )
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn set_preferences(preferences: Preferences) -> Result<(), String> {
    let previous = Preferences::load();
    preferences.save()?;
    if previous.schedule != preferences.schedule {
        schedule::apply(preferences.schedule)?;
    }
    Ok(())
}

fn open_apps(_: Value) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(APP_UPDATES, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .command("updates_overview", |_: Value| overview(false))
        .command("updates_check", |_: Value| overview(true))
        .with("updates_download", events, download)
        .command("updates_cancel", |_: Value| {
            activity::cancel();
            Ok(())
        })
        .command("updates_firmware", firmware_updates)
        .with("updates_firmware_install", events, install_firmware)
        .command("updates_app_count", app_count)
        .command("updates_restart", restart)
        .command("updates_set_preferences", set_preferences)
        .command("updates_open_apps", open_apps)
}
