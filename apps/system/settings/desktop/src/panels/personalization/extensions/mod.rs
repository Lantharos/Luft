mod listing;
mod page;
mod unreviewed;

use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events, dbus};
use sabine::{BridgeEvent, SabineWindow};
use serde::Deserialize;
use zbus::{Proxy, Variant};

use listing::Listed;
pub use listing::{Extension, ExtensionSettingValue};
use page::PageSection;

const KESTREL: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Extensions";
const INTERFACE: &str = "com.lantharos.Kestrel.Extensions";

const CHANGED: BridgeEvent<Vec<Extension>> = BridgeEvent::new("extensions.changed");
const PAGE_CHANGED: BridgeEvent<String> = BridgeEvent::new("extensions.page-changed");

static WATCH: Once = Once::new();

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, KESTREL, PATH, INTERFACE)
        .await
        .map_err(dbus::failed)
}

async fn list() -> Result<Vec<Extension>, String> {
    let listed: Vec<Listed> = proxy()
        .await?
        .call("List", &())
        .await
        .map_err(dbus::failed)?;
    Ok(listed.into_iter().map(Extension::from).collect())
}

async fn watch_list(events: Events) {
    let Ok(proxy) = proxy().await else {
        return;
    };
    let Ok(mut changes) = proxy.receive_signal("ExtensionsChanged").await else {
        return;
    };
    while changes.next().await.is_some() {
        if let Ok(extensions) = list().await {
            events.emit(CHANGED, extensions);
        }
    }
}

async fn watch_pages(events: Events) {
    let Ok(proxy) = proxy().await else {
        return;
    };
    let Ok(mut changes) = proxy.receive_signal("PageChanged").await else {
        return;
    };
    while let Some(change) = changes.next().await {
        if let Ok((id,)) = change.body().deserialize::<(String,)>() {
            events.emit(PAGE_CHANGED, id);
        }
    }
}

async fn extensions(events: Events, Empty {}: Empty) -> Result<Vec<Extension>, String> {
    WATCH.call_once(|| {
        luft_app::spawn(watch_list(events.clone()));
        luft_app::spawn(watch_pages(events));
    });
    list().await
}

#[derive(Deserialize, specta::Type)]
struct ExtensionTarget {
    id: String,
}

async fn request(method: &str, ExtensionTarget { id }: ExtensionTarget) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>(method, &(id,))
        .await
        .map_err(dbus::failed)
}

#[derive(Deserialize, specta::Type)]
struct ExtensionSettingChange {
    id: String,
    key: String,
    value: ExtensionSettingValue,
}

async fn set(
    ExtensionSettingChange { id, key, value }: ExtensionSettingChange,
) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>("SetSetting", &(id, key, Variant::from(value)))
        .await
        .map_err(dbus::failed)
}

#[derive(Deserialize, specta::Type)]
struct ExtensionShortcutChange {
    id: String,
    key: String,
    accelerators: Option<Vec<String>>,
}

async fn set_shortcut(
    ExtensionShortcutChange {
        id,
        key,
        accelerators,
    }: ExtensionShortcutChange,
) -> Result<(), String> {
    let proxy = proxy().await?;
    match accelerators {
        Some(accelerators) => {
            proxy
                .call::<_, _, ()>("SetShortcut", &(id, key, accelerators))
                .await
        }
        None => proxy.call::<_, _, ()>("ResetShortcut", &(id, key)).await,
    }
    .map_err(dbus::failed)
}

async fn page(ExtensionTarget { id }: ExtensionTarget) -> Result<Vec<PageSection>, String> {
    let json: String = proxy()
        .await?
        .call("Page", &(id,))
        .await
        .map_err(dbus::failed)?;
    page::parse(&json)
}

#[derive(Deserialize, specta::Type)]
struct ExtensionAct {
    id: String,
    control: String,
    value: ExtensionSettingValue,
}

async fn act(ExtensionAct { id, control, value }: ExtensionAct) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>("Act", &(id, control, Variant::from(value)))
        .await
        .map_err(dbus::failed)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .bridge_event(&PAGE_CHANGED)
        .with_async("extensions", events, extensions)
        .command_async("extensions_enable", |target| request("Enable", target))
        .command_async("extensions_disable", |target| request("Disable", target))
        .command_async("extensions_remove", |target| request("Remove", target))
        .command_async("extensions_reload", |target| request("Reload", target))
        .command_async("extensions_set", set)
        .command_async("extensions_set_shortcut", set_shortcut)
        .command_async("extensions_page", page)
        .command_async("extensions_act", act)
        .command_async("extensions_install_copy", unreviewed::install_copy)
        .command_async("extensions_run_from_folder", unreviewed::run_from_folder)
        .command_async("extensions_stop_unreviewed", unreviewed::stop)
}
