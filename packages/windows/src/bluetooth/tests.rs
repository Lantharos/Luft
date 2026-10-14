use std::fs;
use std::path::PathBuf;

use super::{Keys, bluez, pairings};
use crate::System;
use crate::testing::{HiveBuilder, Value};

const KEYS: &str = r"ControlSet001\Services\BTHPORT\Parameters\Keys\c8e265a1b2c3";
const MOUSE: &str = r"ControlSet001\Services\BTHPORT\Parameters\Keys\c8e265a1b2c3\d0d1d2d3d4d5";
const HEADPHONES: &str = r"ControlSet001\Services\BTHPORT\Parameters\Devices\001122334455";

fn counting(from: u8) -> Vec<u8> {
    (from..from + 16).collect()
}

fn windows_pairings() -> Vec<u8> {
    HiveBuilder::default()
        .set("Select", "Current", Value::Dword(1))
        .set(KEYS, "001122334455", Value::Binary(counting(0x10)))
        .set(HEADPHONES, "Name", Value::Binary(b"Studio Buds\0".to_vec()))
        .set(HEADPHONES, "COD", Value::Dword(0x240404))
        .set(MOUSE, "LTK", Value::Binary(counting(0xa0)))
        .set(MOUSE, "KeyLength", Value::Dword(16))
        .set(MOUSE, "ERand", Value::Qword(0x1122334455667788))
        .set(MOUSE, "EDIV", Value::Dword(0xbeef))
        .set(MOUSE, "IRK", Value::Binary(counting(0xc0)))
        .set(MOUSE, "Address", Value::Qword(0xd0d1d2d3d4d5))
        .set(MOUSE, "AddressType", Value::Dword(1))
        .set(MOUSE, "AuthReq", Value::Dword(0x2d))
        .set(
            r"ControlSet001\Enum\BTHLE\Dev_d0d1d2d3d4d5\7&2e5d&0&D0D1D2D3D4D5_C00000000",
            "FriendlyName",
            Value::Sz("MX Anywhere 3".into()),
        )
        .build()
}

struct Storage(PathBuf);

impl Storage {
    fn new(name: &str) -> Self {
        Self(std::env::temp_dir().join(format!("luft-bluetooth-{}-{name}", std::process::id())))
    }

    fn info(&self, device: &str) -> String {
        fs::read_to_string(self.0.join("C8:E2:65:A1:B2:C3").join(device).join("info")).unwrap()
    }
}

impl Drop for Storage {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

#[test]
fn reads_classic_and_low_energy_pairings() {
    let hive = windows_pairings();
    let found = pairings(&System::new(&hive).unwrap()).unwrap();
    assert_eq!(found.len(), 2);

    let headphones = &found[0];
    assert_eq!(headphones.adapter.to_string(), "C8:E2:65:A1:B2:C3");
    assert_eq!(headphones.device.to_string(), "00:11:22:33:44:55");
    assert_eq!(headphones.name.as_deref(), Some("Studio Buds"));
    assert_eq!(headphones.class, Some(0x240404));

    let mouse = &found[1];
    assert_eq!(mouse.device.to_string(), "D0:D1:D2:D3:D4:D5");
    assert_eq!(mouse.name.as_deref(), Some("MX Anywhere 3"));
    let Keys::LowEnergy {
        random_address,
        long_term_key: Some(key),
        ..
    } = &mouse.keys
    else {
        panic!("the mouse has a long-term key");
    };
    assert!(random_address);
    assert!(key.authenticated);
    assert_eq!((key.ediv, key.rand), (0xbeef, 0x1122334455667788));
}

#[test]
fn writes_new_devices_for_bluez() {
    let hive = windows_pairings();
    let found = pairings(&System::new(&hive).unwrap()).unwrap();
    let storage = Storage::new("new");

    assert_eq!(bluez::import(&storage.0, &found).unwrap(), 2);

    assert_eq!(
        storage.info("00:11:22:33:44:55"),
        "[General]\nTrusted=true\nBlocked=false\nSupportedTechnologies=BR/EDR;\nName=Studio Buds\nClass=0x240404\n\n\
         [LinkKey]\nKey=101112131415161718191A1B1C1D1E1F\nType=4\nPINLength=0\n"
    );
    assert_eq!(
        storage.info("D0:D1:D2:D3:D4:D5"),
        "[General]\nTrusted=true\nBlocked=false\nSupportedTechnologies=LE;\nName=MX Anywhere 3\nAddressType=static\n\n\
         [LongTermKey]\nKey=A0A1A2A3A4A5A6A7A8A9AAABACADAEAF\nAuthenticated=1\nEncSize=16\nEDiv=48879\nRand=1234605616436508552\n\n\
         [IdentityResolvingKey]\nKey=C0C1C2C3C4C5C6C7C8C9CACBCCCDCECF\n"
    );
    assert!(bluez::waiting(&storage.0, &found).is_empty());
}

#[test]
fn updates_the_key_of_a_device_paired_in_both() {
    let hive = windows_pairings();
    let found = pairings(&System::new(&hive).unwrap()).unwrap();
    let storage = Storage::new("update");
    let device = storage.0.join("C8:E2:65:A1:B2:C3/00:11:22:33:44:55");
    fs::create_dir_all(&device).unwrap();
    fs::write(
        device.join("info"),
        "[General]\nName=Buds\nTrusted=false\n\n[LinkKey]\nKey=00000000000000000000000000000000\nType=5\nPINLength=0\n\n[DeviceID]\nVendor=76\n",
    )
    .unwrap();

    assert_eq!(bluez::waiting(&storage.0, &found).len(), 2);
    bluez::import(&storage.0, &found[..1]).unwrap();

    assert_eq!(
        storage.info("00:11:22:33:44:55"),
        "[General]\nName=Buds\nTrusted=false\nClass=0x240404\n\n\
         [LinkKey]\nKey=101112131415161718191A1B1C1D1E1F\nType=5\nPINLength=0\n\n\
         [DeviceID]\nVendor=76\n"
    );
}
