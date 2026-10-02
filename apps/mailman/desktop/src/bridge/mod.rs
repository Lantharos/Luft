mod accounts;
mod compose;
mod mail;
mod params;

use std::path::Path;

use luft_app::Commands;
use sabine::SabineWindow;

use crate::services::launch;
use crate::state::MailmanState;
use params::*;

pub fn register(window: SabineWindow, state: &MailmanState) -> SabineWindow {
    let window = window
        .with("app_state", state, |state, Empty {}| state.app_state())
        .command(
            "resolve_arguments",
            |Arguments {
                 arguments,
                 working_directory,
             }| {
                let cwd = working_directory.unwrap_or_else(|| "/".into());
                Ok(launch::resolve(
                    arguments.get(1..).unwrap_or_default(),
                    Path::new(&cwd),
                ))
            },
        )
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
