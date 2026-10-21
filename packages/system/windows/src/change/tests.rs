use std::fs;
use std::path::PathBuf;

use super::disk::rewrite;
use super::{Change, edited};
use crate::System;
use crate::testing::{HiveBuilder, Value};

const POWER: &str = r"Control\Session Manager\Power";
const TIME_ZONE: &str = r"Control\TimeZoneInformation";
const BOTH: [Change; 2] = [Change::FastStartupOff, Change::UniversalClock];

fn windows_settings() -> Vec<u8> {
    HiveBuilder::default()
        .set("Select", "Current", Value::Dword(2))
        .set("Select", "Default", Value::Dword(1))
        .set(
            &format!(r"ControlSet001\{TIME_ZONE}"),
            "TimeZoneKeyName",
            Value::Sz("W. Europe Standard Time".into()),
        )
        .set(
            &format!(r"ControlSet001\{POWER}"),
            "HiberbootEnabled",
            Value::Dword(1),
        )
        .set(
            &format!(r"ControlSet002\{TIME_ZONE}"),
            "TimeZoneKeyName",
            Value::Sz("W. Europe Standard Time".into()),
        )
        .set(
            &format!(r"ControlSet002\{POWER}"),
            "HiberbootEnabled",
            Value::Dword(1),
        )
        .build()
}

#[test]
fn changes_the_current_and_default_control_sets() {
    let original = windows_settings();
    let updated = edited(&original, &BOTH).unwrap().unwrap();

    let system = System::new(&updated).unwrap();
    assert!(!system.fast_startup().unwrap());
    assert!(system.universal_clock().unwrap());
    for control_set in ["ControlSet001", "ControlSet002"] {
        assert_eq!(
            system
                .registry()
                .dword(&format!(r"{control_set}\{POWER}"), "HiberbootEnabled")
                .unwrap(),
            Some(0)
        );
        assert_eq!(
            system
                .registry()
                .dword(
                    &format!(r"{control_set}\{TIME_ZONE}"),
                    "RealTimeIsUniversal"
                )
                .unwrap(),
            Some(1)
        );
        assert_eq!(
            system
                .registry()
                .string(&format!(r"{control_set}\{TIME_ZONE}"), "TimeZoneKeyName")
                .unwrap()
                .as_deref(),
            Some("W. Europe Standard Time")
        );
    }
    assert_eq!(edited(&updated, &BOTH).unwrap(), None);
}

#[test]
fn leaves_unfinished_settings_alone() {
    let mut unfinished = windows_settings();
    unfinished[8] = unfinished[8].wrapping_add(1);
    let checksum = unfinished[..508]
        .as_chunks::<4>()
        .0
        .iter()
        .fold(0u32, |sum, word| sum ^ u32::from_le_bytes(*word));
    unfinished[508..512].copy_from_slice(&checksum.to_le_bytes());

    let error = edited(&unfinished, &BOTH).unwrap_err().to_string();
    assert!(error.contains("shut it down fully"), "{error}");
}

struct Folder(PathBuf);

impl Folder {
    fn new(name: &str) -> Self {
        let path = std::env::temp_dir().join(format!("luft-windows-{}-{name}", std::process::id()));
        fs::create_dir_all(path.join("WINDOWS/system32/Config")).unwrap();
        Self(path)
    }

    fn hive(&self) -> PathBuf {
        self.0.join("WINDOWS/system32/Config/SYSTEM")
    }
}

impl Drop for Folder {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.0).unwrap();
    }
}

#[test]
fn rewrites_the_hive_and_keeps_a_backup() {
    let folder = Folder::new("rewrite");
    let original = windows_settings();
    let updated = edited(&original, &BOTH).unwrap().unwrap();
    fs::write(folder.hive(), &original).unwrap();

    rewrite(&folder.0, &original, &updated).unwrap();

    assert_eq!(fs::read(folder.hive()).unwrap(), updated);
    assert_eq!(
        fs::read(folder.hive().with_file_name("SYSTEM.luft-backup")).unwrap(),
        original
    );
}

#[test]
fn stops_when_windows_changed_its_settings_meanwhile() {
    let folder = Folder::new("changed");
    let original = windows_settings();
    let updated = edited(&original, &BOTH).unwrap().unwrap();
    let mut newer = original.clone();
    newer.push(0);
    fs::write(folder.hive(), &newer).unwrap();

    assert!(rewrite(&folder.0, &original, &updated).is_err());
    assert_eq!(fs::read(folder.hive()).unwrap(), newer);
}
