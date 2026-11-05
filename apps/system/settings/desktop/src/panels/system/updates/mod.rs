mod firmware;
mod graphics;
mod image;
mod notice;
mod overview;
mod state;
mod store;
mod waiting;

use luft_app::dbus::{self, failed};
use luft_app::launch::{self, Token};
use luft_app::{Commands, Empty, Events};
use luft_software::system::image::{self as system_image, UpdatePolicy};
use luft_software::variant::Variant;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

use firmware::Firmware;
use state::{Activity, UpdateKind, UpdatesStatus};

pub use graphics::{CHECK_GRAPHICS_ARGUMENT, run as check_graphics};
use luft_i18n::t;

use crate::L10N;

const APP_UPDATES: &str = "schelf:updates";
const INSTALLED_APPS: &str = "schelf:installed";

#[derive(Deserialize, Type)]
struct FirmwareDevice {
    id: String,
}

#[derive(Deserialize, Type)]
struct VariantSwitch {
    variant: Variant,
}

fn load(Empty {}: Empty) -> Result<(), String> {
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

async fn policy(Empty {}: Empty) -> Result<UpdatePolicy, String> {
    system_image::policy().await
}

fn open_apps(Token { token }: Token) -> Result<(), String> {
    launch::open(APP_UPDATES, token.as_deref()).map_err(|error| error.to_string())
}

fn open_installed_apps(Token { token }: Token) -> Result<(), String> {
    launch::open(INSTALLED_APPS, token.as_deref()).map_err(|error| error.to_string())
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
        .command("updates_load", load)
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
        .command_async("updates_preferences", policy)
        .command_async("updates_set_preferences", system_image::set_policy)
        .command("updates_open_apps", open_apps)
        .command("updates_open_installed_apps", open_installed_apps)
}
