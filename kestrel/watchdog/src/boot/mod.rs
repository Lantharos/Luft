mod notice;
mod rebar;
mod suggestions;

use std::fs;
use std::path::Path;
use std::process::ExitCode;
use std::time::Duration;

use tokio::process::Command;

use crate::incident::{self, Incident, efi};
use crate::system::output_within;

const NOTICE: &str = "/run/kestrel-watchdog/notice";
const SUSHICTL: &str = "/usr/bin/sushictl";
const NOTICE_LIMIT: Duration = Duration::from_secs(300);
const OS_INDICATIONS_SUPPORTED: &str =
    "/sys/firmware/efi/efivars/OsIndicationsSupported-8be4df61-93ca-11d2-aa0d-00e098032b8c";
const BOOT_TO_FIRMWARE_UI: u8 = 1;

fn firmware_setup_supported() -> bool {
    fs::read(OS_INDICATIONS_SUPPORTED)
        .ok()
        .and_then(|contents| contents.get(4).copied())
        .is_some_and(|indications| indications & BOOT_TO_FIRMWARE_UI != 0)
}

async fn show(incident: &Incident, firmware: bool) -> Option<String> {
    if !Path::new(SUSHICTL).exists() {
        return None;
    }
    if let Err(error) = fs::write(NOTICE, notice::compose(incident, firmware)) {
        eprintln!("Couldn't prepare the notice: {error}");
        return None;
    }
    let choice = output_within(
        Command::new(SUSHICTL).args(["notice", "show", NOTICE]),
        NOTICE_LIMIT,
    )
    .await;
    let _ = fs::remove_file(NOTICE);
    choice.map(|choice| choice.trim().to_owned())
}

async fn present(mut incident: Incident) {
    if incident.suggestions.is_empty() {
        incident.suggestions = suggestions::compute(&incident).await;
    }
    let firmware =
        suggestions::wants_firmware_settings(&incident.suggestions) && firmware_setup_supported();
    let choice = show(&incident, firmware).await;
    incident.boot_notice_done = true;
    if let Err(error) = incident.save() {
        eprintln!("Couldn't remember that the notice was shown: {error}");
    }
    if choice.as_deref() == Some(notice::FIRMWARE_KEY) {
        let restarted = output_within(
            Command::new("systemctl").args(["reboot", "--firmware-setup"]),
            NOTICE_LIMIT,
        )
        .await;
        if restarted.is_none() {
            eprintln!("Couldn't restart into the firmware settings");
        }
    }
}

pub async fn run() -> ExitCode {
    if let Some(incident) = efi::load() {
        match incident.save() {
            Ok(()) => efi::forget(),
            Err(error) => {
                eprintln!("Couldn't move the incident saved in the firmware to the disk: {error}")
            }
        }
    }
    incident::forget_old();
    if let Some(incident) = incident::all()
        .into_iter()
        .find(|incident| !incident.boot_notice_done)
    {
        present(incident).await;
    }
    ExitCode::SUCCESS
}
