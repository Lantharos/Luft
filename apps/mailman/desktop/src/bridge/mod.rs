mod accounts;
mod compose;
mod mail;
mod params;

use luft_app::Commands;
use sabine::SabineWindow;

use crate::state::MailmanState;
use params::*;

pub fn register(window: SabineWindow, state: &MailmanState) -> SabineWindow {
    let window = window
        .with_async("app_state", state, |state, Empty {}| state.app_state())
        .with("take_opening", state, |state, Empty {}| {
            Ok(state.notifier.take_opening())
        })
        .with("set_focused", state, |state, Focus { focused }| {
            state.notifier.set_focused(focused);
            Ok(())
        })
        .with(
            "save_settings",
            state,
            |state, SaveSettings { settings }| {
                state.notifier.set_enabled(settings.notifications);
                state.store.save_settings(&settings)
            },
        );
    let window = accounts::register(window, state);
    let window = mail::register(window, state);
    compose::register(window, state)
}
