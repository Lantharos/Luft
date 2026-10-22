use std::future::ready;
use std::pin::pin;
use std::time::Duration;

use futures_util::StreamExt;
use luft_app::Events;
use luft_app::dbus;
use luft_app::identity::permissions;
use tokio::time::timeout;

use super::Kind;

const CHANGED: &str = "apps.permissions";
const SETTLE: Duration = Duration::from_millis(120);

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(session) = dbus::session().await else {
            return;
        };
        let Ok(changes) = permissions::changes(session).await else {
            return;
        };
        let mut changes = pin!(changes.filter_map(|table| ready(Kind::of(&table))));
        while let Some(kind) = changes.next().await {
            let mut changed = vec![kind];
            while let Ok(Some(kind)) = timeout(SETTLE, changes.next()).await {
                if !changed.contains(&kind) {
                    changed.push(kind);
                }
            }
            for kind in changed {
                if let Ok(update) = kind.read(session).await {
                    events.emit(CHANGED, update);
                }
            }
        }
    });
}
