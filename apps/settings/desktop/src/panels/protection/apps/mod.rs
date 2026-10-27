mod defaults;
mod permissions;
mod startup;

use luft_app::{Commands, Empty, Events};
use sabine::SabineWindow;

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .command("apps_defaults", |Empty {}| Ok(defaults::list()))
        .command("apps_set_default", defaults::set)
        .command("apps_installed", |Empty {}| Ok(startup::installed_apps()))
        .command("apps_startup", |Empty {}| startup::list())
        .command("apps_startup_set", startup::set)
        .command("apps_startup_add", startup::add);
    permissions::register(window, events)
}
