use luft_app::{Appearance, Commands};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;
use specta::Type;

use crate::monitor::Monitor;
use crate::settings;
use crate::tasks::{control, details};

#[derive(Serialize, Type)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    settings: Option<Value>,
}

pub fn register(window: SabineWindow, monitor: &Monitor) -> SabineWindow {
    window
        .command("sample_system", |_: Value| {
            Ok::<_, String>(luft_app::sample_system())
        })
        .command_async("app_state", |_: Value| async {
            Ok(AppState {
                appearance: Appearance::current().await,
                settings: settings::read(),
            })
        })
        .command("settings_write", settings::write)
        .with("monitor_view", monitor, Monitor::view)
        .with("monitor_configure", monitor, Monitor::configure)
        .with("monitor_snapshot", monitor, Monitor::snapshot)
        .command("process_details", details::read)
        .with("app_signal", monitor, Monitor::signal_app)
        .with("app_stop", monitor, Monitor::stop_app)
        .command("app_open", control::open_app)
        .command("process_signal", control::signal_processes)
        .command("process_priority", control::renice)
}
