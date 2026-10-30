use std::os::unix::process::CommandExt;
use std::process::{Command, Stdio};

use super::folder::Folder;
use super::profile::{data_folder, home};
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

fn command(app: &App, arguments: Vec<String>) -> Result<Command, String> {
    let data = data_folder(&home()?, &app.id)?;
    let mut command = Command::new(&app.image);
    command
        .env("DESKTOPINTEGRATION", "1")
        .env(SABINE_FULL_ACCESS, "1")
        .env("XDG_CONFIG_HOME", data.join(".config"))
        .env("XDG_DATA_HOME", data.join(".local/share"))
        .env("XDG_CACHE_HOME", data.join(".cache"))
        .env("XDG_STATE_HOME", data.join(".local/state"));
    if app.chromium
        && !arguments.iter().any(|argument| argument == NO_SANDBOX)
        && !namespace_sandbox_works()
    {
        command.arg(NO_SANDBOX);
    }
    command.args(arguments);
    Ok(command)
}

/// Runs an app you gave full access to as any other program of yours,
/// keeping its own files in the same folder its sandbox would, and waits
/// for it so later launches find it running.
pub fn run(app: &App, folder: &Folder, arguments: Vec<String>) -> Result<i32, String> {
    let mut child = command(app, arguments)?
        .spawn()
        .map_err(|error| error.to_string())?;
    folder.record_unsandboxed(child.id())?;
    let status = child.wait().map_err(|error| error.to_string());
    folder.forget_unsandboxed();
    Ok(status?.code().unwrap_or(1))
}

/// Hands a launch to the copy of the app already running without a
/// sandbox, which passes it on to its open window itself.
pub fn hand_over(app: &App, arguments: Vec<String>) -> String {
    match command(app, arguments) {
        Ok(mut command) => command.exec().to_string(),
        Err(error) => error,
    }
}
