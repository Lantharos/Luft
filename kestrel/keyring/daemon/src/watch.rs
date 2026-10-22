use std::sync::Arc;
use std::sync::atomic::Ordering;

use futures_util::StreamExt;
use luft_identity::permissions::{self, FULL_ACCESS};
use zbus::fdo::DBusProxy;
use zbus::{MatchRule, MessageStream};

use crate::daemon::Daemon;
use crate::services::secrets::sync;

pub async fn start(daemon: &Arc<Daemon>) -> zbus::Result<()> {
    let proxy = DBusProxy::new(&daemon.connection).await?;
    let mut departures = proxy.receive_name_owner_changed().await?;
    let watcher = daemon.clone();
    tokio::spawn(async move {
        while let Some(change) = departures.next().await {
            let Ok(arguments) = change.args() else {
                continue;
            };
            if arguments.new_owner().is_none() && arguments.name().starts_with(':') {
                let name = arguments.name().to_string();
                watcher.requesters.forget(&name);
                watcher.granted.forget_connection(&name);
                let server = watcher.connection.object_server();
                for path in watcher.sessions.owned_by(&name) {
                    watcher.sessions.close(server, &path).await;
                }
            }
        }
    });

    let watcher = daemon.clone();
    tokio::spawn(async move {
        let changes = match permissions::changes(&watcher.connection).await {
            Ok(changes) => changes,
            Err(error) => return eprintln!("Couldn't follow changes to app permissions: {error}"),
        };
        let mut changes = std::pin::pin!(changes);
        while let Some(table) = changes.next().await {
            if table == FULL_ACCESS.table {
                watcher.requesters.forget_all();
            }
        }
    });

    let rule = MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .interface("org.gnome.ScreenSaver")
        .member("ActiveChanged")
        .build()?;
    let mut screen = MessageStream::for_match_rule(rule, &daemon.connection, None).await?;
    let watcher = daemon.clone();
    tokio::spawn(async move {
        while let Some(Ok(message)) = screen.next().await {
            let Ok(active) = message.body().deserialize::<bool>() else {
                continue;
            };
            watcher.screen_locked.store(active, Ordering::Relaxed);
            let lock = active
                && watcher
                    .keyring
                    .lock()
                    .await
                    .view()
                    .is_some_and(|view| view.preferences.lock_with_screen);
            if lock {
                watcher.lock().await;
            }
        }
    });

    let publisher = daemon.clone();
    tokio::spawn(async move {
        loop {
            publisher.changed.notified().await;
            sync(&publisher).await;
            crate::services::manage::publish(&publisher).await;
        }
    });
    Ok(())
}
