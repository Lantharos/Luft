use std::path::Path;

use luft_trust::{TRUST, get, group};
use serde::Deserialize;
use zbus::Proxy;

const OLD_SYSTEM: &str = "/var/lib/luft-installer/old-system.json";
const PHYSICAL_ROOTS: [&str; 2] = ["/sysroot", "/"];
const WINDOWS: &str = "com.lantharos.Windows1";
const WINDOWS_PATH: &str = "/com/lantharos/Windows1";

pub struct OtherStartup {
    pub esp: String,
    pub folder: String,
    pub kind: String,
    pub entries: Vec<(u16, String)>,
    pub partitions: Vec<String>,
}

pub struct WindowsInstall {
    pub device: String,
    pub version: Option<String>,
}

#[derive(Deserialize, Default)]
pub struct OldSystem {
    pub name: String,
    #[serde(default)]
    pub size: u64,
    pub subvolume: Option<String>,
    #[serde(default)]
    pub partitions: Vec<String>,
    #[serde(default)]
    pub startups: Vec<String>,
    #[serde(skip)]
    pub folder: Option<String>,
}

pub struct EarlierLuft {
    pub drive: String,
    pub partitions: Vec<String>,
}

#[derive(Default)]
pub struct Facts {
    pub luft_starts: bool,
    pub earlier: Option<EarlierLuft>,
    pub startups: Vec<OtherStartup>,
    pub windows: Vec<WindowsInstall>,
    pub old_system: Option<OldSystem>,
}

#[derive(Deserialize)]
struct WindowsStatus {
    installations: Vec<WindowsFound>,
}

#[derive(Deserialize)]
struct WindowsFound {
    device: String,
    version: Option<String>,
}

type Listed = (String, String, String, Vec<(u16, String)>, Vec<String>);

struct Luft {
    starts: bool,
    earlier: Option<EarlierLuft>,
}

async fn luft() -> Luft {
    let properties = TRUST.read().await.ok().flatten().unwrap_or_default();
    let disk = group(&properties, "Disk");
    let partitions: Vec<String> = get(&disk, "EarlierCopy").unwrap_or_default();
    Luft {
        starts: get::<bool>(&group(&properties, "Startup"), "Installed").unwrap_or(false),
        earlier: (!partitions.is_empty()).then(|| EarlierLuft {
            drive: get(&disk, "EarlierCopyDrive").unwrap_or_default(),
            partitions,
        }),
    }
}

async fn startups() -> Vec<OtherStartup> {
    luft_trust::call::<_, Vec<Listed>>(&TRUST, "OtherStartups", &())
        .await
        .inspect_err(|error| eprintln!("Other systems' startups couldn't be read: {error}"))
        .unwrap_or_default()
        .into_iter()
        .map(|(esp, folder, kind, entries, partitions)| OtherStartup {
            esp,
            folder,
            kind,
            entries,
            partitions,
        })
        .collect()
}

async fn status() -> Option<String> {
    let proxy = Proxy::new(
        luft_dbus::system().await.ok()?,
        WINDOWS,
        WINDOWS_PATH,
        WINDOWS,
    )
    .await
    .ok()?;
    proxy.call("Status", &()).await.ok()
}

async fn windows() -> Vec<WindowsInstall> {
    status()
        .await
        .and_then(|json| serde_json::from_str::<WindowsStatus>(&json).ok())
        .map(|status| {
            status
                .installations
                .into_iter()
                .map(|found| WindowsInstall {
                    device: found.device,
                    version: found.version,
                })
                .collect()
        })
        .unwrap_or_default()
}

fn old_system() -> Option<OldSystem> {
    let text = std::fs::read_to_string(OLD_SYSTEM).ok()?;
    let mut record: OldSystem = serde_json::from_str(&text)
        .inspect_err(|error| eprintln!("The old system's record can't be read: {error}"))
        .ok()?;
    record.folder = record.subvolume.as_deref().and_then(|subvolume| {
        PHYSICAL_ROOTS
            .iter()
            .map(|root| Path::new(root).join(subvolume))
            .find(|path| path.is_dir())
            .map(|path| path.to_string_lossy().into_owned())
    });
    Some(record)
}

impl Facts {
    pub async fn gather() -> Self {
        let luft = luft().await;
        if !luft.starts {
            return Self::default();
        }
        let (startups, windows) = futures_util::future::join(startups(), windows()).await;
        Self {
            luft_starts: true,
            earlier: luft.earlier,
            startups,
            windows,
            old_system: old_system(),
        }
    }
}
