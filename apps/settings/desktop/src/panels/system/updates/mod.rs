mod background;
mod firmware;
mod graphics;
mod image;
mod overview;
mod schedule;
mod state;
mod store;

use luft_app::dbus::{self, failed};
use luft_app::launch::{self, Token};
use luft_app::{Commands, Empty, Events};
use luft_software::variant::Variant;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;
use tokio::sync::OnceCell;

use firmware::Firmware;
use state::{Activity, UpdateKind, UpdatesStatus};
use store::Preferences;

pub use background::run as check_in_background;
pub use graphics::{CHECK_GRAPHICS_ARGUMENT, run as check_graphics};
use luft_i18n::t;
pub use schedule::CHECK_ARGUMENT;

use crate::L10N;

const APP_UPDATES: &str = "schelf:updates";

static FIRST_RUN: OnceCell<()> = OnceCell::const_new();

#[derive(Deserialize, Type)]
struct FirmwareDevice {
    id: String,
}

#[derive(Deserialize, Type)]
struct VariantSwitch {
    variant: Variant,
}

async fn load(Empty {}: Empty) -> Result<(), String> {
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
    luft_app::spawn(image::scan());
}

fn check(Empty {}: Empty) -> Result<(), String> {
    state::start(
        Activity::new(UpdateKind::Check),
        |task| overview::load(Some(task)),
        scan,
    );
    Ok(())
}

fn download(Empty {}: Empty) -> Result<(), String> {
    let started = state::start(Activity::new(UpdateKind::Download), image::download, || {
        overview::reload();
        scan();
    });
    started
        .then_some(())
        .ok_or_else(|| t!(L10N, "desktop-updates-already-downloading"))
}

fn rollback(Empty {}: Empty) -> Result<(), String> {
    let started = state::start(Activity::new(UpdateKind::Rollback), image::rollback, || {
        overview::reload();
        scan();
    });
    started
        .then_some(())
        .ok_or_else(|| t!(L10N, "desktop-updates-system-busy"))
}

fn switch(VariantSwitch { variant }: VariantSwitch) -> Result<(), String> {
    let activity = Activity {
        target: Some(variant.name().to_owned()),
        ..Activity::new(UpdateKind::Switch)
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
        .ok_or_else(|| t!(L10N, "desktop-updates-system-busy"))
}

fn install_firmware(FirmwareDevice { id }: FirmwareDevice) -> Result<(), String> {
    let activity = Activity {
        target: Some(id.clone()),
        ..Activity::new(UpdateKind::Firmware)
    };
    let started = state::start(activity, move |task| firmware::install(&id, task), scan);
    started
        .then_some(())
        .ok_or_else(|| t!(L10N, "desktop-updates-already-installing"))
}

async fn firmware_updates(Empty {}: Empty) -> Result<Vec<Firmware>, String> {
    if !firmware::available().await {
        return Ok(Vec::new());
    }
    firmware::updates().await
}

async fn restart(Empty {}: Empty) -> Result<(), String> {
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

fn open_apps(Token { token }: Token) -> Result<(), String> {
    launch::open(APP_UPDATES, token.as_deref()).map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    state::attach(events);
    image::watch();
    window
        .bridge_event(&state::ACTIVITY)
        .bridge_event(&state::OVERVIEW)
        .command("updates_status", |Empty {}| {
            Ok::<UpdatesStatus, String>(state::status())
        })
        .command_async("updates_load", load)
        .command("updates_check", check)
        .command("updates_download", download)
        .command("updates_cancel", |Empty {}| {
            state::cancel();
            Ok(())
        })
        .command_async("updates_firmware", firmware_updates)
        .command("updates_firmware_install", install_firmware)
        .command("updates_rollback", rollback)
        .command("updates_switch", switch)
        .command_async("updates_restart", restart)
        .command("updates_preferences", |Empty {}| {
            Ok::<Preferences, String>(Preferences::load())
        })
        .command_async("updates_set_preferences", set_preferences)
        .command("updates_open_apps", open_apps)
}
