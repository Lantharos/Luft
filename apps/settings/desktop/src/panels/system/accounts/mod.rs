mod login;
mod online;
pub(crate) mod users;

use luft_app::Events;
use sabine::SabineWindow;

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = users::register(window, events);
    let window = online::register(window, events);
    login::register(window, events)
}
