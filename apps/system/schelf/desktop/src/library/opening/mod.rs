mod diagnosis;
mod watch;

use gio::prelude::*;
use gio_unix::DesktopAppInfo;
use luft_software::system::system_packages;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::Source;
use diagnosis::Missing;
use watch::Outcome;

const DBUS_ACTIVATABLE: &str = "DBusActivatable";
const LAST_LINES: usize = 12;

#[derive(Deserialize, Type)]
pub struct Opening {
    desktop: String,
    token: Option<String>,
    source: Source,
}

/// Why an app closed right after it started.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Failure {
    crashed: bool,
    missing: Option<Missing>,
    /// The system package that provides what's missing.
    package: Option<String>,
    output: Vec<String>,
}

/// Starts the app, as a process to follow unless D-Bus started it.
fn start(desktop: &str, token: Option<&str>) -> Result<Option<watch::Started>, String> {
    let info = DesktopAppInfo::new(desktop).ok_or("That app isn't installed any more.")?;
    if info.boolean(DBUS_ACTIVATABLE) {
        return luft_app::launch::start(info.upcast_ref(), &[], token)
            .map(|()| None)
            .map_err(|error| error.to_string());
    }
    watch::start(&info, token).map(Some)
}

/// Starts the app the way the Start menu does. When it closes again within a few seconds, says
/// why, as far as its output tells.
pub async fn open(
    Opening {
        desktop,
        token,
        source,
    }: Opening,
) -> Result<Option<Failure>, String> {
    let outcome = tokio::task::spawn_blocking(move || {
        start(&desktop, token.as_deref()).map(|started| started.map(watch::follow))
    })
    .await
    .map_err(|error| error.to_string())??;
    let Some(Outcome::Closed { status, output }) = outcome else {
        return Ok(None);
    };
    let missing = diagnosis::missing(&output);
    let package = match (&missing, source) {
        (Some(missing), Source::System) => system_packages::provider(&missing.capability())
            .await
            .inspect_err(|error| eprintln!("Looking up what provides {missing:?}: {error}"))
            .unwrap_or_default(),
        _ => None,
    };
    let skipped = output.len().saturating_sub(LAST_LINES);
    Ok(Some(Failure {
        crashed: libc::WIFSIGNALED(status),
        missing,
        package,
        output: output.into_iter().skip(skipped).collect(),
    }))
}
