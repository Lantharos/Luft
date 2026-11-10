use tokio::process::Command;

use crate::keys::PublicKey;

const SERVICE: &str = "sshd.service";
const SYSTEMCTL: &str = "/usr/bin/systemctl";
const HOST_KEYS: [&str; 3] = [
    "/etc/ssh/ssh_host_ed25519_key.pub",
    "/etc/ssh/ssh_host_ecdsa_key.pub",
    "/etc/ssh/ssh_host_rsa_key.pub",
];

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

async fn regenerate() -> Result<(), String> {
    systemctl(&["daemon-reload"]).await
}

pub async fn start() -> Result<(), String> {
    regenerate().await?;
    systemctl(&["start", SERVICE]).await
}

pub async fn stop() -> Result<(), String> {
    let regenerated = regenerate().await;
    systemctl(&["stop", SERVICE]).await?;
    regenerated
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
