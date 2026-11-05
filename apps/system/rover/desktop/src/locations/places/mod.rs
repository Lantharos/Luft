mod recent;
mod trash;

use luft_app::{Commands, Empty};
use sabine::SabineWindow;

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("recent_files", |Empty {}| Ok(recent::files()))
        .command("trash_count", |Empty {}| trash::count())
}
