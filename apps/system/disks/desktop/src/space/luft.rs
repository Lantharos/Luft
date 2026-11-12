use std::path::PathBuf;
use std::sync::Arc;

use luft_app::dbus;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::tree::Node;

const ROOT_OVERRIDE: &str = "LUFT_SYSTEM_ROOT";
const FILES: &[&str] = &["home"];
const APPS: [&[&str]; 4] = [
    &["lib", "flatpak"],
    &["lib", "luft", "system-packages"],
    &["opt"],
    &["usrlocal"],
];
const UPDATER: &str = "com.lantharos.Updater1";
const UPDATER_PATH: &str = "/com/lantharos/Updater1";

/// Where Luft's own folders hang from: `/` on Luft.
fn root() -> PathBuf {
    std::env::var_os(ROOT_OVERRIDE).map_or_else(|| "/".into(), PathBuf::from)
}

/// Where the drive Luft runs from is mounted whole.
pub fn sysroot() -> String {
    root().join("sysroot").display().to_string()
}

/// The folder Luft keeps everything that changes in, from home folders to apps.
pub fn state() -> PathBuf {
    root().join("var")
}

#[derive(Serialize, Type, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum PartKind {
    Files,
    Apps,
    Luft,
    OlderLuft,
    Update,
    Other,
}

/// A part of Luft's drive, named for people. Only `Files` can be opened, at `path` in the scan.
/// `Luft` has the running version, such as 1.2-nightly.27, when the updater knows it.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Part {
    kind: PartKind,
    size: u64,
    measured: bool,
    path: Vec<String>,
    version: Option<String>,
}

#[derive(Deserialize)]
struct Space {
    version: Option<String>,
    running: u64,
    downloaded: u64,
    older: u64,
}

/// How much each version of Luft holds, which only the updater can read.
#[derive(Default)]
pub struct Versions(Mutex<Option<Option<Space>>>);

async fn ask() -> Result<Space, String> {
    let reply = dbus::system()
        .await?
        .call_method(Some(UPDATER), UPDATER_PATH, Some(UPDATER), "Space", &())
        .await
        .map_err(|error| error.to_string())?;
    let json: String = reply
        .body()
        .deserialize()
        .map_err(|error| error.to_string())?;
    serde_json::from_str(&json).map_err(|error| error.to_string())
}

impl Versions {
    pub fn measure() -> Arc<Self> {
        let versions = Arc::new(Self::default());
        let measuring = versions.clone();
        luft_app::spawn(async move {
            let space = ask()
                .await
                .inspect_err(|error| eprintln!("Measuring Luft's versions: {error}"))
                .ok();
            *measuring.0.lock() = Some(space);
        });
        versions
    }

    fn parts(&self) -> Vec<Part> {
        let part = |kind, size| Part {
            kind,
            size,
            measured: true,
            path: Vec::new(),
            version: None,
        };
        match &*self.0.lock() {
            None => vec![Part {
                measured: false,
                ..part(PartKind::Luft, 0)
            }],
            Some(None) => Vec::new(),
            Some(Some(space)) => vec![
                Part {
                    version: space.version.clone(),
                    ..part(PartKind::Luft, space.running)
                },
                part(PartKind::OlderLuft, space.older),
                part(PartKind::Update, space.downloaded),
            ],
        }
    }
}

fn components(path: &[&str]) -> Vec<String> {
    path.iter().map(|part| (*part).to_owned()).collect()
}

/// The parts of Luft's drive, largest first, from a scan of its state folder and what the
/// updater measured of Luft's versions. What's left of the state folder is the system's own.
pub fn parts(state: &Arc<Node>, versions: &Versions) -> Vec<Part> {
    let files = state.find(&components(FILES));
    let apps: Vec<Arc<Node>> = APPS
        .iter()
        .filter_map(|path| state.find(&components(path)))
        .collect();
    let files_size = files.as_ref().map_or(0, |node| node.size());
    let apps_size = apps.iter().map(|node| node.size()).sum();
    let mut parts = vec![
        Part {
            kind: PartKind::Files,
            size: files_size,
            measured: files.as_ref().is_none_or(|node| node.done()),
            path: components(FILES),
            version: None,
        },
        Part {
            kind: PartKind::Apps,
            size: apps_size,
            measured: apps.iter().all(|node| node.done()),
            path: Vec::new(),
            version: None,
        },
        Part {
            kind: PartKind::Other,
            size: state.size().saturating_sub(files_size + apps_size),
            measured: state.done(),
            path: Vec::new(),
            version: None,
        },
    ];
    parts.extend(versions.parts());
    parts.retain(|part| part.size > 0 || !part.measured);
    parts.sort_by_key(|part| std::cmp::Reverse(part.size));
    parts
}

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use luft_app::Events;

    use super::*;
    use crate::space::Explorer;

    #[test]
    fn names_the_parts_of_the_state_folder_and_luft_versions() {
        let state = tempfile::tempdir().unwrap();
        let fill = |path: &str, bytes: usize| {
            let path = state.path().join(path);
            std::fs::create_dir_all(path.parent().unwrap()).unwrap();
            std::fs::write(path, vec![1u8; bytes]).unwrap();
        };
        fill("home/mara/trip.mov", 8 << 20);
        fill("lib/flatpak/app/notes", 2 << 20);
        fill("lib/luft/system-packages/tool", 1 << 20);
        fill("log/journal", 5 << 20);

        let explorer = Explorer::default();
        explorer
            .start(&Events::default(), state.path().to_str().unwrap())
            .unwrap();
        let scan = explorer.current().unwrap();
        while scan.took.lock().is_none() {
            std::thread::sleep(Duration::from_millis(5));
        }
        let versions = Versions(Mutex::new(Some(Some(Space {
            version: Some("1.2-nightly.27".to_owned()),
            running: 9 << 30,
            downloaded: 0,
            older: 3 << 30,
        }))));

        let parts = parts(&scan.root, &versions);
        let size = |kind| {
            parts
                .iter()
                .find(|part| part.kind == kind)
                .map(|part| part.size)
        };
        let kinds: Vec<PartKind> = parts.iter().map(|part| part.kind).collect();
        assert_eq!(
            kinds,
            [
                PartKind::Luft,
                PartKind::OlderLuft,
                PartKind::Files,
                PartKind::Other,
                PartKind::Apps
            ]
        );
        assert!(size(PartKind::Files).unwrap() >= 8 << 20);
        assert!(size(PartKind::Apps).unwrap() >= 3 << 20);
        assert_eq!(
            parts
                .iter()
                .filter(|part| part.kind != PartKind::Luft && part.kind != PartKind::OlderLuft)
                .map(|part| part.size)
                .sum::<u64>(),
            scan.root.size()
        );
        assert!(parts.iter().all(|part| part.measured));
        assert_eq!(parts[0].version.as_deref(), Some("1.2-nightly.27"));
    }
}
