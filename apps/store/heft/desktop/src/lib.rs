mod bridge;
mod camera;
mod handwriting;
mod library;
mod processing;
mod recording;
mod state;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{LazyLock, OnceLock};

use luft_app::{Events, GlassWindow};
use sabine::{BridgeEvent, SabineProcessHandle, SabineWindow, WindowVisibility};

const WINDOW: GlassWindow = GlassWindow {
    title: "Heft",
    size: (1280, 820),
    min_size: (560, 480),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.Heft"),
};

/// Sent to see whether a window is still there to hear it.
const PRESENT: BridgeEvent<()> = BridgeEvent::new("window.present");

pub static EVENTS: LazyLock<Events> = LazyLock::new(Events::default);
static PROCESS: OnceLock<SabineProcessHandle> = OnceLock::new();
static SHOWN: AtomicBool = AtomicBool::new(false);

fn launch_activation_token() -> Option<String> {
    ["XDG_ACTIVATION_TOKEN", "DESKTOP_STARTUP_ID"]
        .into_iter()
        .find_map(|name| std::env::var(name).ok())
        .filter(|token| !token.trim().is_empty())
}

/// Heft runs on when its window closes during a recording, so the class
/// keeps being recorded, and quits when it closes with nothing recording.
/// A window that closed has left the bridge by the time it's reported
/// hidden, while a minimized one still hears events.
fn visibility_changed(visibility: WindowVisibility) {
    if visibility.visible {
        SHOWN.store(true, Ordering::Relaxed);
        return;
    }
    let closed = SHOWN.load(Ordering::Relaxed) && !EVENTS.emit(PRESENT, ());
    if closed
        && !recording::active()
        && let Some(process) = PROCESS.get()
    {
        process.quit();
    }
}

fn window(window: SabineWindow) -> SabineWindow {
    bridge::register(WINDOW.apply(window))
        .bridge_event(&PRESENT)
        .background()
        .on_launched(|process| {
            process.present(launch_activation_token());
            let _ = PROCESS.set(process);
        })
        .on_visibility_changed(visibility_changed)
}

pub fn run_app() -> ! {
    luft_app::run(&EVENTS, window, |events| {
        library::backups::start();
        luft_app::spawn(handwriting::watch(events.clone()));
        processing::watch(&events);
    })
}
