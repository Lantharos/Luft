use luft_software::system::image::{self, Deployments, Release};
use serde::Serialize;

use crate::bus::{self, Properties, TrustProxy, get};
use crate::failure::Outcome;
use crate::output::{Output, table};

const SHORT_DIGEST: usize = 12;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    version: Option<String>,
    channel: Option<&'static str>,
    waiting_for_channel: bool,
    build: Option<String>,
    built: Option<u64>,
    downloading: bool,
    downloaded: Option<String>,
    older: Option<String>,
    going_back: bool,
    secure_boot: Option<String>,
    tpm: Option<Tpm>,
    encryption: Option<Encryption>,
    developer_tools: Option<bool>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Tpm {
    present: bool,
    usable: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Encryption {
    encrypted: bool,
    tpm_unlocks: bool,
    encrypting: String,
}

/// A version as Settings names it, such as Luft 1.2 Nightly 21.
pub fn shown(version: &str) -> String {
    match version.split_once("-nightly.") {
        Some((release, nightly)) => format!("Luft {release} Nightly {nightly}"),
        None => format!("Luft {version}"),
    }
}

pub fn build(digest: &str) -> String {
    let hex = digest.strip_prefix("sha256:").unwrap_or(digest);
    hex[..hex.len().min(SHORT_DIGEST)].to_owned()
}

fn version(release: Option<Release>) -> Option<String> {
    release.and_then(|release| release.version)
}

async fn security(status: &mut Status) -> Outcome {
    let trust = TrustProxy::new(bus::system().await?).await?;
    status.secure_boot = trust.secure_boot().await.ok();
    status.tpm = trust.tpm().await.ok().map(|tpm: Properties| Tpm {
        present: get(&tpm, "Present").unwrap_or(false),
        usable: get(&tpm, "Usable").unwrap_or(false),
    });
    status.encryption = trust.disk().await.ok().map(|disk: Properties| Encryption {
        encrypted: get(&disk, "Encrypted").unwrap_or(false),
        tpm_unlocks: get(&disk, "TpmUnlocks").unwrap_or(false),
        encrypting: get(&disk, "Encrypting").unwrap_or_default(),
    });
    Ok(())
}

pub async fn gather() -> Status {
    let mut status = Status {
        version: None,
        channel: None,
        waiting_for_channel: false,
        build: None,
        built: None,
        downloading: image::downloading().await.unwrap_or(false),
        downloaded: None,
        older: None,
        going_back: false,
        secure_boot: None,
        tpm: None,
        encryption: None,
        developer_tools: bus::developer_tools().await.ok(),
    };
    if let Ok(deployments) = Deployments::load().await {
        let running = deployments.running();
        let deployed = deployments.status();
        let choice = deployments.channel_choice();
        status.version = running.version;
        status.channel = choice
            .map(|choice| choice.chosen.name())
            .or(running.channel);
        status.waiting_for_channel = choice.is_some_and(|choice| choice.waiting);
        status.build = running.digest.as_deref().map(build);
        status.built = deployed.current.released;
        status.downloaded = version(deployed.staged);
        status.going_back = deployed.returning.is_some();
        status.older = version(deployed.previous.or(deployed.returning));
    }
    let _ = security(&mut status).await;
    status
}

fn on(value: bool) -> String {
    if value { "on" } else { "off" }.to_owned()
}

pub fn words(status: &Status) -> String {
    let unknown = || "unknown".to_owned();
    let mut rows = vec![
        (
            "Version",
            status.version.as_deref().map_or_else(unknown, shown),
        ),
        (
            "Channel",
            match (status.channel, status.waiting_for_channel) {
                (Some(channel), true) => format!("{channel}, moving there once it has caught up"),
                (Some(channel), false) => channel.to_owned(),
                (None, _) => unknown(),
            },
        ),
        ("Build", status.build.clone().unwrap_or_else(unknown)),
    ];
    let update = match (&status.downloaded, status.downloading) {
        (_, true) => "downloading".to_owned(),
        (Some(version), false) => format!(
            "{} downloaded, installs at the next restart",
            shown(version)
        ),
        (None, false) => "none downloaded".to_owned(),
    };
    rows.push(("Update", update));
    if let Some(older) = &status.older {
        let kept = if status.going_back {
            "starts at the next restart"
        } else {
            "kept to go back to"
        };
        rows.push(("Older version", format!("{}, {kept}", shown(older))));
    }
    rows.push((
        "Secure Boot",
        status.secure_boot.clone().unwrap_or_else(unknown),
    ));
    if let Some(tpm) = &status.tpm {
        rows.push((
            "TPM",
            match (tpm.present, tpm.usable) {
                (false, _) => "none".to_owned(),
                (true, true) => "ready".to_owned(),
                (true, false) => "present but not usable".to_owned(),
            },
        ));
    }
    if let Some(disk) = &status.encryption {
        rows.push((
            "Encryption",
            match (disk.encrypted, disk.tpm_unlocks, disk.encrypting.as_str()) {
                (_, _, "encrypting" | "waiting" | "after-restart") => "being encrypted".to_owned(),
                (false, _, _) => "off".to_owned(),
                (true, true, _) => "on, the TPM unlocks the disk".to_owned(),
                (true, false, _) => "on, unlocked with a passphrase".to_owned(),
            },
        ));
    }
    rows.push((
        "Developer tools",
        status.developer_tools.map_or_else(unknown, on),
    ));
    table(rows)
}

pub fn run(output: Output) -> Outcome {
    let status = bus::block_on(gather())?;
    output.show(&status, || words(&status))
}

#[cfg(test)]
mod tests {
    use super::{build, shown};

    #[test]
    fn names_versions_and_builds_as_settings_does() {
        assert_eq!(shown("1.2-nightly.21"), "Luft 1.2 Nightly 21");
        assert_eq!(shown("1.1"), "Luft 1.1");
        assert_eq!(build("sha256:0123456789abcdef0123"), "0123456789ab");
    }
}
