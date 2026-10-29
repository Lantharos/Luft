use std::os::unix::process::CommandExt;
use std::process::{Command, Stdio};

use crate::app::App;

pub const NO_SANDBOX: &str = "--no-sandbox";
const SABINE_FULL_ACCESS: &str = "SABINE_FULL_ACCESS";

fn namespace_sandbox_works() -> bool {
    Command::new("unshare")
        .args([
            "--user",
            "--map-root-user",
            "--net",
            "--pid",
            "--fork",
            "true",
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

/// Starts an app you gave full access to as any other program of yours.
/// Returns only when it can't be started.
pub fn exec(app: &App, arguments: Vec<String>) -> String {
    let mut command = Command::new(&app.image);
    command
        .env("DESKTOPINTEGRATION", "1")
        .env(SABINE_FULL_ACCESS, "1");
    if app.chromium
        && !arguments.iter().any(|argument| argument == NO_SANDBOX)
        && !namespace_sandbox_works()
    {
        command.arg(NO_SANDBOX);
    }
    command.args(arguments).exec().to_string()
}
