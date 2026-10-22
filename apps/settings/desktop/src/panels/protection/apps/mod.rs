mod defaults;
mod permissions;
mod startup;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde_json::Value;

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .command("apps_defaults", |_: Value| Ok(defaults::list()))
        .command("apps_set_default", defaults::set)
        .command("apps_installed", |_: Value| Ok(startup::installed_apps()))
        .command("apps_startup", |_: Value| startup::list())
        .command("apps_startup_set", startup::set)
        .command("apps_startup_add", startup::add);
    permissions::register(window, events)
}
