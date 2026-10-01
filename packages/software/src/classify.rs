use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::SystemTime;

use crate::desktop::DesktopEntry;

const APPLICATIONS: &str = "/usr/share/applications";
const RPM_DATABASE: &str = "/usr/lib/sysimage/rpm/rpmdb.sqlite";

type Stamp = (Option<SystemTime>, Option<SystemTime>);

static CACHE: Mutex<Option<(Stamp, Arc<Classification>)>> = Mutex::new(None);

#[derive(Default)]
pub struct Classification {
    apps: HashMap<String, Vec<String>>,
}

impl Classification {
    pub fn current() -> Arc<Self> {
        let stamp = (
            modified(Path::new(APPLICATIONS)),
            modified(Path::new(RPM_DATABASE)),
        );
        let mut cache = CACHE
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if let Some((cached, classification)) = cache.as_ref()
            && *cached == stamp
        {
            return classification.clone();
        }
        let classification = Arc::new(Self::build());
        *cache = Some((stamp, classification.clone()));
        classification
    }

    pub fn is_app(&self, package: &str) -> bool {
        self.apps.contains_key(package)
    }

    pub fn desktop_ids(&self, package: &str) -> &[String] {
        self.apps
            .get(package)
            .map(Vec::as_slice)
            .unwrap_or_default()
    }

    pub fn apps(&self) -> impl Iterator<Item = (&str, &[String])> {
        self.apps
            .iter()
            .map(|(package, ids)| (package.as_str(), ids.as_slice()))
    }

    fn build() -> Self {
        let visible = visible_entries();
        if visible.is_empty() {
            return Self::default();
        }
        let Ok(output) = Command::new("rpm")
            .args([
                "--query",
                "--file",
                "--queryformat",
                "[%{FILENAMES}\t%{=NAME}\n]",
            ])
            .args(&visible)
            .output()
        else {
            return Self::default();
        };
        let visible: HashSet<&Path> = visible.iter().map(PathBuf::as_path).collect();
        let mut apps: HashMap<String, Vec<String>> = HashMap::new();
        for line in String::from_utf8_lossy(&output.stdout).lines() {
            let Some((file, package)) = line.split_once('\t') else {
                continue;
            };
            let file = Path::new(file);
            if !visible.contains(file) {
                continue;
            }
            let Some(id) = file.file_name().and_then(|name| name.to_str()) else {
                continue;
            };
            let ids = apps.entry(package.to_owned()).or_default();
            if !ids.iter().any(|known| known == id) {
                ids.push(id.to_owned());
            }
        }
        for (package, ids) in &mut apps {
            ids.sort_by_key(|id| !id.to_lowercase().contains(&package.to_lowercase()));
        }
        Self { apps }
    }
}

fn modified(path: &Path) -> Option<SystemTime> {
    path.metadata()
        .and_then(|metadata| metadata.modified())
        .ok()
}

fn visible_entries() -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(APPLICATIONS) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "desktop")
        })
        .filter(|path| DesktopEntry::read(path).is_some_and(|entry| entry.visible()))
        .collect()
}
