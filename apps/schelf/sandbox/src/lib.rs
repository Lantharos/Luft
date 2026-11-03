//! The sandbox AppImages run in, started as `schelf --sandbox APP-ID ARGUMENT…`.

mod app;
mod confine;
mod escalate;
mod files;
mod inside;
mod launch;
mod open;
mod portal;
mod request;
mod scope;

use luft_i18n::{Localizer, localizer};
use luft_software::apps::appimage::SANDBOX;

static L10N: Localizer = localizer!("locales", ["sandbox"]);

pub use launch::{quit, running};

const SERVE: &str = "--sandbox-serve";
const CONFINE: &str = "--sandbox-confine";

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
        _ => None,
    }
}
