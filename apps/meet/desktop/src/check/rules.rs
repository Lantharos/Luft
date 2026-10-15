use serde::{Deserialize, Serialize};

use super::facts::{Architecture, BROADCOM, Encryption, Facts, Firmware};
use crate::plan::sizes::{GIB, smallest_luft};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Fine,
    Note,
    Blocks,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Topic {
    Processor,
    Startup,
    SecureBoot,
    Tpm,
    Encryption,
    FastStartup,
    Space,
    Graphics,
    Wifi,
    StartEntries,
    Download,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    FirmwareSettings,
    Tidy,
    ChooseIso,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct Finding {
    pub topic: Topic,
    pub level: Level,
    pub title: String,
    pub detail: String,
    pub action: Option<Action>,
}

fn finding(topic: Topic, level: Level, title: &str, detail: &str) -> Finding {
    Finding {
        topic,
        level,
        title: title.to_owned(),
        detail: detail.to_owned(),
        action: None,
    }
}

impl Finding {
    fn with(self, action: Action) -> Self {
        Self {
            action: Some(action),
            ..self
        }
    }
}

fn gib(bytes: u64) -> u64 {
    bytes.div_ceil(GIB)
}

fn processor(facts: &Facts) -> Finding {
    match facts.architecture {
        Architecture::X64 => finding(
            Topic::Processor,
            Level::Fine,
            "64-bit Intel or AMD processor",
            "Luft runs on it.",
        ),
        Architecture::Arm64 => finding(
            Topic::Processor,
            Level::Blocks,
            "Arm processor",
            "Luft only runs on Intel and AMD processors for now.",
        ),
        Architecture::Other => finding(
            Topic::Processor,
            Level::Blocks,
            "32-bit Windows",
            "Luft needs a 64-bit Intel or AMD processor and 64-bit Windows.",
        ),
    }
}

fn startup(facts: &Facts) -> Finding {
    match (facts.firmware, facts.gpt) {
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

struct Maker {
    names: &'static [&'static str],
    shown: &'static str,
    key: &'static str,
    place: &'static str,
}

const MAKERS: [Maker; 8] = [
    Maker {
        names: &["lenovo"],
        shown: "Lenovo",
        key: "F2 (F1 on a ThinkPad)",
        place: "Security, then Secure Boot",
    },
    Maker {
        names: &["dell"],
        shown: "Dell",
        key: "F2",
        place: "Boot Configuration, then Secure Boot",
    },
    Maker {
        names: &["hp", "hewlett"],
        shown: "HP",
        key: "F10",
        place: "Security or Advanced, then Secure Boot Configuration",
    },
    Maker {
        names: &["asus"],
        shown: "ASUS",
        key: "F2 or Delete",
        place: "Security or Boot, then Secure Boot",
    },
    Maker {
        names: &["acer"],
        shown: "Acer",
        key: "F2",
        place: "Boot, then Secure Boot",
    },
    Maker {
        names: &["micro-star", "msi"],
        shown: "MSI",
        key: "Delete",
        place: "Settings, then Security, then Secure Boot",
    },
    Maker {
        names: &["gigabyte"],
        shown: "Gigabyte",
        key: "Delete",
        place: "Boot, then Secure Boot",
    },
    Maker {
        names: &["microsoft"],
        shown: "Surface",
        key: "volume up",
        place: "Security, then Secure Boot",
    },
];

fn maker(name: Option<&str>) -> Option<&'static Maker> {
    let name = name?.to_ascii_lowercase();
    MAKERS
        .iter()
        .find(|maker| maker.names.iter().any(|known| name.starts_with(known)))
}

fn turning_on_secure_boot(facts: &Facts) -> String {
    let maker = maker(facts.maker.as_deref());
    match (facts.opens_settings, maker) {
        (true, Some(maker)) => format!("Meet Luft can restart into the firmware settings, where it's under {}.", maker.place),
        (true, None) => "Meet Luft can restart into the firmware settings, where it's usually under Security or Boot.".to_owned(),
        (false, Some(maker)) => format!(
            "To turn it on, restart and press {} as the {} logo appears, then go to {}.",
            maker.key, maker.shown, maker.place
        ),
        (false, None) => "To turn it on, open the firmware settings while the computer starts and look under Security or Boot.".to_owned(),
    }
}

fn secure_boot(facts: &Facts) -> Finding {
    match facts.secure_boot {
        Some(true) => finding(
            Topic::SecureBoot,
            Level::Fine,
            "Secure Boot is on",
            "It can stay on. Luft asks once, on a blue screen, to add its key.",
        ),
        _ => {
            let detail = format!(
                "Luft works without it, though games with anti-cheat need it. {}",
                turning_on_secure_boot(facts)
            );
            let found = finding(
                Topic::SecureBoot,
                Level::Note,
                "Secure Boot is off",
                &detail,
            );
            if facts.opens_settings {
                found.with(Action::FirmwareSettings)
            } else {
                found
            }
        }
    }
}

fn tpm(facts: &Facts) -> Finding {
    match facts.tpm.as_deref() {
        Some(version) if version.starts_with('2') => finding(
            Topic::Tpm,
            Level::Fine,
            "TPM 2.0",
            "An encrypted Luft can unlock by itself when the computer starts.",
        ),
        _ => finding(
            Topic::Tpm,
            Level::Note,
            "No TPM 2.0",
            "If you encrypt Luft, it asks for a passphrase each time it starts.",
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

fn graphics(facts: &Facts) -> Finding {
    let names = facts
        .graphics
        .iter()
        .map(|device| device.name.as_str())
        .collect::<Vec<_>>()
        .join(", ");
    if facts.nvidia() {
        finding(
            Topic::Graphics,
            Level::Fine,
            &names,
            "Luft installs with NVIDIA's own driver.",
        )
    } else {
        finding(
            Topic::Graphics,
            Level::Fine,
            if names.is_empty() { "Graphics" } else { &names },
            "Works out of the box.",
        )
    }
}

fn wifi(facts: &Facts) -> Finding {
    match facts.wifi.first() {
        None => finding(
            Topic::Wifi,
            Level::Fine,
            "No Wi-Fi",
            "Use a network cable in Luft, or nothing at all.",
        ),
        Some(device) if device.vendor == BROADCOM => finding(
            Topic::Wifi,
            Level::Note,
            &device.name,
            "Some Broadcom Wi-Fi chips need a driver Luft doesn't include. Keep a network cable or a phone for USB tethering nearby.",
        ),
        Some(device) => finding(Topic::Wifi, Level::Fine, &device.name, "Works in Luft."),
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

const LIVE_ESTIMATE: u64 = 4 * GIB;

fn download(live: Option<u64>) -> Option<Finding> {
    live.is_none().then(|| {
        finding(
            Topic::Download,
            Level::Blocks,
            "Luft can't be downloaded right now",
            "Meet Luft downloads about 3 GB. Check that this PC is online and check again, or use a Luft ISO you already have.",
        )
        .with(Action::ChooseIso)
    })
}

pub fn evaluate(facts: &Facts, live: Option<u64>) -> Vec<Finding> {
    let mut findings = vec![
        processor(facts),
        startup(facts),
        space(facts, live.unwrap_or(LIVE_ESTIMATE)),
        encryption(facts),
        secure_boot(facts),
        tpm(facts),
        fast_startup(facts),
        graphics(facts),
        wifi(facts),
    ];
    findings.extend(start_entries(facts));
    findings.extend(download(live));
    findings
}

#[cfg(test)]
mod tests {
    use super::super::facts::Device;
    use super::*;

    fn laptop() -> Facts {
        Facts {
            architecture: Architecture::X64,
            firmware: Firmware::Uefi,
            secure_boot: Some(true),
            opens_settings: true,
            maker: Some("LENOVO".into()),
            tpm: Some("2.0, 0, 1.38".into()),
            encryption: Encryption::Off,
            fast_startup: false,
            universal_clock: false,
            bluetooth: 0,
            start_entries: Vec::new(),
            gpt: true,
            graphics: vec![Device {
                name: "Intel Arc".into(),
                vendor: 0x8086,
            }],
            wifi: vec![Device {
                name: "Intel Wi-Fi 7 BE200".into(),
                vendor: 0x8086,
            }],
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
        facts.secure_boot = Some(false);
        facts.opens_settings = false;
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
            |facts: &mut Facts| facts.architecture = Architecture::Arm64,
            |facts: &mut Facts| facts.firmware = Firmware::Bios,
            |facts: &mut Facts| facts.gpt = false,
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
