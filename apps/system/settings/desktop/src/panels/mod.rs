mod connections;
mod devices;
mod personalization;
mod protection;
mod system;

use luft_app::Events;
use sabine::SabineWindow;

pub use system::updates::{CHECK_GRAPHICS_ARGUMENT, check_graphics};

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = devices::hardware::register(window, events);
    let window = connections::network::register(window, events);
    let window = connections::bluetooth::register(window, events);
    let window = connections::post::register(window);
    let window = devices::display::register(window, events);
    let window = devices::sound::register(window, events);
    let window = devices::power::register(window, events);
    let window = devices::input::register(window, events);
    let window = devices::pen::register(window);
    let window = devices::printers::register(window, events);
    let window = personalization::appearance::register(window, events);
    let window = personalization::accessibility::register(window);
    let window = personalization::extensions::register(window, events);
    let window = personalization::taskbar::register(window);
    let window = system::apps::register(window, events);
    let window = protection::privacy::register(window);
    let window = protection::crash_reports::register(window);
    let window = protection::sharing::register(window, events);
    let window = protection::developer::register(window);
    let window = protection::passkeys::register(window, events);
    let window = protection::security::register(window, events);
    let window = protection::keyring::register(window, events);
    let window = protection::remote_login::register(window, events);
    let window = system::accounts::register(window, events);
    let window = system::language::register(window, events);
    let window = system::updates::register(window, events);
    system::about::register(window, events)
}
