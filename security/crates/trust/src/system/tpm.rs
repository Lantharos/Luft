use std::path::Path;

use super::command::Tool;

#[derive(Clone, Debug, Default)]
pub struct Tpm {
    pub present: bool,
    pub version: String,
    pub usable: bool,
    pub reason: String,
}

fn version() -> Option<String> {
    let major = std::fs::read_to_string("/sys/class/tpm/tpm0/tpm_version_major").ok()?;
    Some(match major.trim() {
        "2" => "2.0".to_owned(),
        "1" => "1.2".to_owned(),
        other => other.to_owned(),
    })
}

fn readiness() -> Result<(), &'static str> {
    let report = Tool::new("systemd-analyze")
        .arg("has-tpm2")
        .output()
        .unwrap_or_else(|error| error.to_string());
    let missing = |part: &str| report.lines().any(|line| line.trim() == format!("-{part}"));
    if missing("firmware") {
        Err(
            "The firmware didn't set up the TPM at startup, so it can't vouch for how the computer started.",
        )
    } else if missing("driver") || missing("subsystem") {
        Err("The TPM isn't responding.")
    } else if missing("libraries") {
        Err("TPM support isn't installed.")
    } else {
        Ok(())
    }
}

pub fn detect() -> Tpm {
    let Some(version) = version() else {
        return Tpm {
            reason:
                "This computer doesn't have a TPM, or it's turned off in the firmware settings."
                    .to_owned(),
            ..Tpm::default()
        };
    };
    if version != "2.0" {
        return Tpm {
            present: true,
            reason: format!(
                "This computer's TPM is version {version}, which is too old to protect the disk."
            ),
            version,
            ..Tpm::default()
        };
    }
    let failure = if Path::new("/dev/tpmrm0").exists() {
        readiness().err()
    } else {
        Some("The TPM isn't responding.")
    };
    Tpm {
        present: true,
        usable: failure.is_none(),
        reason: failure.unwrap_or_default().to_owned(),
        version,
    }
}
