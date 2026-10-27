use super::*;
use crate::systems::facts::WindowsInstall;
use crate::udisks::snapshot::{Kind as DriveKind, PartitionTable};
use crate::udisks::volumes::Encryption;

const GIB: u64 = 1 << 30;
const LINUX: &str = "0fc63daf-8483-4772-8e79-3d69d8477de4";

fn volume(number: u32, kind: &str, filesystem: &str, label: &str, size: u64) -> Volume {
    Volume {
        block: format!("/block/vda{number}"),
        device: format!("/dev/vda{number}"),
        number: Some(number),
        offset: u64::from(number) * 100 * GIB,
        size,
        label: label.to_owned(),
        usage: if filesystem == BITLOCKER {
            "crypto"
        } else {
            FILESYSTEM
        }
        .to_owned(),
        fs_type: filesystem.to_owned(),
        uuid: String::new(),
        mount_points: Vec::new(),
        used: None,
        swap_active: false,
        system: false,
        partition_type: Some(kind.to_owned()),
        partition_name: String::new(),
        partition_uuid: format!("00000000-0000-4000-8000-{number:012}"),
        flags: Vec::new(),
        logical: false,
        encryption: (filesystem == BITLOCKER).then(|| Encryption {
            kind: "bitlk".to_owned(),
            cleartext: None,
        }),
        startup: None,
        job: None,
    }
}

fn running(mut volume: Volume) -> Volume {
    volume.mount_points = vec!["/sysroot".to_owned()];
    volume.system = true;
    volume
}

fn drive(id: &str, volumes: Vec<Volume>) -> Drive {
    Drive {
        id: id.to_owned(),
        block: format!("/block/{id}"),
        device: format!("/dev/{id}"),
        name: id.to_owned(),
        model: String::new(),
        serial: String::new(),
        size: 2048 * GIB,
        kind: DriveKind::Nvme,
        removable: false,
        can_power_off: false,
        system: volumes.iter().any(Volume::in_use_by_system),
        read_only: false,
        table: Some(PartitionTable::Gpt),
        extended: None,
        segments: volumes
            .into_iter()
            .map(|volume| Segment::Volume(Box::new(volume)))
            .collect(),
        health: None,
        job: None,
        sort_key: String::new(),
    }
}

fn uuid_of(number: u32) -> String {
    format!("00000000-0000-4000-8000-{number:012}")
}

fn loader(folder: &str, kind: &str, named: &[u32]) -> OtherStartup {
    OtherStartup {
        esp: uuid_of(1),
        folder: folder.to_owned(),
        kind: kind.to_owned(),
        entries: vec![(0, "Windows Boot Manager".to_owned())],
        partitions: named.iter().copied().map(uuid_of).collect(),
    }
}

fn facts(startups: Vec<OtherStartup>) -> Facts {
    Facts {
        luft_starts: true,
        startups,
        windows: vec![WindowsInstall {
            device: "/dev/vda3".to_owned(),
            version: Some("Windows 11 Pro".to_owned()),
        }],
        old_system: None,
    }
}

fn next_to_windows(extra: Vec<Volume>) -> Snapshot {
    let mut volumes = vec![
        volume(1, ESP, "vfat", "SYSTEM", GIB / 10),
        volume(2, RESERVED, "", "", GIB / 64),
        volume(3, BASIC_DATA, NTFS, "Windows", 200 * GIB),
        volume(4, XBOOTLDR, "vfat", "", 2 * GIB),
        running(volume(
            5,
            "4f68bce3-e8cd-4db1-96e7-fbcaf984b709",
            "btrfs",
            "",
            300 * GIB,
        )),
        volume(6, WINDOWS_RECOVERY, NTFS, "", GIB / 2),
        volume(7, BASIC_DATA, "exfat", "Luft", 6 * GIB),
    ];
    volumes.extend(extra);
    Snapshot {
        drives: vec![drive("nvme0", volumes)],
    }
}

fn blocks(system: &System) -> Vec<&str> {
    system
        .parts
        .iter()
        .map(|part| part.device.as_str())
        .collect()
}

#[test]
fn windows_next_to_luft_takes_only_its_own_partitions() {
    let found = systems(
        &next_to_windows(Vec::new()),
        &facts(vec![loader("EFI/Microsoft", WINDOWS_STARTUP, &[3, 6])]),
    );
    let [windows] = found.as_slice() else {
        panic!("expected one system, found {}", found.len());
    };
    assert_eq!(windows.name, "Windows 11");
    assert_eq!(
        blocks(windows),
        ["/dev/vda3", "/dev/vda2", "/dev/vda6", "/dev/vda7"]
    );
    assert_eq!(windows.startups.len(), 1);
    assert_eq!(windows.files.as_deref(), Some("/block/vda3"));
}

