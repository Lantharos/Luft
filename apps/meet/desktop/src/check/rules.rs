use luft_i18n::t;

use super::common::{
    Action, Finding, LIVE_ESTIMATE, Level, Topic, download, finding, gib, graphics, processor,
    secure_boot, tpm, wifi,
};
use super::facts::{Encryption, Facts, Firmware};
use crate::L10N;
use crate::plan::places::{Kind, Place};
use crate::plan::sizes::smallest_luft;

fn startup(facts: &Facts) -> Finding {
    match (facts.machine.firmware, facts.machine.gpt) {
        (Firmware::Uefi, true) => finding(
            Topic::Startup,
            Level::Fine,
            t!(L10N, "check-startup-uefi"),
            t!(L10N, "check-startup-uefi-windows"),
        ),
        (Firmware::Bios, _) => finding(
            Topic::Startup,
            Level::Blocks,
            t!(L10N, "check-startup-bios"),
            t!(L10N, "check-startup-bios-windows"),
        ),
        (Firmware::Uefi, false) => finding(
            Topic::Startup,
            Level::Blocks,
            t!(L10N, "check-startup-mbr"),
            t!(L10N, "check-startup-mbr-windows"),
        ),
    }
}

fn encryption(facts: &Facts) -> Finding {
    match facts.encryption {
        Encryption::Off => finding(
            Topic::Encryption,
            Level::Fine,
            t!(L10N, "check-encryption-off"),
            t!(L10N, "check-encryption-off-detail"),
        ),
        Encryption::On => finding(
            Topic::Encryption,
            Level::Note,
            t!(L10N, "check-encryption-on"),
            t!(L10N, "check-encryption-on-detail"),
        ),
        Encryption::Changing => finding(
            Topic::Encryption,
            Level::Blocks,
            t!(L10N, "check-encryption-changing"),
            t!(L10N, "check-encryption-changing-detail"),
        ),
    }
}

fn fast_startup(facts: &Facts) -> Finding {
    if facts.fast_startup {
        finding(
            Topic::FastStartup,
            Level::Note,
            t!(L10N, "check-fast-startup-on"),
            t!(L10N, "check-fast-startup-on-detail"),
        )
    } else {
        finding(
            Topic::FastStartup,
            Level::Fine,
            t!(L10N, "check-fast-startup-off"),
            t!(L10N, "check-fast-startup-off-detail"),
        )
    }
}

fn elsewhere(place: &Place) -> String {
    match place.kind {
        Kind::Whole => t!(
            L10N,
            "check-space-erase-drive",
            drive = place.drive.name.as_str()
        ),
        Kind::Windows | Kind::Free => {
            t!(
                L10N,
                "check-space-other-drive",
                drive = place.drive.name.as_str()
            )
        }
    }
}

fn space(facts: &Facts, live: u64) -> Finding {
    let needed = smallest_luft(facts.esp_size) + live;
    let free = facts
        .places
        .iter()
        .find(|place| place.kind == Kind::Windows)
        .map_or(0, |place| place.free);
    let other = facts
        .places
        .iter()
        .filter(|place| place.kind != Kind::Windows)
        .max_by_key(|place| (place.kind == Kind::Free, place.most));
    if facts.most_room >= needed {
        finding(
            Topic::Space,
            Level::Fine,
            t!(
                L10N,
                "check-space-up-to",
                size = gib(facts.most_room - live)
            ),
            if free > 0 {
                t!(L10N, "check-space-free-already", size = gib(free))
            } else {
                t!(L10N, "check-space-up-to-detail")
            },
        )
    } else if let Some(place) = other {
        finding(
            Topic::Space,
            Level::Fine,
            t!(L10N, "check-space-up-to", size = gib(place.most)),
            elsewhere(place),
        )
    } else {
        finding(
            Topic::Space,
            Level::Blocks,
            t!(L10N, "check-space-short"),
            t!(
                L10N,
                "check-space-short-windows",
                needed = gib(needed),
                missing = gib(needed - facts.most_room).max(1)
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
    let count = names.len();
    if count == 0 {
        return None;
    }
    let title = t!(L10N, "check-start-entries", count = count);
    let detail = t!(
        L10N,
        "check-start-entries-detail",
        count = count,
        names = names.join(", ")
    );
    Some(finding(Topic::StartEntries, Level::Note, title, detail).with(Action::Tidy))
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
    use crate::plan::places::Drive;
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
            places: Vec::new(),
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
    fn a_full_windows_is_fine_when_another_drive_has_room() {
        let mut facts = laptop();
        facts.most_room = 10 * GIB;
        facts.places = vec![Place {
            id: "whole:3".into(),
            kind: Kind::Whole,
            drive: Drive {
                name: "WDC WD20EZBX".into(),
                size: 2000 * GIB,
                windows: false,
            },
            free: 0,
            smallest: 1990 * GIB,
            most: 1990 * GIB,
            contents: Vec::new(),
        }];
        let findings = evaluate(&facts, Some(4 * GIB));
        let space = findings
            .iter()
            .find(|finding| finding.topic == Topic::Space)
            .unwrap();
        assert_eq!(space.level, Level::Fine);
        assert!(space.detail.contains("WDC WD20EZBX"));
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
