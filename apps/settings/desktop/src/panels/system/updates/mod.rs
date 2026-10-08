mod background;
mod elsewhere;
mod firmware;
mod overview;
mod schedule;
mod state;
mod store;

use std::sync::Once;

use luft_app::{Commands, Events, dbus};
use luft_software::packagekit;
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use firmware::Firmware;
use state::{Activity, Kind, Status};
use store::Preferences;

pub use background::run as check_in_background;
pub use schedule::CHECK_ARGUMENT;

const APP_UPDATES: &str = "schelf:updates";

static FIRST_RUN: Once = Once::new();

#[derive(Deserialize)]
struct Device {
    id: String,
}

fn load(_: Value) -> Result<(), String> {
    FIRST_RUN.call_once(|| {
        if !Preferences::exists() {
            let preferences = Preferences::default();
            let _ = preferences
                .save()
                .and_then(|_| schedule::apply(preferences.schedule));
        }
    });
    if state::overview().is_none() {
        overview::reload();
    }
    Ok(())
}

fn check(_: Value) -> Result<(), String> {
    state::start(
        Activity::new(Kind::Check),
        |task| overview::load(Some(task)),
        elsewhere::scan,
    );
    Ok(())
}

fn download(_: Value) -> Result<(), String> {
    let started = state::start(
        Activity::new(Kind::Download),
        |task| packagekit::prepare(&overview::system_updates()?, task),
        || {
            overview::mark_prepared();
            elsewhere::scan();
        },
    );
    started
        .then_some(())
        .ok_or_else(|| "Something is already being downloaded.".into())
}

fn install_firmware(Device { id }: Device) -> Result<(), String> {
    let activity = Activity {
        target: Some(id.clone()),
        ..Activity::new(Kind::Firmware)
    };
    let started = state::start(
        activity,
        move |task| firmware::install(&id, task),
        elsewhere::scan,
    );
    started
        .then_some(())
        .ok_or_else(|| "Something is already being installed.".into())
}

fn firmware_updates(_: Value) -> Result<Vec<Firmware>, String> {
    if !firmware::available() {
        return Ok(Vec::new());
    }
    firmware::updates()
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
    state::attach(events);
    elsewhere::watch();
    window
        .command("updates_status", |_: Value| {
            Ok::<Status, String>(state::status())
        })
        .command("updates_load", load)
        .command("updates_check", check)
        .command("updates_download", download)
        .command("updates_cancel", |_: Value| {
            state::cancel();
            Ok(())
        })
        .command("updates_firmware", firmware_updates)
        .command("updates_firmware_install", install_firmware)
        .command("updates_restart", restart)
        .command("updates_preferences", |_: Value| {
            Ok::<Preferences, String>(Preferences::load())
        })
        .command("updates_set_preferences", set_preferences)
        .command("updates_open_apps", open_apps)
}