#[test]
fn a_data_partition_windows_doesnt_name_stays() {
    let data = volume(8, BASIC_DATA, BITLOCKER, "Data", 500 * GIB);
    let found = systems(
        &next_to_windows(vec![data]),
        &facts(vec![loader("EFI/Microsoft", WINDOWS_STARTUP, &[3])]),
    );
    assert_eq!(found.len(), 1);
    assert!(!blocks(&found[0]).contains(&"/dev/vda8"));
}

#[test]
fn bitlocker_windows_is_found_without_its_boot_files() {
    let mut snapshot = next_to_windows(Vec::new());
    let Segment::Volume(windows) = &mut snapshot.drives[0].segments[2] else {
        unreachable!();
    };
    **windows = volume(3, BASIC_DATA, BITLOCKER, "", 200 * GIB);
    let mut facts = facts(Vec::new());
    facts.windows.clear();
    let found = systems(&snapshot, &facts);
    assert_eq!(found.len(), 1);
    assert!(found[0].bitlocker);
    assert_eq!(found[0].name, "Windows");
    assert_eq!(found[0].files, None);

    let second = volume(8, BASIC_DATA, BITLOCKER, "", 50 * GIB);
    snapshot.drives[0]
        .segments
        .push(Segment::Volume(Box::new(second)));
    assert!(systems(&snapshot, &facts).is_empty());
}

#[test]
fn leftovers_on_another_drive_dont_keep_windows_boot_manager() {
    let mut snapshot = next_to_windows(Vec::new());
    snapshot
        .drives
        .push(drive("sda", vec![volume(9, RESERVED, "", "", GIB / 64)]));
    let found = systems(
        &snapshot,
        &facts(vec![loader("EFI/Microsoft", WINDOWS_STARTUP, &[3])]),
    );
    assert_eq!(found.len(), 2);
    assert_eq!(found[0].startups.len(), 1);
    assert!(found[1].startups.is_empty());
}

#[test]
fn two_windows_keep_windows_boot_manager() {
    let second = volume(8, BASIC_DATA, NTFS, "Windows 10", 100 * GIB);
    let found = systems(
        &next_to_windows(vec![second]),
        &facts(vec![loader("EFI/Microsoft", WINDOWS_STARTUP, &[3, 8])]),
    );
    assert_eq!(found.len(), 2);
    assert!(
        found
            .iter()
            .all(|system| system.startups.is_empty() && system.parts.len() == 1)
    );
}

#[test]
fn the_linux_that_starts_this_system_isnt_offered() {
    let mut snapshot = next_to_windows(vec![volume(8, LINUX, "ext4", "", 400 * GIB)]);
    snapshot.drives[0].segments.remove(2);
    let found = systems(
        &snapshot,
        &facts(vec![
            loader("EFI/fedora", GRUB_STARTUP, &[5]),
            loader("EFI/ubuntu", GRUB_STARTUP, &[8]),
        ]),
    );
    let names: Vec<&str> = found.iter().map(|system| system.name.as_str()).collect();
    assert_eq!(names, ["Windows", "Ubuntu"]);
    assert_eq!(blocks(&found[1]), ["/dev/vda8"]);
}

#[test]
fn the_old_system_luft_kept_comes_with_its_boot_loader() {
    let snapshot = Snapshot {
        drives: vec![drive(
            "nvme0",
            vec![
                volume(1, ESP, "vfat", "", GIB),
                running(volume(
                    2,
                    "4f68bce3-e8cd-4db1-96e7-fbcaf984b709",
                    "btrfs",
                    "",
                    900 * GIB,
                )),
                volume(3, LINUX, "ext4", "", GIB),
            ],
        )],
    };
    let mut facts = facts(vec![loader("EFI/fedora", GRUB_STARTUP, &[3])]);
    facts.old_system = Some(OldSystem {
        name: "Fedora Linux 42".to_owned(),
        size: 40 * GIB,
        subvolume: Some("old-system".to_owned()),
        partitions: vec![uuid_of(3)],
        startups: vec!["EFI/fedora".to_owned()],
        folder: None,
    });
    let found = systems(&snapshot, &facts);
    let [old] = found.as_slice() else {
        panic!("expected only the old system, found {}", found.len());
    };
    assert_eq!(old.kind, Kind::OldSystem);
    assert_eq!(blocks(old), ["/dev/vda3"]);
    assert_eq!(old.size, 41 * GIB);
    assert_eq!(old.startups[0].folder, "EFI/fedora");
}

#[test]
fn nothing_is_offered_until_luft_starts_the_computer() {
    let mut facts = facts(vec![loader("EFI/Microsoft", WINDOWS_STARTUP, &[3])]);
    facts.luft_starts = false;
    assert!(systems(&next_to_windows(Vec::new()), &facts).is_empty());
}
