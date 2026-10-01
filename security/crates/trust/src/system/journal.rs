use super::command::Tool;

const REFUSALS: [&str; 6] = [
    "TPM2 operation failed, falling back",
    "TPM2 PIN unlock failed",
    "No TPM2 metadata matching the current system state",
    "No TPM2 hardware discovered",
    "Failed to load PCR signature",
    "Failed to unseal secret using TPM2",
];

pub const STAGE_REFUSED: &str = "The TPM didn't release the disk key";

pub fn tpm_refused_this_boot() -> bool {
    let messages = |identifier: &str| {
        Tool::new("journalctl")
            .args(["-b", "0", "-o", "cat", "--no-pager"])
            .arg(format!("SYSLOG_IDENTIFIER={identifier}"))
            .output()
            .unwrap_or_default()
    };
    let cryptsetup = messages("systemd-cryptsetup");
    REFUSALS.iter().any(|refusal| cryptsetup.contains(refusal))
        || messages("luft-trust").contains(STAGE_REFUSED)
}
