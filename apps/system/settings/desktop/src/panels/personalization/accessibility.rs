use gio::glib;
use luft_app::{Commands, Empty};
use sabine::SabineWindow;

const SCREEN_READER: &str = "orca";

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("accessibility_screen_reader", |Empty {}| {
        Ok(glib::find_program_in_path(SCREEN_READER).is_some())
    })
}
