use std::sync::Arc;

use futures_util::StreamExt;
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::{BusName, UniqueName};

use super::Session;

async fn gone(connection: &Connection, peer: &UniqueName<'_>) -> zbus::Result<()> {
    let bus = DBusProxy::new(connection).await?;
    let mut changes = bus
        .receive_name_owner_changed_with_args(&[(0, peer.as_str())])
        .await?;
    if !bus.name_has_owner(BusName::Unique(peer.clone())).await? {
        return Ok(());
    }
    while let Some(change) = changes.next().await {
        if change.args()?.new_owner().is_none() {
            break;
        }
    }
    Ok(())
}

impl Session {
    /// Forgets what a caller holds once it leaves the bus.
    pub(super) fn watch(self: &Arc<Self>, peer: &UniqueName<'_>) {
        if !self.peers.lock().unwrap().insert(peer.to_string()) {
            return;
        }
        let session = Arc::clone(self);
        let peer = peer.to_owned();
        tokio::spawn(async move {
            let left = gone(&session.connection, &peer).await;
            session.peers.lock().unwrap().remove(peer.as_str());
            let forgotten = match left {
                Ok(()) => session.forget(&peer).await,
                Err(error) => Err(error),
            };
            if let Err(error) = forgotten {
                eprintln!("Couldn't release what {peer} held: {error}");
            }
        });
    }
}
