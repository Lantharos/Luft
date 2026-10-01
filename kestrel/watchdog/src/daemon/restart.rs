use std::fs;
use std::time::Duration;

use tokio::process::Command;
use tokio::time::{sleep, timeout};
use zbus::Connection;

use crate::incident::{Incident, Restart};
use crate::system::output_within;
use crate::system::proxies::{LoginProxy, SKIP_INHIBITORS, SystemdProxy};

const ASK_LIMIT: Duration = Duration::from_secs(10);
const FORCE_AFTER: Duration = Duration::from_secs(90);
const EMERGENCY_AFTER: Duration = Duration::from_secs(60);
const SYSRQ_PAUSE: Duration = Duration::from_secs(3);
const SYSRQ: &str = "/proc/sysrq-trigger";

async fn ask_logind(system: &Connection) -> zbus::Result<()> {
    LoginProxy::new(system)
        .await?
        .reboot_with_flags(SKIP_INHIBITORS)
        .await
}

async fn ask_systemd(system: &Connection) -> zbus::Result<()> {
    SystemdProxy::new(system)
        .await?
        .start_unit("reboot.target", "replace-irreversibly")
        .await
        .map(drop)
}

async fn restart_gracefully(system: &Connection) {
    match timeout(ASK_LIMIT, ask_logind(system)).await {
        Ok(Ok(())) => return,
        Ok(Err(error)) => eprintln!("logind couldn't restart the computer: {error}"),
        Err(_) => eprintln!("logind didn't answer the restart request"),
    }
    match timeout(ASK_LIMIT, ask_systemd(system)).await {
        Ok(Ok(())) => {}
        Ok(Err(error)) => eprintln!("systemd couldn't restart the computer: {error}"),
        Err(_) => eprintln!("systemd didn't answer the restart request"),
    }
}

fn note(incident: &mut Incident, restart: Restart) {
    incident.restart = restart;
    if let Err(error) = incident.save() {
        eprintln!("Couldn't note how the restart went: {error}");
    }
}

fn sysrq(key: u8) {
    if let Err(error) = fs::write(SYSRQ, [key]) {
        eprintln!(
            "The kernel didn't take the emergency key {}: {error}",
            key as char
        );
    }
}

pub async fn restart(system: Connection, mut incident: Incident) {
    eprintln!("Restarting the computer and giving apps the chance to save");
    restart_gracefully(&system).await;

    sleep(FORCE_AFTER).await;
    eprintln!("The restart is stuck, forcing it");
    note(&mut incident, Restart::Forced);
    output_within(
        Command::new("systemctl").args(["--force", "reboot"]),
        ASK_LIMIT,
    )
    .await;

    sleep(EMERGENCY_AFTER).await;
    eprintln!("The forced restart is stuck too, restarting through the kernel");
    note(&mut incident, Restart::Emergency);
    sysrq(b's');
    sleep(SYSRQ_PAUSE).await;
    sysrq(b'u');
    sleep(SYSRQ_PAUSE).await;
    sysrq(b'b');
}
