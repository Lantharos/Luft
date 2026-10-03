use gio::glib;
use luft_app::Commands;
use sabine::SabineWindow;
use serde_json::Value;

const SCREEN_READER: &str = "orca";

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("accessibility_screen_reader", |_: Value| {
        Ok(glib::find_program_in_path(SCREEN_READER).is_some())
    })
}
