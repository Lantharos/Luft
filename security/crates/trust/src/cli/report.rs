use crate::disk::Check;
use crate::status;
use crate::system::secret::Secret;

fn yes_no(value: bool) -> &'static str {
    if value { "yes" } else { "no" }
}

pub fn status() {
    let status = status::gather();
    println!("Secure Boot        {}", status.secure_boot.name());
    if status.tpm.present {
        println!(
            "TPM                {} ({})",
            status.tpm.version,
            if status.tpm.usable {
                "ready"
            } else {
                &status.tpm.reason
            }
        );
    } else {
        println!("TPM                none. {}", status.tpm.reason);
    }
    let key = &status.signing_key;
    println!(
        "Luft key           {}{}",
        key.enrollment.name(),
        if key.protection.is_empty() {
            String::new()
        } else {
            format!(", kept by the {}", key.protection)
        }
    );
    if key.missed > 0 {
        println!(
            "                   not added at the last {}",
            if key.missed == 1 {
                "restart".to_owned()
            } else {
                format!("{} restarts", key.missed)
            }
        );
    }
    if !key.reason.is_empty() {
        println!("                   {}", key.reason);
    }
    println!(
        "Driver key         {}",
        if key.driver_key_enrolled {
            "enrolled"
        } else {
            "not enrolled"
        }
    );
    println!(
        "Signed startup     installed: {}, this boot: {}",
        yes_no(status.startup.installed),
        yes_no(status.startup.measured)
    );
    if !status.startup.failed_version.is_empty() {
        println!(
            "                   Linux {} didn't start, so the version before it started instead.",
            status.startup.failed_version
        );
    }
    match &status.disk {
        Some(disk) => {
            println!("Disk               {} {}", disk.device, disk.state);
            if matches!(disk.state, "encrypting" | "decrypting") {
                println!("                   {:.0}% done", disk.progress * 100.0);
            }
            if !disk.unlock.is_empty() {
                println!("Unlocks with       {}", disk.unlock.join(", "));
            }
            println!("Recovery key kept  {}", yes_no(disk.recovery_key_stored));
            if disk.tpm_refused {
                println!("                   The TPM didn't unlock the disk at this startup.");
            }
        }
        None => println!("Disk               unknown"),
    }
}

pub fn recovery_key(key: &Secret) {
    println!();
    println!("Recovery key:");
    println!();
    println!("    {}", key.text());
    println!();
    println!("Keep it somewhere other than this computer. It unlocks the disk when the TPM can't.");
}

pub fn enrollment_steps(code: &str) {
    println!(
        "Restart the computer. A blue screen asks about a new key and waits only 10 seconds, so press a key when it appears. Then:"
    );
    println!("  1. Choose Enroll MOK, then Continue");
    println!("  2. Choose Yes");
    println!("  3. Type {} {} and press Enter", &code[..4], &code[4..]);
    println!("  4. Choose Reboot");
}

pub fn checks(checks: &[Check]) {
    for check in checks {
        println!(
            "{} {}",
            if check.passed { "ok  " } else { "stop" },
            check.message
        );
    }
}
