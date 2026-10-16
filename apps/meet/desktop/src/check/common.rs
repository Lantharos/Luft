use serde::{Deserialize, Serialize};

use super::facts::{Architecture, BROADCOM, Machine, Platform};
const GIB: u64 = 1 << 30;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Fine,
    Note,
    Blocks,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
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

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    FirmwareSettings,
    Tidy,
    ChooseIso,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct Finding {
    pub topic: Topic,
    pub level: Level,
    pub title: String,
    pub detail: String,
    pub action: Option<Action>,
}

pub fn finding(topic: Topic, level: Level, title: &str, detail: &str) -> Finding {
    Finding {
        topic,
        level,
        title: title.to_owned(),
        detail: detail.to_owned(),
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

pub fn processor(machine: &Machine) -> Finding {
    match machine.architecture {
        Architecture::X64 => finding(
            Topic::Processor,
            Level::Fine,
            "64-bit Intel or AMD processor",
            "Luft runs on it.",
        ),
        Architecture::Arm64 => finding(
            Topic::Processor,
            Level::Blocks,
            "Arm processor",
            "Luft only runs on Intel and AMD processors for now.",
        ),
        Architecture::Other => finding(
            Topic::Processor,
            Level::Blocks,
            match machine.platform {
                Platform::Windows => "32-bit Windows",
                Platform::Linux => "32-bit system",
            },
            "Luft needs a 64-bit Intel or AMD processor.",
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
        key: "F2 (F1 on a ThinkPad)",
        place: "Security, then Secure Boot",
    },
    Maker {
        names: &["dell"],
        shown: "Dell",
        key: "F2",
        place: "Boot Configuration, then Secure Boot",
    },
    Maker {
        names: &["hp", "hewlett"],
        shown: "HP",
        key: "F10",
        place: "Security or Advanced, then Secure Boot Configuration",
    },
    Maker {
        names: &["asus"],
        shown: "ASUS",
        key: "F2 or Delete",
        place: "Security or Boot, then Secure Boot",
    },
    Maker {
        names: &["acer"],
        shown: "Acer",
        key: "F2",
        place: "Boot, then Secure Boot",
    },
    Maker {
        names: &["micro-star", "msi"],
        shown: "MSI",
        key: "Delete",
        place: "Settings, then Security, then Secure Boot",
    },
    Maker {
        names: &["gigabyte"],
        shown: "Gigabyte",
        key: "Delete",
        place: "Boot, then Secure Boot",
    },
    Maker {
        names: &["microsoft"],
        shown: "Surface",
        key: "volume up",
        place: "Security, then Secure Boot",
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
        (true, Some(maker)) => format!("Meet Luft can restart into the firmware settings, where it's under {}.", maker.place),
        (true, None) => "Meet Luft can restart into the firmware settings, where it's usually under Security or Boot.".to_owned(),
        (false, Some(maker)) => format!(
            "To turn it on, restart and press {} as the {} logo appears, then go to {}.",
            maker.key, maker.shown, maker.place
        ),
        (false, None) => "To turn it on, open the firmware settings while the computer starts and look under Security or Boot.".to_owned(),
    }
}

pub fn secure_boot(machine: &Machine) -> Finding {
    match machine.secure_boot {
        Some(true) => finding(
            Topic::SecureBoot,
            Level::Fine,
            "Secure Boot is on",
            "It can stay on. Luft asks once, on a blue screen, to add its key.",
        ),
        _ => {
            let detail = format!(
                "Luft works without it, though games with anti-cheat need it. {}",
                turning_on_secure_boot(machine)
            );
            let found = finding(
                Topic::SecureBoot,
                Level::Note,
                "Secure Boot is off",
                &detail,
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
            "An encrypted Luft can unlock by itself when the computer starts.",
        ),
        _ => finding(
            Topic::Tpm,
            Level::Note,
            "No TPM 2.0",
            "If you encrypt Luft, it asks for a passphrase each time it starts.",
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
    if machine.nvidia() {
        finding(
            Topic::Graphics,
            Level::Fine,
            &names,
            "Luft installs with NVIDIA's own driver.",
        )
    } else {
        finding(
            Topic::Graphics,
            Level::Fine,
            if names.is_empty() { "Graphics" } else { &names },
            "Works out of the box.",
        )
    }
}

pub fn wifi(machine: &Machine) -> Finding {
    match machine.wifi.first() {
        None => finding(
            Topic::Wifi,
            Level::Fine,
            "No Wi-Fi",
            "Use a network cable in Luft, or nothing at all.",
        ),
        Some(device) if device.vendor == BROADCOM => finding(
            Topic::Wifi,
            Level::Note,
            &device.name,
            "Some Broadcom Wi-Fi chips need a driver Luft doesn't include. Keep a network cable or a phone for USB tethering nearby.",
        ),
        Some(device) => finding(Topic::Wifi, Level::Fine, &device.name, "Works in Luft."),
    }
}

pub const LIVE_ESTIMATE: u64 = 4 * GIB;

pub fn download(live: Option<u64>) -> Option<Finding> {
    live.is_none().then(|| {
        finding(
            Topic::Download,
            Level::Blocks,
            "Luft can't be downloaded right now",
            "Meet Luft downloads about 3 GB. Check that you’re online and check again, or use a Luft ISO you already have.",
        )
        .with(Action::ChooseIso)
    })
}
