mod accounts;
mod bridge;
mod events;
mod mail;
mod protocols;
mod services;
mod state;
mod store;
mod sync;

use luft_app::GlassWindow;
use state::MailmanState;

pub const APP_ID: &str = "com.lantharos.mailman";

const WINDOW: GlassWindow = GlassWindow {
    title: "Mailman",
    size: (1520, 900),
    min_size: (820, 520),
    sidebar_width: 248,
    single_instance: Some(APP_ID),
};

pub fn run_app() -> ! {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let state = MailmanState::new();
    let started = state.clone();
    luft_app::run(
        &state.events,
        |window| bridge::register(WINDOW.apply(window), &state),
        move |_| started.start(),
    )
}
