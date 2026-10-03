use std::fmt::Write;
use std::sync::Once;

use luft_app::dbus;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::{MessageIterator, Proxy};
use zbus::message::Type as MessageType;
use zbus::zvariant::Type;

const SERVICE: &str = "com.lantharos.Passkeys";
const PATH: &str = "/com/lantharos/Passkeys1";
const INTERFACE: &str = "com.lantharos.Passkeys1";
const CHANGED: &str = "passkeys.changed";
const ABSENT: [&str; 2] = [
    "org.freedesktop.DBus.Error.ServiceUnknown",
    "org.freedesktop.DBus.Error.NameHasNoOwner",
];

static WATCH: Once = Once::new();

#[derive(Deserialize, Type)]
struct Entry {
    id: Vec<u8>,
    site: String,
    site_name: String,
    account: String,
    display_name: String,
    nickname: String,
    created: u64,
    used: u64,
    chip: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Passkey {
    id: String,
    site: String,
    site_name: String,
    account: String,
    display_name: String,
    nickname: String,
    created: u64,
    used: u64,
    chip: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Passkeys {
    protection: String,
    ready: bool,
    passkeys: Vec<Passkey>,
}

#[derive(Deserialize)]
struct Rename {
    id: String,
    name: String,
}

#[derive(Deserialize)]
struct Target {
    id: String,
}

fn hex(bytes: &[u8]) -> String {
    bytes
        .iter()
        .fold(String::with_capacity(bytes.len() * 2), |mut text, byte| {
            let _ = write!(text, "{byte:02x}");
            text
        })
}

fn unhex(text: &str) -> Result<Vec<u8>, String> {
    (0..text.len())
        .step_by(2)
        .map(|index| {
            text.get(index..index + 2)
                .and_then(|pair| u8::from_str_radix(pair, 16).ok())
        })
        .collect::<Option<_>>()
        .ok_or_else(|| "That passkey doesn't exist".to_owned())
}

fn absent(error: &zbus::Error) -> bool {
    matches!(error, zbus::Error::MethodError(name, ..) if ABSENT.contains(&name.as_str()))
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(_, Some(message), _) => message,
        error => error.to_string(),
    }
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session()?, SERVICE, PATH, INTERFACE).map_err(explain)
}

fn read() -> Result<Option<Passkeys>, String> {
    let proxy = proxy()?;
    let entries: Vec<Entry> = match proxy.call("List", &()) {
        Ok(entries) => entries,
        Err(error) if absent(&error) => return Ok(None),
        Err(error) => return Err(explain(error)),
    };
    let passkeys = entries
        .into_iter()
        .map(|entry| Passkey {
            id: hex(&entry.id),
            site: entry.site,
            site_name: entry.site_name,
            account: entry.account,
            display_name: entry.display_name,
            nickname: entry.nickname,
            created: entry.created,
            used: entry.used,
            chip: entry.chip,
        })
        .collect();
    Ok(Some(Passkeys {
        protection: proxy.get_property("Protection").map_err(explain)?,
        ready: proxy.get_property("Ready").map_err(explain)?,
        passkeys,
    }))
}

fn watch(events: Events) {
    std::thread::spawn(move || {
        let Ok(session) = dbus::session() else {
            return;
        };
        let Ok(rule) = zbus::MatchRule::builder()
            .msg_type(MessageType::Signal)
            .sender(SERVICE)
            .and_then(|rule| rule.path(PATH))
            .map(|rule| rule.build())
        else {
            return;
        };
        let Ok(messages) = MessageIterator::for_match_rule(rule, session, None) else {
            return;
        };
        for _ in messages.flatten() {
            if let Ok(Some(passkeys)) = read() {
                events.emit(CHANGED, passkeys);
            }
        }
    });
}

fn passkeys(events: &Events, _: Value) -> Result<Option<Passkeys>, String> {
    let passkeys = read()?;
    if passkeys.is_some() {
        let events = events.clone();
        WATCH.call_once(|| watch(events));
    }
    Ok(passkeys)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("passkeys", events, passkeys)
        .command("passkeys_rename", |Rename { id, name }| {
            proxy()?
                .call::<_, _, ()>("Rename", &(unhex(&id)?, name))
                .map_err(explain)
        })
        .command("passkeys_delete", |Target { id }| {
            proxy()?
                .call::<_, _, ()>("Delete", &(unhex(&id)?,))
                .map_err(explain)
        })
}
