use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use luft_app::{Activation, Commands, Empty};
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

use crate::desktop::links;
use crate::events;
use crate::launch::LaunchRequest;
use crate::pty::TerminalSize;
use crate::settings::{self, Settings};
use crate::state::TernState;

#[derive(Deserialize, Type)]
struct Terminal {
    id: u32,
}

#[derive(Deserialize, Type)]
struct Spawn {
    #[serde(flatten)]
    size: TerminalSize,
    directory: Option<String>,
    command: Option<Vec<String>>,
}

#[derive(Deserialize, Type)]
struct Input {
    id: u32,
    data: String,
}

#[derive(Deserialize, Type)]
struct Resize {
    id: u32,
    #[serde(flatten)]
    size: TerminalSize,
}

#[derive(Deserialize, Type)]
struct SettingsUpdate {
    settings: Settings,
}

#[derive(Deserialize, Type)]
struct Link {
    uri: String,
    token: Option<String>,
}

pub fn register(window: SabineWindow, state: &TernState) -> SabineWindow {
    register_app(register_terminals(events::declare(window), state), state)
}

fn register_terminals(window: SabineWindow, state: &TernState) -> SabineWindow {
    window
        .with(
            "pty_spawn",
            state,
            |state,
             Spawn {
                 size,
                 directory,
                 command,
             }| state.spawn(LaunchRequest { directory, command }, size),
        )
        .with("pty_attach", state, |state, Terminal { id }| {
            state.sessions.attach(id);
            Ok(())
        })
        .with("pty_write", state, |state, Input { id, data }| {
            let bytes = STANDARD.decode(data).map_err(|error| error.to_string())?;
            state.sessions.write(id, bytes);
            Ok(())
        })
        .with("pty_ack", state, |state, Terminal { id }| {
            state.sessions.acknowledge(id);
            Ok(())
        })
        .with("pty_resize", state, |state, Resize { id, size }| {
            state.sessions.resize(id, size)
        })
        .with("pty_foreground", state, |state, Terminal { id }| {
            Ok(state.sessions.foreground(id))
        })
        .with("pty_close", state, |state, Terminal { id }| {
            state.sessions.close(id);
            Ok(())
        })
}

fn register_app(window: SabineWindow, state: &TernState) -> SabineWindow {
    window
        .with_async("app_state", state, |state, Empty {}| async move {
            Ok(state.app_state().await)
        })
        .command("resolve_launch", |activation: Activation| {
            Ok(LaunchRequest::parse(&activation))
        })
        .with(
            "update_settings",
            state,
            |state, SettingsUpdate { settings }| settings::update(settings, &state.settings),
        )
        .command("open_link", |Link { uri, token }| {
            links::open(&uri, token.as_deref())
        })
}
