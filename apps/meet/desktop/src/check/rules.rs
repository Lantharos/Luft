use super::common::{
    Action, Finding, LIVE_ESTIMATE, Level, Topic, download, finding, gib, graphics, processor,
    secure_boot, tpm, wifi,
};
use super::facts::{Encryption, Facts, Firmware};
use crate::plan::sizes::smallest_luft;

fn startup(facts: &Facts) -> Finding {
    match (facts.machine.firmware, facts.machine.gpt) {
        (Firmware::Uefi, true) => finding(
            Topic::Startup,
            Level::Fine,
            "Starts with UEFI",
            "Luft starts the same modern way.",
        ),
        (Firmware::Bios, _) => finding(
            Topic::Startup,
            Level::Blocks,
            "Starts in legacy BIOS mode",
            "Luft needs UEFI. Windows can switch with MBR2GPT, then UEFI can be turned on in the firmware settings.",
        ),
        (Firmware::Uefi, false) => finding(
            Topic::Startup,
            Level::Blocks,
            "The drive uses an old partition table",
            "Luft needs a GPT drive. Windows can convert it with MBR2GPT without losing files.",
        ),
    }
}

fn encryption(facts: &Facts) -> Finding {
    match facts.encryption {
        Encryption::Off => finding(
            Topic::Encryption,
            Level::Fine,
            "Windows isn't encrypted",
            "Install Luft can read its settings and your Bluetooth devices.",
        ),
        Encryption::On => finding(
            Topic::Encryption,
            Level::Note,
            "Windows is encrypted with BitLocker",
            "That's fine. Windows makes the room itself, and Meet Luft brings over what Luft can't read from a locked drive. Keep your recovery key nearby, just in case.",
        ),
        Encryption::Changing => finding(
            Topic::Encryption,
            Level::Blocks,
            "BitLocker is still encrypting or decrypting",
            "Wait until Windows finishes, then come back. You can see how far it is in Settings, under Device encryption.",
        ),
    }
}

fn fast_startup(facts: &Facts) -> Finding {
    if facts.fast_startup {
        finding(
            Topic::FastStartup,
            Level::Note,
            "Fast Startup is on",
            "Windows hibernates instead of shutting down, which keeps its drive locked. Meet Luft offers to turn it off before installing.",
        )
    } else {
        finding(
            Topic::FastStartup,
            Level::Fine,
            "Fast Startup is off",
            "Windows shuts down fully.",
        )
    }
}

fn space(facts: &Facts, live: u64) -> Finding {
    let needed = smallest_luft(facts.esp_size) + live;
    if facts.most_room >= needed {
        finding(
            Topic::Space,
            Level::Fine,
            &format!("Up to {} GB for Luft", gib(facts.most_room - live)),
            "Windows keeps its files and room to grow.",
        )
    } else {
        finding(
            Topic::Space,
            Level::Blocks,
            "Not enough free space",
            &format!(
                "Luft needs about {} GB that Windows can give up. Free up {} GB in Windows, for example with Disk Cleanup, then check again.",
                gib(needed),
                gib(needed - facts.most_room).max(1)
            ),
        )
    }
}

fn start_entries(facts: &Facts) -> Option<Finding> {
    let names: Vec<&str> = facts
        .start_entries
        .iter()
        .map(|entry| entry.name.as_str())
        .collect();
    let (title, verb) = match names.len() {
        0 => return None,
        1 => ("An old start entry".to_owned(), "points"),
        count => (format!("{count} old start entries"), "point"),
    };
    let detail = format!(
        "{} {verb} at systems that aren't on this PC anymore. They can be tidied away.",
        names.join(", ")
    );
    Some(finding(Topic::StartEntries, Level::Note, &title, &detail).with(Action::Tidy))
}

