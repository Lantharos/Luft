use super::command::Tool;

const REFUSALS: [&str; 6] = [
    "TPM2 operation failed, falling back",
    "TPM2 PIN unlock failed",
    "No TPM2 metadata matching the current system state",
    "No TPM2 hardware discovered",
    "Failed to load PCR signature",
    "Failed to unseal secret using TPM2",
];

pub fn tpm_refused_this_boot() -> bool {
    let cryptsetup = Tool::new("journalctl")
        .args(["-b", "0", "-o", "cat", "--no-pager"])
        .arg("SYSLOG_IDENTIFIER=systemd-cryptsetup")
        .output()
        .unwrap_or_default();
    REFUSALS.iter().any(|refusal| cryptsetup.contains(refusal))
}
