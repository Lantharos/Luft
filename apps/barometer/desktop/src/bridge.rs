use luft_app::{Appearance, Commands};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use crate::monitor::Monitor;
use crate::settings;
use crate::tasks::{control, details};

#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    settings: Option<Value>,
}

pub fn register(window: SabineWindow, monitor: &Monitor) -> SabineWindow {
    window
        .command("app_state", |_: Value| {
            Ok(AppState {
                appearance: Appearance::current(),
                settings: settings::read(),
            })
        })
        .command("settings_write", settings::write)
        .with("monitor_view", monitor, Monitor::view)
        .with("monitor_configure", monitor, Monitor::configure)
        .with("monitor_snapshot", monitor, Monitor::snapshot)
        .command("process_details", details::read)
        .with("app_signal", monitor, Monitor::signal_app)
        .command("process_signal", control::signal_processes)
        .command("process_priority", control::renice)
}
