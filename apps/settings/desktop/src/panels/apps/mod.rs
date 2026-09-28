mod defaults;
mod icons;
pub(crate) mod info;
mod startup;

use sabine::SabineWindow;
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command("apps_defaults", |_: Value| Ok(defaults::list()))
        .command("apps_set_default", defaults::set)
        .command("apps_installed", |_: Value| Ok(startup::installed_apps()))
        .command("apps_startup", |_: Value| startup::list())
        .command("apps_startup_set", startup::set)
        .command("apps_startup_add", startup::add)
}
