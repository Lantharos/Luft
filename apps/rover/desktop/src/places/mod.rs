mod recent;
mod trash;

use luft_app::Commands;
use sabine::SabineWindow;
use serde::Deserialize;

#[derive(Deserialize)]
struct Empty {}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("recent_files", |Empty {}| Ok(recent::files()))
        .command("trash_count", |Empty {}| trash::count())
}
