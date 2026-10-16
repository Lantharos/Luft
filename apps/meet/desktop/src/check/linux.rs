use luft_meet::Layout;
use serde::{Deserialize, Serialize};

use super::common::{
    Finding, LIVE_ESTIMATE, Level, Topic, download, finding, gib, graphics, processor, secure_boot,
    tpm, wifi,
};
use super::facts::{Firmware, Machine};

const MIB: u64 = 1 << 20;
pub const START_FILES: u64 = 16 * MIB;
const SPARE: u64 = 1 << 30;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Readable {
    Yes,
    Encrypted,
    Combined,
    Filesystem,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    pub filesystem: String,
    pub readable: Readable,
    pub free: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct LinuxFacts {
    #[serde(flatten)]
    pub machine: Machine,
    pub system: String,
    pub layout: Layout,
    pub esp_free: Option<u64>,
    pub place: Place,
}

fn startup(facts: &LinuxFacts) -> Finding {
    let machine = &facts.machine;
    match (machine.firmware, machine.gpt, facts.esp_free) {
        (Firmware::Bios, _, _) => finding(
            Topic::Startup,
            Level::Blocks,
            "Starts in legacy BIOS mode",
            "Luft needs UEFI. Turn it on in the firmware settings, along with the system already here, then check again.",
        ),
        (Firmware::Uefi, false, _) => finding(
            Topic::Startup,
            Level::Blocks,
            "The drive uses an old partition table",
            "Luft needs a GPT drive to start from.",
        ),
        (Firmware::Uefi, true, None) => finding(
            Topic::Startup,
            Level::Blocks,
            "No EFI system partition",
            "Luft adds its start files next to the ones already on the EFI system partition, and there isn't one.",
        ),
        (Firmware::Uefi, true, Some(free)) if free < START_FILES => finding(
            Topic::StartFiles,
            Level::Blocks,
            "The EFI system partition is full",
            &format!(
                "Luft needs {} MB there for its start files. Old kernels or start entries usually take up the space.",
                START_FILES / MIB
            ),
        ),
        (Firmware::Uefi, true, Some(_)) => finding(
            Topic::Startup,
            Level::Fine,
            "Starts with UEFI",
            &format!(
                "Luft adds its own start entry, and {} keeps starting as it does now.",
                facts.system
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
            "Nothing gets repartitioned",
            &format!(
                "Luft is kept as a file on your {} drive and starts from there.",
                place.filesystem
            ),
        ),
        Readable::Encrypted => finding(
            Topic::Folder,
            Level::Blocks,
            "Your files are on an encrypted drive",
            "Luft can't start from an encrypted drive yet. Use a USB stick to try it instead.",
        ),
        Readable::Combined => finding(
            Topic::Folder,
            Level::Blocks,
            "Your files span more than one partition",
            "Luft can't start from LVM or RAID yet. Use a USB stick to try it instead.",
        ),
        Readable::Filesystem => finding(
            Topic::Folder,
            Level::Blocks,
            &format!("Luft can't start from {}", place.filesystem),
            "It starts from ext4, btrfs and XFS drives. Use a USB stick to try it instead.",
        ),
    }
}

fn space(facts: &LinuxFacts, live: u64) -> Finding {
    let needed = live + SPARE;
    if facts.place.free >= needed {
        finding(
            Topic::Space,
            Level::Fine,
            &format!("{} GB free", gib(facts.place.free)),
            &format!("Luft takes about {} GB while you try it.", gib(live)),
        )
    } else {
        finding(
            Topic::Space,
            Level::Blocks,
            "Not enough free space",
            &format!(
                "Luft needs about {} GB to start from. Free up {} GB, then check again.",
                gib(needed),
                gib(needed - facts.place.free).max(1)
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
            "Luft can take its place and keep your files, your account and your settings.",
        ),
        Layout::Single => finding(
            Topic::System,
            Level::Note,
            name,
            "Your files share one partition with the system, so replacing it while keeping them isn't supported yet. Trying and installing Luft work.",
        ),
        Layout::Encrypted => finding(
            Topic::System,
            Level::Note,
            name,
            "It's encrypted, so replacing it while keeping your files isn't supported yet.",
        ),
        Layout::Unknown => finding(
            Topic::System,
            Level::Note,
            name,
            "Its drive is laid out in a way Luft can't replace yet while keeping your files.",
        ),
    }
}

pub fn evaluate(facts: &LinuxFacts, live: Option<u64>) -> Vec<Finding> {
    let mut findings = vec![
        processor(&facts.machine),
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
    use super::super::facts::{Architecture, Device, Platform};
    use super::*;

    const GIB: u64 = 1 << 30;

    fn fedora() -> LinuxFacts {
        LinuxFacts {
            machine: Machine {
                platform: Platform::Linux,
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
            place: Place {
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
