use std::path::PathBuf;

use luft_windows::testing::{HiveBuilder, Value};

const CONTROL_SET: &str = "ControlSet001";
const KEYS: &str = r"Services\BTHPORT\Parameters\Keys\c8e265a1b2c3";
const HEADPHONES: &str = r"Services\BTHPORT\Parameters\Devices\001122334455";

fn main() {
    let folder = PathBuf::from(
        std::env::args()
            .nth(1)
            .expect("a folder to write Windows into"),
    );
    let config = folder.join("Windows/System32/config");
    std::fs::create_dir_all(&config).unwrap();
    let at = |path: &str| format!(r"{CONTROL_SET}\{path}");
    let mouse = at(&format!(r"{KEYS}\d0d1d2d3d4d5"));
    let system = HiveBuilder::default()
        .set("Select", "Current", Value::Dword(1))
        .set("Select", "Default", Value::Dword(1))
        .set(
            &at(r"Control\TimeZoneInformation"),
            "TimeZoneKeyName",
            Value::Sz("W. Europe Standard Time".into()),
        )
        .set(
            &at(r"Control\Session Manager\Power"),
            "HiberbootEnabled",
            Value::Dword(1),
        )
        .set(
            &at(KEYS),
            "001122334455",
            Value::Binary((0x10..0x20).collect()),
        )
        .set(
            &at(HEADPHONES),
            "Name",
            Value::Binary(b"Studio Buds\0".to_vec()),
        )
        .set(&mouse, "LTK", Value::Binary((0xa0..0xb0).collect()))
        .set(&mouse, "KeyLength", Value::Dword(16))
        .set(&mouse, "ERand", Value::Qword(0))
        .set(&mouse, "EDIV", Value::Dword(0))
        .set(&mouse, "Address", Value::Qword(0xd0d1d2d3d4d5))
        .set(&mouse, "AddressType", Value::Dword(1))
        .set(&mouse, "AuthReq", Value::Dword(0x2d))
        .build();
    let software = HiveBuilder::default()
        .set(
            r"Microsoft\Windows NT\CurrentVersion",
            "ProductName",
            Value::Sz("Windows 10 Pro".into()),
        )
        .set(
            r"Microsoft\Windows NT\CurrentVersion",
            "CurrentBuildNumber",
            Value::Sz("26100".into()),
        )
        .build();
    std::fs::write(config.join("SYSTEM"), system).unwrap();
    std::fs::write(config.join("SOFTWARE"), software).unwrap();
    std::fs::write(folder.join("hiberfil.sys"), vec![0u8; 4096]).unwrap();
}
