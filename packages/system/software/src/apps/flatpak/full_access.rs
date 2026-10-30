use std::process::Command;

use luft_app::dbus::{self, failed};
use luft_app::identity::permissions;
use tokio::task::spawn_blocking;

use super::transaction::friendly;
use crate::apps::operand::operand;

const EVERYTHING: [&str; 1] = ["--filesystem=host"];
const EVERYTHING_BUT_HOME: [&str; 6] = [
    "--filesystem=host-os",
    "--filesystem=host-etc",
    "--filesystem=/run/media",
    "--filesystem=/media",
    "--filesystem=/mnt",
    "--filesystem=/var/mnt",
];
const OPEN_SANDBOX: [&str; 8] = [
    "--device=all",
    "--share=network",
    "--share=ipc",
    "--socket=session-bus",
    "--socket=system-bus",
    "--socket=ssh-auth",
    "--socket=gpg-agent",
    "--socket=pcsc",
];

pub async fn has_full_access(app_id: &str) -> bool {
    match dbus::session().await {
        Ok(session) => permissions::allowed(session, &permissions::FULL_ACCESS, app_id).await,
        Err(_) => false,
    }
}

/// Lets the app out of its sandbox for this account and has Kestrel and Luft's services treat
/// it as you, or puts it back in its sandbox as it shipped. Applies from the next time it starts.
pub async fn set_full_access(app_id: &str, on: bool) -> Result<(), String> {
    let id = operand(app_id)?.to_owned();
    let session = dbus::session().await?;
    let record = |allowed| async move {
        permissions::set(
            session,
            permissions::FULL_ACCESS.table,
            permissions::FULL_ACCESS.id,
            app_id,
            allowed,
        )
        .await
        .map_err(|error| dbus::explain(&error))
    };
    if on {
        override_sandbox(id, true).await?;
        record(true).await
    } else {
        record(false).await?;
        override_sandbox(id, false).await
    }
}

/// Whether the app keeps its whole home in `~/.var/app`, as Steam does. Seeing your real home
/// as well breaks such apps, so full access leaves your home out for them.
fn keeps_own_home(id: &str) -> bool {
    Command::new("flatpak")
        .args(["info", "--show-metadata", "--", id])
        .output()
        .is_ok_and(|output| {
            String::from_utf8_lossy(&output.stdout)
                .lines()
                .filter_map(|line| line.strip_prefix("persistent="))
                .any(|entries| entries.split(';').any(|entry| entry == "."))
        })
}

async fn override_sandbox(id: String, open: bool) -> Result<(), String> {
    spawn_blocking(move || {
        let mut command = Command::new("flatpak");
        command.args(["override", "--user"]);
        if open {
            command.args(OPEN_SANDBOX);
            if keeps_own_home(&id) {
                command.args(EVERYTHING_BUT_HOME);
            } else {
                command.args(EVERYTHING);
            }
        } else {
            command.arg("--reset");
        }
        let output = command
            .args(["--", &id])
            .output()
            .map_err(|_| "Flatpak isn't installed.".to_owned())?;
        if output.status.success() {
            Ok(())
        } else {
            Err(friendly(&String::from_utf8_lossy(&output.stderr)))
        }
    })
    .await
    .map_err(failed)?
}
