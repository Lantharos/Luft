use crate::anticheat::Readiness;
use crate::service::status;
use crate::system::secrets::secret::Secret;

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
    println!("Luft key           {}", key.enrollment.name());
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
        "Signed startup     installed: {}, this boot: {}",
        yes_no(status.startup.installed),
        yes_no(status.startup.measured)
    );
    match &status.disk {
        Some(disk) => {
            println!(
                "Disk               {} {}",
                disk.device,
                if disk.encrypted {
                    "encrypted"
                } else {
                    "not encrypted"
                }
            );
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

fn blue_screen_steps(asks_about: &str, choice: &str, code: &str) {
    println!(
        "Restart the computer. A blue screen asks about {asks_about} and waits only 10 seconds, so press a key when it appears. Then:"
    );
    println!("  1. Choose {choice}, then Continue");
    println!("  2. Choose Yes");
    println!("  3. Type {} {} and press Enter", &code[..4], &code[4..]);
    println!("  4. Choose Reboot");
}

pub fn enrollment_steps(code: &str) {
    blue_screen_steps("a new key", "Enroll MOK", code);
}

pub fn removal_steps(code: &str) {
    blue_screen_steps("removing keys", "Delete MOK", code);
}

pub fn anti_cheat(readiness: &Readiness, other_keys: &[String]) {
    for check in &readiness.checks {
        match &check.missing {
            None => println!("ok    {}", check.name),
            Some(missing) => println!("no    {}: {missing}", check.name),
        }
    }
    println!();
    if !other_keys.is_empty() {
        println!("Keys added from elsewhere: {}", other_keys.join(", "));
        println!("trustctl secure-boot remove-others removes them at the next restart.");
    } else if readiness.ready() {
        println!("Ready for games with anti-cheat.");
    }
    if readiness.uses_luft_key {
        println!(
            "Luft starts with its own key, which Epic hasn't added to its list of well-known keys yet. There's nothing to change on this computer for that."
        );
    }
}
