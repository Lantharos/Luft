use luft_dbus_macros::introspect;
use tokio::process::Command;
use zbus::{Connection, proxy};

use crate::keys::PublicKey;

const SERVICE: &str = "sshd.service";
const SOCKET: &str = "sshd.socket";
const SYSTEMCTL: &str = "/usr/bin/systemctl";
const ENABLED: &str = "enabled";
const HOST_KEYS: [&str; 3] = [
    "/etc/ssh/ssh_host_ed25519_key.pub",
    "/etc/ssh/ssh_host_ecdsa_key.pub",
    "/etc/ssh/ssh_host_rsa_key.pub",
];

#[introspect]
#[proxy(
    interface = "org.freedesktop.systemd1.Manager",
    default_service = "org.freedesktop.systemd1",
    default_path = "/org/freedesktop/systemd1"
)]
trait Manager {
    fn get_unit_file_state(&self, unit: &str) -> zbus::Result<String>;
}

pub async fn enabled(connection: &Connection) -> zbus::Result<bool> {
    let state = ManagerProxy::new(connection)
        .await?
        .get_unit_file_state(SERVICE)
        .await?;
    Ok(state == ENABLED)
}

async fn systemctl(arguments: &[&str]) -> Result<(), String> {
    let output = Command::new(SYSTEMCTL)
        .args(arguments)
        .output()
        .await
        .map_err(|error| format!("Couldn't start systemctl: {error}"))?;
    if output.status.success() {
        return Ok(());
    }
    Err(format!(
        "The SSH server didn't follow: {}",
        String::from_utf8_lossy(&output.stderr).trim()
    ))
}

pub async fn start() -> Result<(), String> {
    systemctl(&["disable", "--now", SOCKET]).await?;
    systemctl(&["enable", "--now", SERVICE]).await
}

pub async fn stop() -> Result<(), String> {
    systemctl(&["disable", "--now", SERVICE, SOCKET]).await
}

pub async fn reload() -> Result<(), String> {
    systemctl(&["try-reload-or-restart", SERVICE]).await
}

pub fn host_keys() -> Vec<(String, String)> {
    HOST_KEYS
        .iter()
        .filter_map(|path| std::fs::read_to_string(path).ok())
        .filter_map(|text| PublicKey::parse(&text))
        .map(|key| (key.kind.clone(), key.fingerprint()))
        .collect()
}
