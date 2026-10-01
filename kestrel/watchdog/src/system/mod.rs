pub mod gpu;
pub mod kmsg;
pub mod proxies;

use std::time::Duration;

use tokio::process::Command;
use tokio::time::timeout;

pub async fn output_within(command: &mut Command, limit: Duration) -> Option<String> {
    let child = command.kill_on_drop(true).output();
    let output = timeout(limit, child).await.ok()?.ok()?;
    output
        .status
        .success()
        .then(|| String::from_utf8_lossy(&output.stdout).into_owned())
}

pub fn read_trimmed(path: &str) -> String {
    std::fs::read_to_string(path)
        .map(|text| text.trim().to_owned())
        .unwrap_or_default()
}
