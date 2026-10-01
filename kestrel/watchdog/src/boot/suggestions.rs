use std::time::Duration;

use tokio::process::Command;

use super::rebar;
use crate::incident::{Action, Incident, Suggestion};
use crate::system::output_within;

const DRIVER_PACKAGES: [&str; 3] = ["akmod-nvidia", "kmod-nvidia", "xorg-x11-drv-nvidia"];
const UPDATE_QUERY_LIMIT: Duration = Duration::from_secs(8);

fn resizable_bar() -> Option<Suggestion> {
    let window = rebar::small_windows().into_iter().next()?;
    Some(Suggestion {
        step: "Turn on Above 4G Decoding and Resizable BAR in the firmware settings".into(),
        detail: format!(
            "Your {} can let the processor reach up to {} MB of its memory, but only {} MB can be reached right now. \
             Apps that play video or use the graphics card heavily can run out of that space, and the driver can stop responding when they do. \
             In the firmware settings, turn on Above 4G Decoding and Resizable BAR. Some firmware calls it Re-Size BAR Support or Smart Access Memory.",
            window.card, window.largest_mib, window.current_mib
        ),
        action: Some(Action::FirmwareSettings),
    })
}

async fn driver_update() -> Option<Suggestion> {
    let query = output_within(
        Command::new("dnf5")
            .args(["repoquery", "--upgrades", "--cacheonly", "--latest-limit=1"])
            .args(["--queryformat", "%{name} %{version}\n"])
            .args(DRIVER_PACKAGES),
        UPDATE_QUERY_LIMIT,
    )
    .await?;
    let version = query.lines().find_map(|line| {
        let (name, version) = line.split_once(' ')?;
        DRIVER_PACKAGES
            .contains(&name)
            .then(|| version.trim().to_owned())
    })?;
    Some(Suggestion {
        step: format!("Install the NVIDIA driver update {version} from Updates in Settings"),
        detail: format!(
            "NVIDIA driver {version} is available. Driver updates often fix hangs like this one, and Updates in Settings installs it at the next restart."
        ),
        action: None,
    })
}

fn loose_card(incident: &Incident) -> Option<Suggestion> {
    let lost = incident
        .evidence
        .iter()
        .chain(&incident.kernel_messages)
        .any(|line| line.contains("fallen off the bus"));
    lost.then(|| Suggestion {
        step: "Check that the graphics card sits firmly and its power cables are connected".into(),
        detail: "The computer lost contact with the graphics card, which usually comes from power delivery or a loose connection rather than from software.".into(),
        action: None,
    })
}

pub async fn compute(incident: &Incident) -> Vec<Suggestion> {
    let nvidia = incident
        .gpus
        .iter()
        .any(|gpu| gpu.name.starts_with("NVIDIA"));
    let update = if nvidia { driver_update().await } else { None };
    [resizable_bar(), update, loose_card(incident)]
        .into_iter()
        .flatten()
        .collect()
}

pub fn wants_firmware_settings(suggestions: &[Suggestion]) -> bool {
    suggestions
        .iter()
        .any(|suggestion| suggestion.action == Some(Action::FirmwareSettings))
}
