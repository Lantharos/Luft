mod cursors;
mod fonts;
pub mod wallpaper;

use luft_app::{Commands, Events};
use sabine::SabineWindow;

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = cursors::register(window, events);
    wallpaper::register(window, events)
        .command("appearance_fonts", fonts::list)
        .command("appearance_font_open", fonts::open)
        .command("appearance_font_remove", fonts::remove)
        .command("appearance_font_defaults", fonts::defaults)
        .command("appearance_font_use", fonts::use_family)
        .command("appearance_font_reset", fonts::reset)
}
