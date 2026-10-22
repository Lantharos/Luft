//! The sandbox AppImages run in, started as `schelf --sandbox APP-ID ARGUMENT…`.

mod app;
mod escalate;
mod files;
mod inside;
mod launch;
mod request;
mod scope;

use luft_i18n::{Localizer, localizer};
use luft_software::apps::appimage::SANDBOX;

static L10N: Localizer = localizer!("locales", ["sandbox"]);

const SERVE: &str = "--sandbox-serve";

/// Runs the app or the sandbox's own server when that's what the command
/// line asks for, and returns the exit status.
pub fn run(arguments: &[String]) -> Option<i32> {
    let called = std::env::args().next()?;
    if std::path::Path::new(&called).file_name()? == scope::SYSTEMD_RUN {
        return Some(scope::run_here(arguments));
    }
    match arguments.split_first()? {
        (flag, [id, rest @ ..]) if flag == SANDBOX => Some(launch::run(id, rest.to_vec())),
        (flag, rest) if flag == SERVE => Some(inside::serve(rest.to_vec())),
        _ => None,
    }
}