pub fn evaluate(facts: &Facts, live: Option<u64>) -> Vec<Finding> {
    let mut findings = vec![
        processor(&facts.machine),
        startup(facts),
        space(facts, live.unwrap_or(LIVE_ESTIMATE)),
        encryption(facts),
        secure_boot(&facts.machine),
        tpm(&facts.machine),
        fast_startup(facts),
        graphics(&facts.machine),
        wifi(&facts.machine),
    ];
    findings.extend(start_entries(facts));
    findings.extend(download(live));
    findings
}

#[cfg(test)]
mod tests {
    use super::super::facts::{Architecture, Device, Machine, Platform};
    use super::*;
    use crate::plan::sizes::GIB;

    fn laptop() -> Facts {
        Facts {
            machine: Machine {
                platform: Platform::Windows,
                architecture: Architecture::X64,
                firmware: Firmware::Uefi,
                gpt: true,
                secure_boot: Some(true),
                opens_settings: true,
                maker: Some("LENOVO".into()),
                tpm: Some("2.0, 0, 1.38".into()),
                graphics: vec![Device {
                    name: "Intel Arc".into(),
                    vendor: 0x8086,
                }],
                wifi: vec![Device {
                    name: "Intel Wi-Fi 7 BE200".into(),
                    vendor: 0x8086,
                }],
            },
            encryption: Encryption::Off,
            fast_startup: false,
            universal_clock: false,
            bluetooth: 0,
            start_entries: Vec::new(),
            esp_size: 100 << 20,
            windows_size: 475 * GIB,
            windows_used: 120 * GIB,
            most_room: 300 * GIB,
        }
    }

    fn level(findings: &[Finding], topic: Topic) -> Level {
        findings
            .iter()
            .find(|finding| finding.topic == topic)
            .unwrap()
            .level
    }

    #[test]
    fn an_ordinary_laptop_is_ready() {
        let findings = evaluate(&laptop(), Some(4 * GIB));
        assert!(findings.iter().all(|finding| finding.level == Level::Fine));
    }

    #[test]
    fn bitlocker_is_fine_unless_windows_is_still_converting() {
        let mut facts = laptop();
        facts.encryption = Encryption::On;
        assert_eq!(
            level(&evaluate(&facts, Some(4 * GIB)), Topic::Encryption),
            Level::Note
        );
        facts.encryption = Encryption::Changing;
        assert_eq!(
            level(&evaluate(&facts, Some(4 * GIB)), Topic::Encryption),
            Level::Blocks
        );
    }

    #[test]
    fn luft_needs_room_for_itself_its_startup_partition_and_the_live_system() {
        let mut facts = laptop();
        facts.most_room = 34 * GIB + 4 * GIB;
        assert_eq!(
            level(&evaluate(&facts, Some(4 * GIB)), Topic::Space),
            Level::Fine
        );
        facts.most_room -= 1;
        assert_eq!(
            level(&evaluate(&facts, Some(4 * GIB)), Topic::Space),
            Level::Blocks
        );
    }

    #[test]
    fn secure_boot_off_says_where_to_turn_it_on() {
        let mut facts = laptop();
        facts.machine.secure_boot = Some(false);
        facts.machine.opens_settings = false;
        let findings = evaluate(&facts, Some(4 * GIB));
        let secure_boot = findings
            .iter()
            .find(|finding| finding.topic == Topic::SecureBoot)
            .unwrap();
        assert_eq!(secure_boot.level, Level::Note);
        assert!(secure_boot.detail.contains(
            "press F2 (F1 on a ThinkPad) as the Lenovo logo appears, then go to Security"
        ));
        assert_eq!(secure_boot.action, None);
    }

    #[test]
    fn only_64_bit_uefi_pcs_with_gpt_can_start_luft() {
        for change in [
            |facts: &mut Facts| facts.machine.architecture = Architecture::Arm64,
            |facts: &mut Facts| facts.machine.firmware = Firmware::Bios,
            |facts: &mut Facts| facts.machine.gpt = false,
        ] {
            let mut facts = laptop();
            change(&mut facts);
            assert!(
                evaluate(&facts, Some(4 * GIB))
                    .iter()
                    .any(|finding| finding.level == Level::Blocks)
            );
        }
    }
}
