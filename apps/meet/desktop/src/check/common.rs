use luft_i18n::t;
use luft_variant::Variant;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::facts::{Architecture, BROADCOM, Machine, Platform};
use crate::L10N;
const GIB: u64 = 1 << 30;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Fine,
    Note,
    Blocks,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
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
    Folder,
    StartFiles,
    System,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    FirmwareSettings,
    Tidy,
    ChooseIso,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Type)]
pub struct Finding {
    pub topic: Topic,
    pub level: Level,
    pub title: String,
    pub detail: String,
    pub action: Option<Action>,
}

pub fn finding(
    topic: Topic,
    level: Level,
    title: impl Into<String>,
    detail: impl Into<String>,
) -> Finding {
    Finding {
        topic,
        level,
        title: title.into(),
        detail: detail.into(),
        action: None,
    }
}

impl Finding {
    pub fn with(self, action: Action) -> Self {
        Self {
            action: Some(action),
            ..self
        }
    }
}

pub fn gib(bytes: u64) -> u64 {
    bytes.div_ceil(GIB)
}

pub fn processor(machine: &Machine, platform: Platform) -> Finding {
    match machine.architecture {
        Architecture::X64 => finding(
            Topic::Processor,
            Level::Fine,
            t!(L10N, "check-processor-x64"),
            t!(L10N, "check-processor-x64-detail"),
        ),
        Architecture::Arm64 => finding(
            Topic::Processor,
            Level::Blocks,
            t!(L10N, "check-processor-arm"),
            t!(L10N, "check-processor-arm-detail"),
        ),
        Architecture::Other => finding(
            Topic::Processor,
            Level::Blocks,
            match platform {
                Platform::Windows => t!(L10N, "check-processor-32-bit-windows"),
                Platform::Linux => t!(L10N, "check-processor-32-bit-system"),
            },
            t!(L10N, "check-processor-32-bit-detail"),
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
        key: "check-firmware-key-lenovo",
        place: "check-firmware-place-security",
    },
    Maker {
        names: &["dell"],
        shown: "Dell",
        key: "check-firmware-key-f2",
        place: "check-firmware-place-boot-configuration",
    },
    Maker {
        names: &["hp", "hewlett"],
        shown: "HP",
        key: "check-firmware-key-f10",
        place: "check-firmware-place-security-or-advanced",
    },
    Maker {
        names: &["asus"],
        shown: "ASUS",
        key: "check-firmware-key-f2-or-delete",
        place: "check-firmware-place-security-or-boot",
    },
    Maker {
        names: &["acer"],
        shown: "Acer",
        key: "check-firmware-key-f2",
        place: "check-firmware-place-boot",
    },
    Maker {
        names: &["micro-star", "msi"],
        shown: "MSI",
        key: "check-firmware-key-delete",
        place: "check-firmware-place-settings",
    },
    Maker {
        names: &["gigabyte"],
        shown: "Gigabyte",
        key: "check-firmware-key-delete",
        place: "check-firmware-place-boot",
    },
    Maker {
        names: &["microsoft"],
        shown: "Surface",
        key: "check-firmware-key-volume-up",
        place: "check-firmware-place-security",
    },
];

fn maker(name: Option<&str>) -> Option<&'static Maker> {
    let name = name?.to_ascii_lowercase();
    MAKERS
        .iter()
        .find(|maker| maker.names.iter().any(|known| name.starts_with(known)))
}

fn turning_on_secure_boot(machine: &Machine) -> String {
    let maker = maker(machine.maker.as_deref());
    match (machine.opens_settings, maker) {
        (true, Some(maker)) => t!(
            L10N,
            "check-secure-boot-restart-into",
            place = L10N.t(maker.place)
        ),
        (true, None) => t!(L10N, "check-secure-boot-restart-into-anywhere"),
        (false, Some(maker)) => t!(
            L10N,
            "check-secure-boot-turn-on",
            key = L10N.t(maker.key),
            maker = maker.shown,
            place = L10N.t(maker.place)
        ),
        (false, None) => t!(L10N, "check-secure-boot-turn-on-anywhere"),
    }
}

pub fn secure_boot(machine: &Machine) -> Finding {
    match machine.secure_boot {
        Some(true) => finding(
            Topic::SecureBoot,
            Level::Fine,
            t!(L10N, "check-secure-boot-on"),
            t!(L10N, "check-secure-boot-on-detail"),
        ),
        _ => {
            let found = finding(
                Topic::SecureBoot,
                Level::Note,
                t!(L10N, "check-secure-boot-off"),
                t!(
                    L10N,
                    "check-secure-boot-off-detail",
                    turningOn = turning_on_secure_boot(machine)
                ),
            );
            if machine.opens_settings {
                found.with(Action::FirmwareSettings)
            } else {
                found
            }
        }
    }
}

pub fn tpm(machine: &Machine) -> Finding {
    match machine.tpm.as_deref() {
        Some(version) if version.starts_with('2') => finding(
            Topic::Tpm,
            Level::Fine,
            "TPM 2.0",
            t!(L10N, "check-tpm-detail"),
        ),
        _ => finding(
            Topic::Tpm,
            Level::Note,
            t!(L10N, "check-tpm-missing"),
            t!(L10N, "check-tpm-missing-detail"),
        ),
    }
}

pub fn graphics(machine: &Machine) -> Finding {
    let names = machine
        .graphics
        .iter()
        .map(|device| device.name.as_str())
        .collect::<Vec<_>>()
        .join(", ");
    if machine.variant() == Variant::Nvidia {
        finding(
            Topic::Graphics,
            Level::Fine,
            names,
            t!(L10N, "check-graphics-nvidia"),
        )
    } else {
        finding(
            Topic::Graphics,
            Level::Fine,
            if names.is_empty() {
                t!(L10N, "check-graphics")
            } else {
                names
            },
            t!(L10N, "check-graphics-detail"),
        )
    }
}

pub fn wifi(machine: &Machine) -> Finding {
    match machine.wifi.first() {
        None => finding(
            Topic::Wifi,
            Level::Fine,
            t!(L10N, "check-wifi-missing"),
            t!(L10N, "check-wifi-missing-detail"),
        ),
        Some(device) if device.vendor == BROADCOM => finding(
            Topic::Wifi,
            Level::Note,
            &device.name,
            t!(L10N, "check-wifi-broadcom"),
        ),
        Some(device) => finding(
            Topic::Wifi,
            Level::Fine,
            &device.name,
            t!(L10N, "check-wifi-detail"),
        ),
    }
}

pub const LIVE_ESTIMATE: u64 = 4 * GIB;

pub fn download(live: Option<u64>) -> Option<Finding> {
    live.is_none().then(|| {
        finding(
            Topic::Download,
            Level::Blocks,
            t!(L10N, "check-download-unavailable"),
            t!(L10N, "check-download-unavailable-detail"),
        )
        .with(Action::ChooseIso)
    })
}
