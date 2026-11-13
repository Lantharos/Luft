//! The sandbox AppImages run in, started as `schelf --sandbox APP-ID ARGUMENT…`,
//! and `schelf --watch-drives`, which asks you when a Flatpak app looks for a
//! drive it wasn't given.

mod app;
mod confine;
mod drives;
mod escalate;
mod files;
mod flatpaks;
mod inside;
mod launch;
mod open;
mod portal;
mod pulse;
mod request;
mod scope;

use luft_i18n::{Localizer, localizer};
use luft_software::apps::appimage::SANDBOX;

static L10N: Localizer = localizer!("locales", ["sandbox"]);

use luft_software::apps::flatpak;

/// Whether the AppImage or Flatpak app is open now.
pub fn running(id: &str) -> Result<bool, String> {
    if flatpak::is_installed(id) {
        Ok(flatpaks::running(id))
    } else {
        launch::running(id)
    }
}

/// Asks the running app to quit, as closing it would, and waits until it
/// has. Returns whether it was running.
pub fn quit(id: &str) -> Result<bool, String> {
    if flatpak::is_installed(id) {
        flatpaks::quit(id)
    } else {
        launch::quit(id)
    }
}

const SERVE: &str = "--sandbox-serve";
const CONFINE: &str = "--sandbox-confine";
const WATCH_DRIVES: &str = "--watch-drives";

/// Runs the app or the sandbox's own server when that's what the command
/// line asks for, and returns the exit status.
pub fn run(arguments: &[String]) -> Option<i32> {
    let called = std::env::args().next()?;
    match std::path::Path::new(&called).file_name()?.to_str()? {
        scope::SYSTEMD_RUN => return Some(scope::run_here(arguments)),
        open::XDG_OPEN => return Some(open::run(arguments)),
        _ => {}
    }
    match arguments.split_first()? {
        (flag, [id, rest @ ..]) if flag == SANDBOX => Some(launch::run(id, rest.to_vec())),
        (flag, rest) if flag == SERVE => Some(inside::serve(rest.to_vec())),
        (flag, command) if flag == CONFINE => Some(confine::exec(command)),
        (flag, []) if flag == WATCH_DRIVES => Some(drives::watch()),
        _ => None,
    }
}
