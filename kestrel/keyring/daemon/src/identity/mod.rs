mod desktop;
mod process;

use std::collections::HashMap;
use std::sync::Mutex;

use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;

use process::Process;

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
}

impl App {
    pub fn unknown() -> Self {
        Self {
            key: "unknown".into(),
            name: "An app".into(),
            icon: String::new(),
            kind: Kind::Host,
            executable: String::new(),
        }
    }

    pub fn flatpak(id: &str) -> Self {
        let entry = desktop::find(id);
        Self {
            key: format!("flatpak:{id}"),
            name: entry
                .as_ref()
                .map_or_else(|| id.to_owned(), |entry| entry.name.clone()),
            icon: id.to_owned(),
            kind: Kind::Flatpak,
            executable: String::new(),
        }
    }

    pub fn from_key(key: &str) -> Self {
        match key.split_once(':') {
            Some(("flatpak", id)) => Self::flatpak(id),
            Some(("app", id)) => luft(id, String::new()),
            Some(("exe", path)) => host(path, None),
            _ => Self::unknown(),
        }
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
    let program = process.program(&executable);
    host(&program, process.unit_app_id().as_deref())
}

fn luft_app_id(executable: &str) -> Option<String> {
    let home = std::env::var("HOME").ok()?;
    let apps = format!("{home}/.local/share/sabine/apps/");
    let id = executable.strip_prefix(&apps)?.split('/').next()?;
    id.starts_with("com.lantharos.").then(|| id.to_owned())
}

fn luft(id: &str, executable: String) -> App {
    let name = desktop::find(id).map_or_else(
        || id.trim_start_matches("com.lantharos.").to_owned(),
        |entry| entry.name,
    );
    App {
        key: format!("app:{id}"),
        name,
        icon: id.to_owned(),
        kind: Kind::Luft,
        executable,
    }
}

fn host(program: &str, unit_app: Option<&str>) -> App {
    let binary = program.split_whitespace().next().unwrap_or(program);
    let base = binary.rsplit('/').next().unwrap_or(binary);
    let entry = unit_app
        .and_then(desktop::find)
        .filter(|entry| entry.runs(base));
    App {
        key: format!("exe:{program}"),
        name: entry
            .as_ref()
            .map_or_else(|| base.to_owned(), |entry| entry.name.clone()),
        icon: entry.map(|entry| entry.id).unwrap_or_default(),
        kind: Kind::Host,
        executable: binary.to_owned(),
    }
}
