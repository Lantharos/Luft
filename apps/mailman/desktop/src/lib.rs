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
use sabine::SabineWindow;
use state::MailmanState;

pub const APP_ID: &str = "com.lantharos.mailman";
pub const BACKGROUND: &str = "--background";

const WINDOW: GlassWindow = GlassWindow {
    title: "Mailman",
    size: (1520, 900),
    min_size: (560, 520),
    sidebar_width: 248,
    single_instance: Some(APP_ID),
};

fn window(window: SabineWindow, state: &MailmanState, background: bool) -> SabineWindow {
    let attached = state.notifier.clone();
    let unfocused = state.notifier.clone();
    let window = WINDOW
        .apply(window)
        .on_launched(move |process| attached.attach(process))
        .on_visibility_changed(move |visibility| {
            if !visibility.visible {
                unfocused.set_focused(false);
            }
        });
    bridge::register(
        if background {
            window.background()
        } else {
            window
        },
        state,
    )
}

pub fn run_app() -> ! {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let background = std::env::args().any(|argument| argument == BACKGROUND);
    let state = MailmanState::new();
    let started = state.clone();
    luft_app::run(
        &state.events,
        |sabine| window(sabine, &state, background),
        move |_| started.start(),
    )
}
