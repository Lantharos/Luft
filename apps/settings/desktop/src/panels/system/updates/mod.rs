mod backend;
mod background;
mod elsewhere;
mod firmware;
mod graphics;
mod image;
mod overview;
mod packages;
mod schedule;
mod state;
mod store;

use luft_app::dbus::{self, failed};
use luft_app::{Commands, Events};
use luft_software::variant::Variant;
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;
use tokio::sync::OnceCell;

use firmware::Firmware;
use state::{Activity, Kind, Status};
use store::Preferences;

pub use background::run as check_in_background;
pub use graphics::{CHECK_GRAPHICS_ARGUMENT, run as check_graphics};
pub use schedule::CHECK_ARGUMENT;

const APP_UPDATES: &str = "schelf:updates";

static FIRST_RUN: OnceCell<()> = OnceCell::const_new();

#[derive(Deserialize)]
struct Device {
    id: String,
}

#[derive(Deserialize)]
struct Switch {
    variant: Variant,
}

async fn load(_: Value) -> Result<(), String> {
    FIRST_RUN
        .get_or_init(|| async {
            if Preferences::exists() {
                return;
            }
            let preferences = Preferences::default();
            if preferences.save().is_ok() {
                let _ = schedule::apply(preferences.schedule).await;
            }
        })
        .await;
    if state::overview().is_none() {
        overview::reload();
    }
    Ok(())
}

fn scan() {
    backend::current().scan();
}

fn check(_: Value) -> Result<(), String> {
    state::start(
        Activity::new(Kind::Check),
        |task| overview::load(Some(task)),
        scan,
    );
    Ok(())
}

fn download(_: Value) -> Result<(), String> {
    let started = state::start(
        Activity::new(Kind::Download),
        |task| backend::current().download(task),
        || {
            backend::current().downloaded();
            scan();
        },
    );
    started
        .then_some(())
        .ok_or_else(|| "Something is already being downloaded.".into())
}

fn rollback(_: Value) -> Result<(), String> {
    let started = state::start(
        Activity::new(Kind::Rollback),
        |task| backend::current().rollback(task),
        || {
            overview::reload();
            scan();
        },
    );
    started
        .then_some(())
        .ok_or_else(|| "Something else is changing the system right now.".into())
}

fn switch(Switch { variant }: Switch) -> Result<(), String> {
    let activity = Activity {
        target: Some(variant.name().to_owned()),
        ..Activity::new(Kind::Switch)
    };
    let started = state::start(
        activity,
        move |task| image::switch(variant, task),
        || {
            overview::reload();
            scan();
        },
    );
    started
        .then_some(())
        .ok_or_else(|| "Something else is changing the system right now.".into())
}

fn install_firmware(Device { id }: Device) -> Result<(), String> {
    let activity = Activity {
        target: Some(id.clone()),
        ..Activity::new(Kind::Firmware)
    };
    let started = state::start(activity, move |task| firmware::install(&id, task), scan);
    started
        .then_some(())
        .ok_or_else(|| "Something is already being installed.".into())
}

async fn firmware_updates(_: Value) -> Result<Vec<Firmware>, String> {
    if !firmware::available().await {
        return Ok(Vec::new());
    }
    firmware::updates().await
}

async fn restart(_: Value) -> Result<(), String> {
    dbus::session()
        .await?
        .call_method(
            Some("org.gnome.SessionManager"),
            "/org/gnome/SessionManager",
            Some("org.gnome.SessionManager"),
            "Reboot",
            &(),
        )
        .await
        .map(|_| ())
        .map_err(failed)
}

async fn set_preferences(preferences: Preferences) -> Result<(), String> {
    let previous = Preferences::load();
    preferences.save()?;
    if previous.schedule != preferences.schedule {
        schedule::apply(preferences.schedule).await?;
    }
    Ok(())
}

fn open_apps(_: Value) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(APP_UPDATES, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    state::attach(events);
    backend::current().watch();
    window
        .command("updates_status", |_: Value| {
            Ok::<Status, String>(state::status())
        })
        .command_async("updates_load", load)
        .command("updates_check", check)
        .command("updates_download", download)
        .command("updates_cancel", |_: Value| {
            state::cancel();
            Ok(())
        })
        .command_async("updates_firmware", firmware_updates)
        .command("updates_firmware_install", install_firmware)
        .command("updates_rollback", rollback)
        .command("updates_switch", switch)
        .command_async("updates_restart", restart)
        .command("updates_preferences", |_: Value| {
            Ok::<Preferences, String>(Preferences::load())
        })
        .command_async("updates_set_preferences", set_preferences)
        .command("updates_open_apps", open_apps)
}
