use std::fs::DirBuilder;
use std::os::unix::fs::DirBuilderExt;
use std::path::Path;

use portguard::mode::{Mode, Rules};
use portguard::store::Store;
use portguard::usb;

const RUNTIME: &str = "/run/portguard";
const DEFAULT_ROOT: &str = "/sysroot";

/// Applies the mode to what is plugged in before the system starts, from
/// the startup image once the system disk is open: what the mode keeps out
/// is disconnected, and what comes next waits for portguard.
fn main() -> std::io::Result<()> {
    let root = std::env::args_os().nth(1);
    let store = Store::under(Path::new(root.as_deref().unwrap_or(DEFAULT_ROOT.as_ref())));
    let mode = store.mode();
    if !matches!(mode, Mode::KnownOnly | Mode::NoDrives) {
        return Ok(());
    }
    DirBuilder::new()
        .mode(0o700)
        .recursive(true)
        .create(RUNTIME)?;
    usb::hold(Rules { mode, locked: true });
    match mode {
        Mode::KnownOnly => usb::turn_away_unknown(&store.trusted()),
        _ => usb::turn_away_drives(),
    }
    Ok(())
}
