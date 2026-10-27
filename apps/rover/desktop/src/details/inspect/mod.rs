mod details;
mod open_with;

use luft_app::Commands;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
struct Target {
    path: String,
}

#[derive(Deserialize, Type)]
struct Opening {
    path: String,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
struct Launch {
    path: String,
    app: String,
    token: Option<String>,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("file_details", |Target { path }| details::inspect(&path))
        .command("apps_for_file", |Target { path }| {
            Ok(open_with::apps_for(&path))
        })
        .command("open_with_default", |Opening { path, token }| {
            open_with::launch_default(&path, token.as_deref())
        })
        .command("open_with_app", |Launch { path, app, token }| {
            open_with::launch(&path, &app, token.as_deref())
        })
}
