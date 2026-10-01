use std::collections::HashMap;

use luft_app::apps::App;
use serde::Serialize;
use zbus::zvariant::{DeserializeDict, OwnedObjectPath, Type};

use super::bus::{self, ACCESS, Problem, SSH, STATUS};

const HISTORY_LIMIT: u32 = 50;

type Entry = (String, String, String, String, OwnedObjectPath, bool);
type Store = (String, String, String, u32);
type Record = (u64, String, String, String, String);
type Key = (String, String, String, bool, bool, u64);

#[derive(DeserializeDict, Type, Serialize)]
#[zvariant(signature = "a{sv}", rename_all = "PascalCase")]
#[serde(rename_all = "camelCase")]
struct Status {
    locked: bool,
    tpm_sealed: bool,
    fingerprint_unlock: bool,
    pin: bool,
    item_count: u32,
    chip: String,
    lock_with_screen: bool,
    pending_imports: Vec<String>,
}

#[derive(DeserializeDict, Type)]
#[zvariant(signature = "a{sv}", rename_all = "PascalCase")]
struct Agent {
    socket: String,
    chip_keys: bool,
}

#[derive(Serialize)]
struct Identity {
    key: String,
    name: String,
    id: Option<String>,
    icon: Option<String>,
}

#[derive(Serialize)]
struct Item {
    label: String,
    path: String,
    allowed: bool,
}

#[derive(Serialize)]
struct AppAccess {
    #[serde(flatten)]
    app: Identity,
    items: Vec<Item>,
}

#[derive(Serialize)]
struct AppStore {
    #[serde(flatten)]
    app: Identity,
    secrets: u32,
}

#[derive(Serialize)]
struct Event {
    time: u64,
    app: String,
    action: String,
    what: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SshKey {
    fingerprint: String,
    name: String,
    kind: String,
    chip: bool,
    confirm: bool,
    added: u64,
}

#[derive(Serialize)]
struct Access {
    apps: Vec<AppAccess>,
    stores: Vec<AppStore>,
    history: Vec<Event>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Ssh {
    socket: String,
    chip_keys: bool,
    keys: Vec<SshKey>,
}

#[derive(Serialize)]
pub struct Keyring {
    #[serde(flatten)]
    status: Status,
    access: Option<Access>,
    ssh: Option<Ssh>,
}

fn identity(key: String, name: String, desktop_id: &str) -> Identity {
    let app = (!desktop_id.is_empty())
        .then(|| App::by_id(&format!("{desktop_id}.desktop")))
        .flatten();
    Identity {
        key,
        name,
        id: app.as_ref().map(|app| app.id.clone()),
        icon: app.and_then(|app| app.icon),
    }
}

fn by_name<T>(list: &mut [T], name: impl Fn(&T) -> &str) {
    list.sort_by_cached_key(|entry| name(entry).to_lowercase());
}

fn group(entries: Vec<Entry>) -> Vec<AppAccess> {
    let mut apps: HashMap<String, AppAccess> = HashMap::new();
    for (key, name, desktop_id, label, path, allowed) in entries {
        let item = Item {
            label,
            path: path.to_string(),
            allowed,
        };
        apps.entry(key.clone())
            .or_insert_with(|| AppAccess {
                app: identity(key, name, &desktop_id),
                items: Vec::new(),
            })
            .items
            .push(item);
    }
    let mut apps: Vec<AppAccess> = apps.into_values().collect();
    for app in &mut apps {
        by_name(&mut app.items, |item| &item.label);
    }
    by_name(&mut apps, |app| &app.app.name);
    apps
}

fn access() -> Result<Access, Problem> {
    let entries: Vec<Entry> = bus::call(ACCESS, "Entries", &())?;
    let mut stores: Vec<AppStore> = bus::call::<_, Vec<Store>>(ACCESS, "AppStores", &())?
        .into_iter()
        .map(|(key, name, desktop_id, secrets)| AppStore {
            app: identity(key, name, &desktop_id),
            secrets,
        })
        .collect();
    by_name(&mut stores, |store| &store.app.name);
    let history = bus::call::<_, Vec<Record>>(ACCESS, "History", &(HISTORY_LIMIT,))?
        .into_iter()
        .map(|(time, app, _, action, what)| Event {
            time,
            app,
            action,
            what,
        })
        .collect();
    Ok(Access {
        apps: group(entries),
        stores,
        history,
    })
}

fn ssh() -> Result<Ssh, Problem> {
    let agent: Agent = bus::properties(SSH)?;
    let keys = bus::call::<_, Vec<Key>>(SSH, "Keys", &())?
        .into_iter()
        .map(|(fingerprint, name, kind, chip, confirm, added)| SshKey {
            fingerprint,
            name,
            kind,
            chip,
            confirm,
            added,
        })
        .collect();
    Ok(Ssh {
        socket: agent.socket,
        chip_keys: agent.chip_keys,
        keys,
    })
}

pub fn read() -> Result<Option<Keyring>, Problem> {
    let Some(status) = bus::optional(bus::properties::<Status>(STATUS))? else {
        return Ok(None);
    };
    Ok(Some(Keyring {
        status,
        access: bus::optional(access())?,
        ssh: bus::optional(ssh())?,
    }))
}
