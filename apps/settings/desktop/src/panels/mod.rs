mod about;
mod appearance;
mod apps;
mod bluetooth;
mod datetime;
mod display;
mod keyboard;
mod keyring;
mod login;
mod mouse;
mod network;
mod notifications;
mod passkeys;
mod power;
mod privacy;
mod security;
mod sound;
mod updates;
mod users;

use luft_app::Events;
use sabine::SabineWindow;

pub use updates::{CHECK_ARGUMENT, check_in_background};

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = network::register(window, events);
    let window = bluetooth::register(window, events);
    let window = display::register(window, events);
    let window = sound::register(window, events);
    let window = power::register(window, events);
    let window = appearance::register(window, events);
    let window = notifications::register(window, events);
    let window = keyboard::register(window, events);
    let window = mouse::register(window, events);
    let window = apps::register(window, events);
    let window = privacy::register(window, events);
    let window = passkeys::register(window, events);
    let window = security::register(window, events);
    let window = keyring::register(window, events);
    let window = datetime::register(window, events);
    let window = users::register(window, events);
    let window = login::register(window, events);
    let window = updates::register(window, events);
    about::register(window, events)
}
