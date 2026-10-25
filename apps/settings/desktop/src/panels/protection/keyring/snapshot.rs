use luft_app::apps::App;
use serde::Serialize;
use zbus::{DeserializeDict, Type};

use super::bus::{self, ACCESS, Problem, SSH, STATUS};

const HISTORY_LIMIT: u32 = 50;

type Store = (String, String, String, u32);
type Record = (u64, String, String, String, String);
type Key = (String, String, String, bool, bool, u64);

#[derive(DeserializeDict, Type, Serialize)]
#[zbus(signature = "a{sv}", rename_all = "PascalCase")]
#[serde(rename_all = "camelCase")]
struct Status {
    locked: bool,
    tpm_sealed: bool,
    fingerprint_unlock: bool,
    pin: bool,
    item_count: u32,
    chip: String,
    lock_with_screen: bool,
}

#[derive(DeserializeDict, Type)]
#[zbus(signature = "a{sv}", rename_all = "PascalCase")]
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
pub struct Access {
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

/// Which apps keep secrets and what they did lately. The keyring asks you to confirm
/// before telling, so this is read only when someone opens the list.
pub async fn access() -> Result<Access, Problem> {
    let mut stores: Vec<AppStore> = bus::call::<_, Vec<Store>>(ACCESS, "AppStores", &())
        .await?
        .into_iter()
        .map(|(key, name, desktop_id, secrets)| AppStore {
            app: identity(key, name, &desktop_id),
            secrets,
        })
        .collect();
    stores.sort_by_cached_key(|store| store.app.name.to_lowercase());
    let history = bus::call::<_, Vec<Record>>(ACCESS, "History", &(HISTORY_LIMIT,))
        .await?
        .into_iter()
        .map(|(time, app, _, action, what)| Event {
            time,
            app,
            action,
            what,
        })
        .collect();
    Ok(Access { stores, history })
}

async fn ssh() -> Result<Ssh, Problem> {
    let agent: Agent = bus::properties(SSH).await?;
    let keys = bus::call::<_, Vec<Key>>(SSH, "Keys", &())
        .await?
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

pub async fn read() -> Result<Option<Keyring>, Problem> {
    let Some(status) = bus::optional(bus::properties::<Status>(STATUS).await)? else {
        return Ok(None);
    };
    Ok(Some(Keyring {
        status,
        ssh: bus::optional(ssh().await)?,
    }))
}
