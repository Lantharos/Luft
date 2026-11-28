use luft_app::dbus::service::{Service, absent, get};
use luft_app::dbus::{error_message, error_name, failed};
use luft_app::{Commands, Empty};
use luft_i18n::t;
use sabine::SabineWindow;

use crate::L10N;

const INSTALLER: Service = Service {
    name: "com.lantharos.Installer1",
    path: "/com/lantharos/Installer1",
    interface: "com.lantharos.Installer1",
};
const INSTALLED: &str = "installed";

async fn erasable(Empty {}: Empty) -> Result<bool, String> {
    Ok(INSTALLER
        .read()
        .await?
        .and_then(|properties| get::<String>(&properties, "Phase"))
        .is_some_and(|phase| phase == INSTALLED))
}

async fn erase(Empty {}: Empty) -> Result<(), String> {
    INSTALLER.change("Erase", &()).await.map_err(|error| {
        let refused = error_name(&error).is_some_and(|name| name.ends_with("NotAuthorized"));
        match error_message(&error) {
            _ if refused => t!(L10N, "desktop-admin-required"),
            Some(message) => message.to_owned(),
            None if absent(&error) => t!(L10N, "desktop-erase-unavailable"),
            None => failed(error),
        }
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("erase_available", erasable)
        .command_async("erase_everything", erase)
}
