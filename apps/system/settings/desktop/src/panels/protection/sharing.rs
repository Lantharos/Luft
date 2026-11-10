use std::sync::Once;

use futures_util::StreamExt;
use luft_app::apps::App;
use luft_app::dbus::service::{Map, absent, get};
use luft_app::dbus::{self, explain};
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Proxy;

use crate::parse::parse;

const SERVICE: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Sharing";
const INTERFACE: &str = "com.lantharos.Kestrel.Sharing";
const CHANGED: BridgeEvent<Vec<Shared>> = BridgeEvent::new("sharing.changed");

static WATCH: Once = Once::new();

#[derive(Deserialize, Serialize, Type)]
#[serde(rename_all = "kebab-case")]
enum SharedKind {
    Screen,
    Control,
    Input,
    WindowsSee,
    WindowsUse,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Shared {
    id: String,
    app: Option<App>,
    developer_tools: bool,
    kind: SharedKind,
    since: i64,
    remembered: bool,
    active: bool,
}

#[derive(Deserialize, Type)]
struct SharedTarget {
    id: String,
}

fn shared(grant: &Map) -> Option<Shared> {
    let app: String = get(grant, "app").unwrap_or_default();
    Some(Shared {
        id: get(grant, "id")?,
        developer_tools: app.starts_with('/'),
        app: App::by_id(&format!("{app}.desktop")),
        kind: parse(get(grant, "kind")?)?,
        since: get(grant, "since").unwrap_or(0),
        remembered: get(grant, "remembered").unwrap_or(false),
        active: get(grant, "active").unwrap_or(false),
    })
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, SERVICE, PATH, INTERFACE)
        .await
        .map_err(|error| explain(&error))
}

async fn read() -> Result<Vec<Shared>, String> {
    match proxy().await?.call::<_, _, Vec<Map>>("List", &()).await {
        Ok(grants) => Ok(grants.iter().filter_map(shared).collect()),
        Err(error) if absent(&error) => Ok(Vec::new()),
        Err(error) => Err(explain(&error)),
    }
}

fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(proxy) = proxy().await else {
            return;
        };
        let Ok(mut changes) = proxy.receive_signal("Changed").await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(shared) = read().await {
                events.emit(CHANGED, shared);
            }
        }
    });
}

async fn list(events: Events, Empty {}: Empty) -> Result<Vec<Shared>, String> {
    WATCH.call_once(|| watch(events));
    read().await
}

async fn revoke(SharedTarget { id }: SharedTarget) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>("Revoke", &(id,))
        .await
        .map_err(|error| explain(&error))
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .with_async("sharing_list", events, list)
        .command_async("sharing_revoke", revoke)
}
