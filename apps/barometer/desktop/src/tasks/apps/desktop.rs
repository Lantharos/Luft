use std::collections::HashMap;

use luft_app::apps::App;
use serde::Serialize;

use crate::system::procfile::unescape_hex;

const CHROMIUM_SCOPE: &str = "org.chromium.Chromium";
const PSEUDO: &str = "unit:";
const SABINE_RUNTIME_UNIT: &str = "sabine-runtime@";
const SABINE_RUNTIME: &str = "sabine:runtime";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    pub key: String,
    pub name: String,
    pub icon: Option<String>,
}

pub struct Unit {
    pub id: String,
    pub suffix: Option<String>,
    launched: bool,
    activated: bool,
}

impl Unit {
    pub fn parse(cgroup: &str) -> Option<Self> {
        let unit = cgroup
            .rsplit('/')
            .find(|part| part.starts_with("app-") || part.starts_with("dbus-"))?;
        let (stem, scope) = match unit.strip_suffix(".scope") {
            Some(stem) => (stem, true),
            None => (unit.strip_suffix(".service")?, false),
        };
        let stem = stem.split_once('@').map_or(stem, |(before, _)| before);
        if let Some(rest) = stem.strip_prefix("dbus-") {
            let (_, id) = rest.split_once('-')?;
            return Some(Self {
                id: unescape_hex(id),
                suffix: None,
                launched: false,
                activated: true,
            });
        }
        let rest = stem.strip_prefix("app-")?;
        let (rest, suffix) = match rest.rsplit_once('-') {
            Some((head, tail)) if scope && tail.chars().all(|c| c.is_ascii_alphanumeric()) => {
                (head, Some(tail.to_owned()))
            }
            _ => (rest, None),
        };
        let (launched, id) = match rest.split_once('-') {
            Some((launcher, id)) if !launcher.contains('.') => (true, id),
            _ => (false, rest),
        };
        Some(Self {
            id: unescape_hex(id),
            suffix,
            launched,
            activated: false,
        })
    }

    pub fn chromium(&self) -> bool {
        !self.launched && self.id == CHROMIUM_SCOPE
    }

    pub fn activated(&self) -> bool {
        self.activated
    }
}

#[derive(Default)]
pub struct Apps {
    keys: HashMap<String, Option<String>>,
    infos: HashMap<String, AppInfo>,
}

impl Apps {
    pub fn resolve(&mut self, id: &str) -> Option<String> {
        if let Some(key) = self.keys.get(id) {
            return key.clone();
        }
        let key = App::by_id(&format!("{id}.desktop")).map(|app| {
            let key = app.id.clone();
            self.infos.insert(
                key.clone(),
                AppInfo {
                    key: app.id,
                    name: app.name,
                    icon: app.icon,
                },
            );
            key
        });
        self.keys.insert(id.to_owned(), key.clone());
        key
    }

    /// The browser, GPU and network processes of the Chromium Sabine apps
    /// share, whose pages count toward the apps that opened them.
    pub fn sabine_runtime(&mut self, cgroup: &str) -> Option<String> {
        cgroup
            .rsplit('/')
            .next()?
            .strip_prefix(SABINE_RUNTIME_UNIT)?
            .ends_with(".service")
            .then(|| {
                self.infos
                    .entry(SABINE_RUNTIME.to_owned())
                    .or_insert_with(|| AppInfo {
                        key: SABINE_RUNTIME.to_owned(),
                        name: "Sabine".to_owned(),
                        icon: None,
                    });
                SABINE_RUNTIME.to_owned()
            })
    }

    pub fn pseudo(&mut self, id: &str) -> String {
        let key = format!("{PSEUDO}{id}");
        self.infos.entry(key.clone()).or_insert_with(|| AppInfo {
            key: key.clone(),
            name: id.to_owned(),
            icon: None,
        });
        key
    }

    pub fn info(&self, key: &str) -> Option<&AppInfo> {
        self.infos.get(key)
    }
}
