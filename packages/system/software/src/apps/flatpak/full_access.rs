use std::process::Command;

use luft_app::dbus::{self, service::Service, trusted_apps};

use super::transaction::friendly;
use crate::apps::operand::operand;

const TRUSTED_APPS: Service = Service {
    name: "com.lantharos.Updater1",
    path: "/com/lantharos/Updater1",
    interface: "com.lantharos.Updater1.TrustedApps",
};

const OPEN_SANDBOX: [&str; 9] = [
    "--filesystem=host",
    "--device=all",
    "--share=network",
    "--share=ipc",
    "--socket=session-bus",
    "--socket=system-bus",
    "--socket=ssh-auth",
    "--socket=gpg-agent",
    "--socket=pcsc",
];

pub fn has_full_access(app_id: &str) -> bool {
    trusted_apps::is_trusted(app_id)
}

/// Has Kestrel and Luft's services treat the app like one installed on the system, or stop
/// that. Asks for an administrator's password.
pub async fn set_trusted(app_id: &str, trusted: bool) -> Result<(), String> {
    if !trusted_apps::is_app_id(app_id) {
        return Err(format!("{app_id} isn't a Flatpak app."));
    }
    let method = if trusted { "Trust" } else { "Untrust" };
    TRUSTED_APPS
        .change::<_, ()>(method, &(app_id,))
        .await
        .map_err(|error| dbus::explain(&error))
}

/// Lets the app out of its sandbox for this account from the next time it starts.
pub fn open_sandbox(app_id: &str) -> Result<(), String> {
    override_sandbox(&[OPEN_SANDBOX.as_slice(), &["--", operand(app_id)?]].concat())
}

/// Puts the app back in its sandbox as it shipped.
pub fn reset_sandbox(app_id: &str) -> Result<(), String> {
    override_sandbox(&["--reset", "--", operand(app_id)?])
}

fn override_sandbox(arguments: &[&str]) -> Result<(), String> {
    let output = Command::new("flatpak")
        .args(["override", "--user"])
        .args(arguments)
        .output()
        .map_err(|_| "Flatpak isn't installed.".to_owned())?;
    if output.status.success() {
        Ok(())
    } else {
        Err(friendly(&String::from_utf8_lossy(&output.stderr)))
    }
}
