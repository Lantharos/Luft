mod datetime;
mod region;

use luft_app::Events;
use sabine::SabineWindow;

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = datetime::register(window, events);
    region::register(window)
}
