use std::sync::Once;

use futures_util::{StreamExt, stream};
use luft_app::{Commands, Empty, Events};
use luft_dbus_macros::introspect;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use zbus::{Connection, DeserializeDict, proxy};

use crate::app::events::FILE_ACTIONS_CHANGED;

static WATCH: Once = Once::new();

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.FileActions",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/FileActions"
)]
trait FileActions {
    fn list(&self) -> zbus::Result<Vec<ListedAction>>;

    fn opened(&self, id: &str) -> zbus::Result<()>;

    fn activate(&self, id: &str, choice: &str, paths: &[String]) -> zbus::Result<()>;

    #[zbus(signal)]
    fn changed(&self) -> zbus::Result<()>;
}

#[derive(DeserializeDict, zbus::Type)]
#[zbus(signature = "a{sv}")]
struct ListedChoice {
    key: String,
    label: String,
    icon: String,
    disabled: bool,
    stays: bool,
    separator: bool,
}

#[derive(DeserializeDict, zbus::Type)]
#[zbus(signature = "a{sv}")]
struct ListedAction {
    id: String,
    label: String,
    icon: String,
    kind: String,
    types: Vec<String>,
    extensions: Vec<String>,
    multiple: bool,
    items: Option<Vec<ListedChoice>>,
}

#[derive(Clone, Serialize, specta::Type)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum FileActionChoice {
    Choice {
        key: String,
        label: String,
        icon: Option<String>,
        disabled: bool,
        keeps_menu_open: bool,
    },
    Separator,
}

#[derive(Clone, Copy, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub enum FileActionTargets {
    Files,
    Folders,
    Any,
}

#[derive(Clone, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct FileAction {
    id: String,
    label: String,
    icon: Option<String>,
    kind: FileActionTargets,
    types: Vec<String>,
    extensions: Vec<String>,
    multiple: bool,
    items: Option<Vec<FileActionChoice>>,
}

fn icon(path: String) -> Option<String> {
    (!path.is_empty()).then_some(path)
}

impl From<ListedChoice> for FileActionChoice {
    fn from(choice: ListedChoice) -> Self {
        if choice.separator {
            return Self::Separator;
        }
        Self::Choice {
            key: choice.key,
            label: choice.label,
            icon: icon(choice.icon),
            disabled: choice.disabled,
            keeps_menu_open: choice.stays,
        }
    }
}

impl From<ListedAction> for FileAction {
    fn from(action: ListedAction) -> Self {
        Self {
            id: action.id,
            label: action.label,
            icon: icon(action.icon),
            kind: match action.kind.as_str() {
                "files" => FileActionTargets::Files,
                "folders" => FileActionTargets::Folders,
                _ => FileActionTargets::Any,
            },
            types: action.types,
            extensions: action.extensions,
            multiple: action.multiple,
            items: action
                .items
                .map(|items| items.into_iter().map(Into::into).collect()),
        }
    }
}

#[derive(Deserialize, specta::Type)]
struct Opening {
    id: String,
}

#[derive(Deserialize, specta::Type)]
struct Activation {
    id: String,
    choice: Option<String>,
    paths: Vec<String>,
}

async fn proxy() -> zbus::Result<FileActionsProxy<'static>> {
    FileActionsProxy::new(&Connection::session().await?).await
}

async fn current(proxy: &FileActionsProxy<'_>) -> Vec<FileAction> {
    proxy
        .list()
        .await
        .unwrap_or_default()
        .into_iter()
        .map(Into::into)
        .collect()
}

async fn watch(events: Events) -> zbus::Result<()> {
    let proxy = proxy().await?;
    let owners = proxy.inner().receive_owner_changed().await?.map(|_| ());
    let changes = proxy.receive_changed().await?.map(|_| ());
    let mut changed = stream::select(owners, changes);
    while changed.next().await.is_some() {
        events.emit(FILE_ACTIONS_CHANGED, current(&proxy).await);
    }
    Ok(())
}

async fn actions(events: Events, Empty {}: Empty) -> Result<Vec<FileAction>, String> {
    WATCH.call_once(|| {
        luft_app::spawn(async move {
            let _ = watch(events).await;
        });
    });
    let proxy = proxy().await.map_err(|error| error.to_string())?;
    Ok(current(&proxy).await)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("file_actions", events, actions)
        .command_async("file_action_opened", |Opening { id }| async move {
            let proxy = proxy().await.map_err(|error| error.to_string())?;
            proxy.opened(&id).await.map_err(|error| error.to_string())
        })
        .command_async(
            "run_file_action",
            |Activation { id, choice, paths }| async move {
                let proxy = proxy().await.map_err(|error| error.to_string())?;
                let choice = choice.unwrap_or_default();
                proxy
                    .activate(&id, &choice, &paths)
                    .await
                    .map_err(|error| error.to_string())
            },
        )
}
