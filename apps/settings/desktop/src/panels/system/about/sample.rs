use super::{About, Storage};

const GIB: u64 = 1024 * 1024 * 1024;

pub(super) fn about(
    device_name: String,
    hostname: String,
    version: Option<String>,
    built: Option<u64>,
) -> About {
    About {
        device_name,
        hostname,
        system: "Luft Alizé".to_owned(),
        kernel: "7.2.4-300.fc45.x86_64".to_owned(),
        version,
        built,
        processor: Some("AMD Ryzen 7 7700 8-Core Processor × 16".to_owned()),
        graphics: vec!["NVIDIA GeForce RTX 4060".to_owned()],
        memory: Some(32 * GIB),
        storage: Some(Storage {
            total: 931 * GIB,
            free: 612 * GIB,
            manageable: true,
        }),
    }
}
