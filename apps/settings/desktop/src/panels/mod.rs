mod connections;
mod devices;
mod personalization;
mod protection;
mod system;

use luft_app::Events;
use sabine::SabineWindow;

pub use system::updates::{
    CHECK_ARGUMENT, CHECK_GRAPHICS_ARGUMENT, check_graphics, check_in_background,
};

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = devices::hardware::register(window, events);
    let window = connections::network::register(window, events);
    let window = connections::bluetooth::register(window, events);
    let window = devices::display::register(window, events);
    let window = devices::sound::register(window, events);
    let window = devices::power::register(window, events);
    let window = devices::input::register(window, events);
    let window = personalization::appearance::register(window, events);
    let window = personalization::notifications::register(window, events);
    let window = personalization::accessibility::register(window);
    let window = protection::apps::register(window, events);
    let window = protection::privacy::register(window, events);
    let window = protection::passkeys::register(window, events);
    let window = protection::security::register(window, events);
    let window = protection::keyring::register(window, events);
    let window = system::accounts::register(window, events);
    let window = system::language::register(window, events);
    let window = system::updates::register(window, events);
    system::about::register(window, events)
}
