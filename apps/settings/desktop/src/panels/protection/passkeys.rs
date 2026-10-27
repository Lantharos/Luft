use std::fmt::Write;
use std::sync::Once;

use futures_util::StreamExt;
use luft_app::dbus::{self, explain, objects, service::absent};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use zbus::{DynamicType, Proxy, Type};

use crate::L10N;
use crate::parse::parse;

const SERVICE: &str = "com.lantharos.Passkeys";
const PATH: &str = "/com/lantharos/Passkeys1";
const INTERFACE: &str = "com.lantharos.Passkeys1";
const CHANGED: BridgeEvent<Passkeys> = BridgeEvent::new("passkeys.changed");

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

#[derive(Serialize, specta::Type)]
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

#[derive(Deserialize, Serialize, specta::Type)]
#[serde(rename_all = "lowercase")]
enum PasskeyProtection {
    Chip,
    Password,
    Unavailable,
}

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct Passkeys {
    protection: PasskeyProtection,
    ready: bool,
    passkeys: Vec<Passkey>,
}

#[derive(Deserialize, specta::Type)]
struct PasskeyRename {
    id: String,
    name: String,
}

#[derive(Deserialize, specta::Type)]
struct PasskeyTarget {
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
        .ok_or_else(|| t!(L10N, "desktop-passkeys-missing"))
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, SERVICE, PATH, INTERFACE)
        .await
        .map_err(|error| explain(&error))
}

async fn read() -> Result<Option<Passkeys>, String> {
    let proxy = proxy().await?;
    let entries: Vec<Entry> = match proxy.call("List", &()).await {
        Ok(entries) => entries,
        Err(error) if absent(&error) => return Ok(None),
        Err(error) => return Err(explain(&error)),
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
        protection: parse(
            proxy
                .get_property("Protection")
                .await
                .map_err(|error| explain(&error))?,
        )
        .unwrap_or(PasskeyProtection::Unavailable),
        ready: proxy
            .get_property("Ready")
            .await
            .map_err(|error| explain(&error))?,
        passkeys,
    }))
}

fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(session) = dbus::session().await else {
            return;
        };
        let Ok(mut signals) = objects::signals(session, SERVICE, PATH).await else {
            return;
        };
        while let Some(signal) = signals.next().await {
            if signal.is_ok()
                && let Ok(Some(passkeys)) = read().await
            {
                events.emit(CHANGED, passkeys);
            }
        }
    });
}

async fn passkeys(events: Events, Empty {}: Empty) -> Result<Option<Passkeys>, String> {
    let passkeys = read().await?;
    if passkeys.is_some() {
        WATCH.call_once(|| watch(events));
    }
    Ok(passkeys)
}

async fn call(method: &str, body: &(impl Serialize + DynamicType)) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>(method, body)
        .await
        .map_err(|error| explain(&error))
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .with_async("passkeys", events, passkeys)
        .command_async("passkeys_rename", |PasskeyRename { id, name }| async move {
            call("Rename", &(unhex(&id)?, name)).await
        })
        .command_async("passkeys_delete", |PasskeyTarget { id }| async move {
            call("Delete", &(unhex(&id)?,)).await
        })
}
