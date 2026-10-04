mod desktop;
mod process;
mod program;

use std::collections::HashMap;
use std::path::Path;
use std::sync::Mutex;

use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;

use desktop::Entry;
use process::Process;
pub use program::Program;
use program::versionless;

const UNBRANDED_CHROMIUM: &str = "chromium";
const UNKNOWN: &str = "unknown";
const FLATPAK: &str = "flatpak:";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Flatpak,
    Luft,
    Host,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct App {
    pub key: String,
    pub name: String,
    pub icon: String,
    pub kind: Kind,
    pub executable: String,
    names: Vec<String>,
    claims: bool,
    chromium: bool,
    lineage: Option<Lineage>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct Lineage {
    program: String,
    versionless: String,
    entry: Option<Entry>,
}

impl Lineage {
    fn includes(&self, program: &str) -> bool {
        program == self.program
            || versionless(program) == self.versionless
            || self
                .entry
                .as_ref()
                .is_some_and(|entry| entry.runs(&Program::parse(program)))
    }
}

impl App {
    pub fn unknown() -> Self {
        Self {
            key: UNKNOWN.into(),
            name: "An app".into(),
            icon: String::new(),
            kind: Kind::Host,
            executable: String::new(),
            names: Vec::new(),
            claims: false,
            chromium: false,
            lineage: None,
        }
    }

    pub fn flatpak(id: &str) -> Self {
        let entry = desktop::find(id);
        Self {
            key: format!("{FLATPAK}{id}"),
            name: entry
                .as_ref()
                .map_or_else(|| id.to_owned(), |entry| entry.name.clone()),
            icon: id.to_owned(),
            kind: Kind::Flatpak,
            names: id_names(id, entry.as_ref()),
            claims: true,
            ..Self::unknown()
        }
    }

    pub fn from_key(key: &str) -> Self {
        match key.split_once(':') {
            Some(("flatpak", id)) => Self::flatpak(id),
            Some(("app", id)) => luft(id, String::new()),
            Some(("desktop", id)) => Self {
                key: key.to_owned(),
                name: desktop::find(id).map_or_else(|| id.to_owned(), |entry| entry.name),
                icon: id.to_owned(),
                ..Self::unknown()
            },
            Some(("exe", program)) => Self {
                key: key.to_owned(),
                name: Program::parse(program).label(),
                ..Self::unknown()
            },
            _ => Self::unknown(),
        }
    }

    pub fn is_unknown(&self) -> bool {
        self.key == UNKNOWN
    }

    pub fn flatpak_id(&self) -> Option<&str> {
        self.key.strip_prefix(FLATPAK)
    }

    pub fn may_claim(&self, hint: Option<&str>) -> bool {
        self.claims
            && hint.is_none_or(|hint| {
                self.names.iter().any(|name| name == hint)
                    || self.chromium && hint == UNBRANDED_CHROMIUM
            })
    }

    pub fn succeeds(&self, key: &str) -> bool {
        key != self.key
            && key.strip_prefix("exe:").is_some_and(|program| {
                self.lineage
                    .as_ref()
                    .is_some_and(|lineage| lineage.includes(program))
            })
    }
}

#[derive(Default)]
pub struct Identities {
    known: Mutex<HashMap<String, App>>,
}

impl Identities {
    pub async fn identify(&self, connection: &Connection, sender: &str) -> App {
        if let Some(app) = self.known.lock().expect("identity cache").get(sender) {
            return app.clone();
        }
        let app = resolve(connection, sender)
            .await
            .unwrap_or_else(App::unknown);
        self.known
            .lock()
            .expect("identity cache")
            .insert(sender.to_owned(), app.clone());
        app
    }

    pub fn forget(&self, sender: &str) {
        self.known.lock().expect("identity cache").remove(sender);
    }
}

async fn resolve(connection: &Connection, sender: &str) -> Option<App> {
    let proxy = DBusProxy::new(connection).await.ok()?;
    let credentials = proxy
        .get_connection_credentials(BusName::try_from(sender).ok()?)
        .await
        .ok()?;
    let process = Process::open(credentials.process_id()?, credentials.process_fd())?;
    Some(classify(&process))
}

pub fn of_process(pid: u32) -> (App, Option<String>) {
    let Some(process) = Process::open(pid, None) else {
        return (App::unknown(), None);
    };
    let surrounding = process
        .unit_app_id()
        .and_then(|id| desktop::find(&id))
        .map(|entry| entry.name);
    (classify(&process), surrounding)
}

fn classify(process: &Process) -> App {
    if let Some(id) = process.flatpak_id() {
        return App::flatpak(&id);
    }
    let executable = process.executable().unwrap_or_default();
    if let Some(id) = luft_app_id(&executable) {
        return luft(&id, executable);
    }
    let program = process.program(executable);
    let entry = process
        .unit_app_id()
        .and_then(|id| desktop::find(&id))
        .filter(|entry| entry.runs(&program))
        .or_else(|| desktop::find(&program.name()).filter(|entry| entry.runs(&program)));
    let inspecting = program.is_inspector() || program.interpreted() && process.has_terminal();
    host(program, entry, !inspecting)
}

fn luft_app_id(executable: &str) -> Option<String> {
    let home = std::env::var("HOME").ok()?;
    let apps = format!("{home}/.local/share/sabine/apps/");
    let id = executable.strip_prefix(&apps)?.split('/').next()?;
    id.starts_with("com.lantharos.").then(|| id.to_owned())
}

fn luft(id: &str, executable: String) -> App {
    let entry = desktop::find(id);
    App {
        key: format!("app:{id}"),
        name: entry.as_ref().map_or_else(
            || id.trim_start_matches("com.lantharos.").to_owned(),
            |entry| entry.name.clone(),
        ),
        icon: id.to_owned(),
        kind: Kind::Luft,
        executable,
        names: id_names(id, entry.as_ref()),
        claims: true,
        ..App::unknown()
    }
}

fn host(program: Program, entry: Option<Entry>, claims: bool) -> App {
    let text = program.text();
    let key = match &entry {
        Some(entry) => format!("desktop:{}", entry.id),
        None => format!("exe:{}", versionless(&text)),
    };
    let mut names = vec![program.name()];
    names.extend(entry.iter().flat_map(Entry::names));
    App {
        key,
        name: entry
            .as_ref()
            .map_or_else(|| program.label(), |entry| entry.name.clone()),
        icon: entry
            .as_ref()
            .map(|entry| entry.id.clone())
            .unwrap_or_default(),
        kind: Kind::Host,
        chromium: !program.interpreted() && is_chromium(&program.executable),
        executable: program.executable,
        names,
        claims,
        lineage: Some(Lineage {
            versionless: versionless(&text),
            program: text,
            entry,
        }),
    }
}

fn id_names(id: &str, entry: Option<&Entry>) -> Vec<String> {
    entry.map_or_else(
        || desktop::id_names(id).to_vec(),
        |entry| entry.names().collect(),
    )
}

fn is_chromium(executable: &str) -> bool {
    Path::new(executable).parent().is_some_and(|folder| {
        folder.join("chrome_100_percent.pak").is_file()
            && !folder.join("resources/app.asar").exists()
    })
}
