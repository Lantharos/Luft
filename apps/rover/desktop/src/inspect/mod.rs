mod details;
mod open_with;

use luft_app::Commands;
use sabine::SabineWindow;
use serde::Deserialize;

#[derive(Deserialize)]
struct Target {
    path: String,
}

#[derive(Deserialize)]
struct Launch {
    path: String,
    app: String,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("file_details", |Target { path }| details::inspect(&path))
        .command("apps_for_file", |Target { path }| {
            Ok(open_with::apps_for(&path))
        })
        .command("open_with_app", |Launch { path, app }| {
            open_with::launch(&path, &app)
        })
}
