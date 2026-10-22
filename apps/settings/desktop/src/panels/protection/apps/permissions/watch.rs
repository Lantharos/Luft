use std::future::ready;
use std::pin::pin;
use std::time::Duration;

use futures_util::StreamExt;
use luft_app::Events;
use luft_app::dbus;
use luft_app::identity::permissions::{
    self, BACKGROUND_CLIPBOARD, FOLDERS, FULL_ACCESS, KEYRING_ITEMS,
};
use tokio::time::timeout;

use super::read;

const CHANGED: &str = "apps.permissions";
const SETTLE: Duration = Duration::from_millis(120);
const TABLES: [&str; 6] = [
    "location",
    "devices",
    BACKGROUND_CLIPBOARD.table,
    FULL_ACCESS.table,
    KEYRING_ITEMS,
    FOLDERS.table,
];

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(session) = dbus::session().await else {
            return;
        };
        let Ok(changes) = permissions::changes(session).await else {
            return;
        };
        let mut changes = pin!(changes.filter(|table| ready(TABLES.contains(&table.as_str()))));
        while changes.next().await.is_some() {
            while let Ok(Some(_)) = timeout(SETTLE, changes.next()).await {}
            if let Ok(apps) = read(session).await {
                events.emit(CHANGED, apps);
            }
        }
    });
}
