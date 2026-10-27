use luft_i18n::t;
use luft_meet::Layout;

use super::common::{
    Finding, LIVE_ESTIMATE, Level, Topic, download, finding, gib, graphics, processor, secure_boot,
    tpm, wifi,
};
use super::facts::{Firmware, LinuxFacts, Platform, Readable};
use crate::L10N;

const MIB: u64 = 1 << 20;
pub const START_FILES: u64 = 16 * MIB;
const SPARE: u64 = 1 << 30;

fn startup(facts: &LinuxFacts) -> Finding {
    let machine = &facts.machine;
    match (machine.firmware, machine.gpt, facts.esp_free) {
        (Firmware::Bios, _, _) => finding(
            Topic::Startup,
            Level::Blocks,
            t!(L10N, "check-startup-bios"),
            t!(L10N, "check-startup-bios-linux"),
        ),
        (Firmware::Uefi, false, _) => finding(
            Topic::Startup,
            Level::Blocks,
            t!(L10N, "check-startup-mbr"),
            t!(L10N, "check-startup-mbr-linux"),
        ),
        (Firmware::Uefi, true, None) => finding(
            Topic::Startup,
            Level::Blocks,
            t!(L10N, "check-startup-no-esp"),
            t!(L10N, "check-startup-no-esp-detail"),
        ),
        (Firmware::Uefi, true, Some(free)) if free < START_FILES => finding(
            Topic::StartFiles,
            Level::Blocks,
            t!(L10N, "check-startup-esp-full"),
            t!(
                L10N,
                "check-startup-esp-full-detail",
                size = START_FILES / MIB
            ),
        ),
        (Firmware::Uefi, true, Some(_)) => finding(
            Topic::Startup,
            Level::Fine,
            t!(L10N, "check-startup-uefi"),
            t!(
                L10N,
                "check-startup-uefi-linux",
                system = facts.system.as_str()
            ),
        ),
    }
}

fn folder(facts: &LinuxFacts) -> Finding {
    let place = &facts.place;
    match place.readable {
        Readable::Yes => finding(
            Topic::Folder,
            Level::Fine,
            t!(L10N, "check-folder-fine"),
            t!(
                L10N,
                "check-folder-fine-detail",
                filesystem = place.filesystem.as_str()
            ),
        ),
        Readable::Encrypted => finding(
            Topic::Folder,
            Level::Blocks,
            t!(L10N, "check-folder-encrypted"),
            t!(L10N, "check-folder-encrypted-detail"),
        ),
        Readable::Combined => finding(
            Topic::Folder,
            Level::Blocks,
            t!(L10N, "check-folder-combined"),
            t!(L10N, "check-folder-combined-detail"),
        ),
        Readable::Filesystem => finding(
            Topic::Folder,
            Level::Blocks,
            t!(
                L10N,
                "check-folder-filesystem",
                filesystem = place.filesystem.as_str()
            ),
            t!(L10N, "check-folder-filesystem-detail"),
        ),
    }
}

fn space(facts: &LinuxFacts, live: u64) -> Finding {
    let needed = live + SPARE;
    if facts.place.free >= needed {
        finding(
            Topic::Space,
            Level::Fine,
            t!(L10N, "check-space-free", size = gib(facts.place.free)),
            t!(L10N, "check-space-free-linux", size = gib(live)),
        )
    } else {
        finding(
            Topic::Space,
            Level::Blocks,
            t!(L10N, "check-space-short"),
            t!(
                L10N,
                "check-space-short-linux",
                needed = gib(needed),
                missing = gib(needed - facts.place.free).max(1)
            ),
        )
    }
}

fn system(facts: &LinuxFacts) -> Finding {
    let name = facts.system.as_str();
    match facts.layout {
        Layout::Subvolumes | Layout::SeparateHome => finding(
            Topic::System,
            Level::Fine,
            name,
            t!(L10N, "check-system-replaceable"),
        ),
        Layout::Single => finding(
            Topic::System,
            Level::Note,
            name,
            t!(L10N, "check-system-single"),
        ),
        Layout::Encrypted => finding(
            Topic::System,
            Level::Note,
            name,
            t!(L10N, "check-system-encrypted"),
        ),
        Layout::Unknown => finding(
            Topic::System,
            Level::Note,
            name,
            t!(L10N, "check-system-unknown"),
        ),
    }
}

pub fn evaluate(facts: &LinuxFacts, live: Option<u64>) -> Vec<Finding> {
    let mut findings = vec![
        processor(&facts.machine, Platform::Linux),
        startup(facts),
        folder(facts),
        space(facts, live.unwrap_or(LIVE_ESTIMATE)),
        system(facts),
        secure_boot(&facts.machine),
        tpm(&facts.machine),
        graphics(&facts.machine),
        wifi(&facts.machine),
    ];
    findings.extend(download(live));
    findings
}

#[cfg(test)]
mod tests {
    use super::super::facts::{Architecture, Device, LinuxPlace, Machine};
    use super::*;

    const GIB: u64 = 1 << 30;

    fn fedora() -> LinuxFacts {
        LinuxFacts {
            machine: Machine {
                architecture: Architecture::X64,
                firmware: Firmware::Uefi,
                gpt: true,
                secure_boot: Some(true),
                opens_settings: true,
                maker: Some("Framework".into()),
                tpm: Some("2.0".into()),
                graphics: vec![Device {
                    name: "Radeon 780M".into(),
                    vendor: 0x1002,
                }],
                wifi: Vec::new(),
            },
            system: "Fedora Linux 45 (Workstation Edition)".into(),
            layout: Layout::Subvolumes,
            esp_free: Some(560 * MIB),
            place: LinuxPlace {
                filesystem: "btrfs".into(),
                readable: Readable::Yes,
                free: 200 * GIB,
            },
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
    fn fedora_as_it_installs_is_ready_to_try_and_replace() {
        let findings = evaluate(&fedora(), Some(3 * GIB));
        assert!(findings.iter().all(|finding| finding.level == Level::Fine));
    }

    #[test]
    fn an_encrypted_drive_can_t_hold_luft() {
        let mut facts = fedora();
        facts.place.readable = Readable::Encrypted;
        assert_eq!(
            level(&evaluate(&facts, Some(3 * GIB)), Topic::Folder),
            Level::Blocks
        );
    }

    #[test]
    fn everything_on_one_partition_can_be_tried_but_not_replaced() {
        let mut facts = fedora();
        facts.layout = Layout::Single;
        let findings = evaluate(&facts, Some(3 * GIB));
        assert_eq!(level(&findings, Topic::System), Level::Note);
        assert!(
            findings
                .iter()
                .all(|finding| finding.level != Level::Blocks)
        );
    }

    #[test]
    fn a_full_esp_or_drive_stops_it() {
        let mut facts = fedora();
        facts.esp_free = Some(START_FILES - 1);
        assert_eq!(
            level(&evaluate(&facts, Some(3 * GIB)), Topic::StartFiles),
            Level::Blocks
        );
        let mut facts = fedora();
        facts.place.free = 3 * GIB;
        assert_eq!(
            level(&evaluate(&facts, Some(3 * GIB)), Topic::Space),
            Level::Blocks
        );
    }
}
