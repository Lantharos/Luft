use futures_util::StreamExt;
use luft_app::Events;
use luft_app::dbus::{self, error_message, failed};
use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::proxy::{Builder, CacheProperties, MethodFlags};
use zbus::{OwnedObjectPath, Proxy};

const LOGIN: &str = "org.freedesktop.login1";
const LOGIN_PATH: &str = "/org/freedesktop/login1";
const MANAGER: &str = "org.freedesktop.login1.Manager";
const SESSION: &str = "org.freedesktop.login1.Session";
const SSHD: &str = "sshd";
const CLOSING: &str = "closing";
const MICROSECONDS: u64 = 1_000_000;

pub const CHANGED: BridgeEvent<Vec<SshSession>> = BridgeEvent::new("remote-login.sessions");

#[derive(Serialize, Type)]
pub struct SshSession {
    id: String,
    account: String,
    address: String,
    since: u64,
}

async fn manager() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, LOGIN, LOGIN_PATH, MANAGER)
        .await
        .map_err(failed)
}

async fn session(id: String, path: OwnedObjectPath) -> Result<Option<SshSession>, String> {
    let session: Proxy<'_> = Builder::new(dbus::system().await?)
        .destination(LOGIN)
        .path(path)
        .interface(SESSION)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(failed)?;
    let service: String = session.get_property("Service").await.map_err(failed)?;
    let state: String = session.get_property("State").await.map_err(failed)?;
    if service != SSHD || state == CLOSING {
        return Ok(None);
    }
    let since: u64 = session.get_property("Timestamp").await.map_err(failed)?;
    Ok(Some(SshSession {
        id,
        account: session.get_property("Name").await.map_err(failed)?,
        address: session.get_property("RemoteHost").await.map_err(failed)?,
        since: since / MICROSECONDS,
    }))
}

pub async fn list() -> Result<Vec<SshSession>, String> {
    let listed: Vec<(String, u32, String, String, OwnedObjectPath)> = manager()
        .await?
        .call("ListSessions", &())
        .await
        .map_err(failed)?;
    let mut sessions = Vec::new();
    for (id, .., path) in listed {
        sessions.extend(session(id, path).await?);
    }
    sessions.sort_by_key(|session| session.since);
    Ok(sessions)
}

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(manager) = manager().await else {
            return;
        };
        let (Ok(new), Ok(removed)) = (
            manager.receive_signal("SessionNew").await,
            manager.receive_signal("SessionRemoved").await,
        ) else {
            return;
        };
        let mut changes = futures_util::stream::select(new, removed);
        while changes.next().await.is_some() {
            if let Ok(sessions) = list().await {
                events.emit(CHANGED, sessions);
            }
        }
    });
}

pub async fn disconnect(id: String) -> Result<(), String> {
    manager()
        .await?
        .call_with_flags::<_, _, ()>("TerminateSession", MethodFlags::ALLOW_INTERACTIVE_AUTH, &id)
        .await
        .map(drop)
        .map_err(|error| error_message(&error).map_or_else(|| failed(&error), str::to_owned))
}
