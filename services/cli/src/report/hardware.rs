//! What the computer is, by kind alone: never its serial numbers, its
//! name or who uses it.

use std::fmt::Write;

const PCI_DEVICES: &str = "/sys/bus/pci/devices";
const DISPLAY_CLASS: &str = "0x03";

fn first_line(path: &str) -> String {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .lines()
        .next()
        .unwrap_or_default()
        .trim()
        .to_owned()
}

fn processor() -> String {
    let cpuinfo = std::fs::read_to_string("/proc/cpuinfo").unwrap_or_default();
    let model = cpuinfo
        .lines()
        .find_map(|line| {
            line.strip_prefix("model name")
                .and_then(|rest| rest.split_once(':'))
                .map(|(_, model)| model.trim().to_owned())
        })
        .unwrap_or_default();
    let threads = cpuinfo
        .lines()
        .filter(|line| line.starts_with("processor"))
        .count();
    format!("{model}, {threads} threads")
}

fn memory() -> String {
    let meminfo = std::fs::read_to_string("/proc/meminfo").unwrap_or_default();
    let kilobytes: u64 = meminfo
        .lines()
        .find_map(|line| line.strip_prefix("MemTotal:"))
        .and_then(|rest| rest.split_whitespace().next()?.parse().ok())
        .unwrap_or_default();
    crate::output::bytes(kilobytes * 1024)
}

fn graphics() -> Vec<String> {
    let Ok(devices) = std::fs::read_dir(PCI_DEVICES) else {
        return Vec::new();
    };
    devices
        .flatten()
        .map(|device| device.path())
        .filter(|device| {
            std::fs::read_to_string(device.join("class"))
                .is_ok_and(|class| class.starts_with(DISPLAY_CLASS))
        })
        .map(|device| {
            let read = |name: &str| {
                std::fs::read_to_string(device.join(name))
                    .unwrap_or_default()
                    .trim()
                    .trim_start_matches("0x")
                    .to_owned()
            };
            let driver = std::fs::read_link(device.join("driver"))
                .ok()
                .and_then(|driver| {
                    driver
                        .file_name()
                        .map(|name| name.to_string_lossy().into_owned())
                })
                .unwrap_or_else(|| "no driver".to_owned());
            format!("{}:{} ({driver})", read("vendor"), read("device"))
        })
        .collect()
}

pub fn summary() -> String {
    let mut text = String::new();
    let _ = writeln!(
        text,
        "Computer: {} {}",
        first_line("/sys/class/dmi/id/sys_vendor"),
        first_line("/sys/class/dmi/id/product_name")
    );
    let _ = writeln!(
        text,
        "Firmware: {} {}",
        first_line("/sys/class/dmi/id/bios_vendor"),
        first_line("/sys/class/dmi/id/bios_version")
    );
    let _ = writeln!(text, "Processor: {}", processor());
    let _ = writeln!(text, "Memory: {}", memory());
    for card in graphics() {
        let _ = writeln!(text, "Graphics: {card}");
    }
    let _ = writeln!(text, "Kernel: {}", first_line("/proc/sys/kernel/osrelease"));
    let _ = writeln!(
        text,
        "Started with UEFI: {}",
        if std::path::Path::new("/sys/firmware/efi").is_dir() {
            "yes"
        } else {
            "no"
        }
    );
    text
}
