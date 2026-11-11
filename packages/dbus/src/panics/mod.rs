//! Panics of Luft's programs, kept in the journal in the shape Luft's crash
//! collector reads, which it is told about right away. See
//! [docs/crash-reports.md](../../../../docs/crash-reports.md).

mod frames;
mod journal;

use std::os::unix::net::UnixDatagram;
use std::panic::PanicHookInfo;
use std::path::PathBuf;
use std::sync::Once;

pub use frames::build_id;

pub const MESSAGE_ID: &str = "00e5f8b8beb646d9a16444f1f70152be";

const COLLECTOR: &str = "/run/luft-crash-collector/poke";
const DEVELOPMENT_COLLECTOR: &str = "LUFT_CRASH_COLLECTOR_POKE";
const INSTALLED: &str = "/usr/";
const LONGEST_MESSAGE: usize = 2048;

/// Records every panic of this program for Luft's crash reports, then lets
/// the hook that was there before print it as usual.
pub fn report() {
    static REPORTING: Once = Once::new();
    REPORTING.call_once(|| {
        let previous = std::panic::take_hook();
        std::panic::set_hook(Box::new(move |info| {
            record(info);
            previous(info);
        }));
    });
}

fn message(info: &PanicHookInfo<'_>) -> String {
    let payload = info.payload();
    let message = payload
        .downcast_ref::<&str>()
        .copied()
        .or_else(|| payload.downcast_ref::<String>().map(String::as_str))
        .unwrap_or("Box<dyn Any>");
    message.chars().take(LONGEST_MESSAGE).collect()
}

fn record(info: &PanicHookInfo<'_>) {
    let message = message(info);
    let location = info
        .location()
        .map(|place| format!("{}:{}:{}", place.file(), place.line(), place.column()))
        .unwrap_or_default();
    let stack = frames::current();
    let program = std::env::current_exe().unwrap_or_default();
    journal::send(&[
        ("MESSAGE", &format!("Panicked at {location}: {message}")),
        ("PRIORITY", "2"),
        ("MESSAGE_ID", MESSAGE_ID),
        ("LUFT_PANIC_MESSAGE", &message),
        ("LUFT_PANIC_LOCATION", &location),
        ("LUFT_PANIC_PROGRAM", &program.to_string_lossy()),
        ("LUFT_PANIC_BUILD_ID", &stack.build),
        ("LUFT_PANIC_FRAMES", &stack.frames),
    ]);
    tell_collector();
}

/// Where the collector listens: always its socket in `/run`, except for a
/// development build, which a test session can point at its own collector.
fn collector() -> PathBuf {
    let installed = std::env::current_exe().is_ok_and(|program| program.starts_with(INSTALLED));
    std::env::var_os(DEVELOPMENT_COLLECTOR)
        .filter(|_| !installed)
        .map_or_else(|| COLLECTOR.into(), PathBuf::from)
}

/// Tells the collector something new is in the journal.
pub fn tell_collector() {
    if let Ok(socket) = UnixDatagram::unbound() {
        let _ = socket.send_to(b"look", collector());
    }
}
