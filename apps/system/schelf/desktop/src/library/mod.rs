mod opening;
mod sandbox;
mod settings;

use gio::prelude::*;
use luft_app::apps::{App, custom_icon};
use luft_app::{Commands, Empty};
use luft_software::apps::flatpak::{self, Installation, Permissions};
use sabine::SabineWindow;
use schelf_core::library::{self, InstalledApp, Source};
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct FlatpakRef {
    installation: Installation,
    reference: String,
}

/// Flatpak apps by the name and icon their menu entries give them, and
/// every app with the icon you chose for it.
fn installed() -> Vec<InstalledApp> {
    let mut apps = library::installed();
    for app in &mut apps {
        let Some(desktop) = app.desktop.clone() else {
            continue;
        };
        if app.source == Source::Flatpak
            && let Some(info) = gio_unix::DesktopAppInfo::new(&desktop)
        {
            app.summary = info.description().map(|text| text.to_string());
            let named = App::new(desktop.clone(), &info);
            app.name = named.name;
            app.icon = named.icon;
        }
        if let Some(icon) = custom_icon(&desktop) {
            app.icon = Some(icon.to_string_lossy().into_owned());
        }
    }
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}

fn launch_desktop(desktop: &str, token: Option<&str>) -> Result<(), String> {
    let info =
        gio_unix::DesktopAppInfo::new(desktop).ok_or("That app isn't installed any more.")?;
    luft_app::launch::start(info.upcast_ref(), &[], token).map_err(|error| error.to_string())
}

fn permissions(
    FlatpakRef {
        installation,
        reference,
    }: FlatpakRef,
) -> Result<Permissions, String> {
    flatpak::permissions(installation, &reference)
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("library_installed", |Empty {}| Ok(installed()))
        .command_async("library_open", opening::open)
        .command("library_permissions", permissions)
        .command_async("library_sandbox", sandbox::sandbox)
        .command_async("library_set_sandbox_switch", sandbox::set_switch)
        .command_async("library_full_access", sandbox::has_full_access)
        .command_async("library_set_full_access", sandbox::set_full_access)
        .command_async("library_restart", sandbox::restart)
        .command("library_custom_icons", settings::icons::state)
        .command_async("library_choose_icon", settings::icons::choose)
        .command_async(
            "library_choose_symbolic_icon",
            settings::icons::choose_symbolic,
        )
        .command("library_reset_icons", settings::icons::reset)
        .command("library_names", settings::names::state)
        .command("library_rename", settings::names::rename)
        .command("library_notifications", settings::notifications::state)
        .command("library_set_notification", settings::notifications::set)
}
