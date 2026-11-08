mod service;
mod sessions;

use std::sync::Once;

use futures_util::StreamExt;
use gio::prelude::*;
use luft_app::portal::{self, Filter};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use sabine::{BridgeEvent, SabineWindow};
use serde::Deserialize;
use specta::Type;

use crate::L10N;
use service::{AuthorizedKey, REMOTE_LOGIN, RemoteLogin};
use sessions::SshSession;

const CHANGED: BridgeEvent<RemoteLogin> = BridgeEvent::new("remote-login.changed");
const LONGEST_KEY: u64 = 16 * 1024;

static WATCH: Once = Once::new();
static WATCH_SESSIONS: Once = Once::new();

#[derive(Deserialize, Type)]
struct Switch {
    on: bool,
}

#[derive(Deserialize, Type)]
struct AccountChoice {
    account: String,
    allowed: bool,
}

#[derive(Deserialize, Type)]
struct NewKey {
    key: String,
}

#[derive(Deserialize, Type)]
struct KeyTarget {
    fingerprint: String,
}

#[derive(Deserialize, Type)]
struct SessionTarget {
    id: String,
}

fn follow(events: Events) {
    luft_app::spawn(async move {
        let Ok(mut changes) = REMOTE_LOGIN.changes().await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(Some(state)) = service::read().await {
                events.emit(CHANGED, state);
            }
        }
    });
}

async fn remote_login(events: Events, Empty {}: Empty) -> Result<Option<RemoteLogin>, String> {
    let state = service::read().await?;
    if state.is_some() {
        WATCH.call_once(|| follow(events));
    }
    Ok(state)
}

async fn ssh_sessions(events: Events, Empty {}: Empty) -> Result<Vec<SshSession>, String> {
    WATCH_SESSIONS.call_once(|| sessions::watch(events));
    sessions::list().await
}

async fn keys(Empty {}: Empty) -> Result<Vec<AuthorizedKey>, String> {
    let keys: Vec<(String, String, String)> = service::change("AuthorizedKeys", &()).await?;
    Ok(keys.into_iter().map(AuthorizedKey::from).collect())
}

async fn add_key(NewKey { key }: NewKey) -> Result<AuthorizedKey, String> {
    let added: (String, String, String) = service::change("AddAuthorizedKey", &key.trim()).await?;
    Ok(added.into())
}

async fn choose_key(Empty {}: Empty) -> Result<Option<String>, String> {
    let title = t!(L10N, "desktop-remote-login-choose-title");
    let filter = t!(L10N, "desktop-remote-login-filter");
    let Some(uri) = portal::open_file(
        &title,
        Filter {
            name: &filter,
            patterns: vec!["*.pub".to_owned()],
        },
    )
    .await?
    else {
        return Ok(None);
    };
    let path = gio::File::for_uri(&uri)
        .path()
        .ok_or_else(|| t!(L10N, "desktop-remote-login-unreadable"))?;
    let unreadable = |_| t!(L10N, "desktop-remote-login-unreadable");
    if std::fs::metadata(&path).map_err(unreadable)?.len() > LONGEST_KEY {
        return Err(t!(L10N, "desktop-remote-login-unreadable"));
    }
    std::fs::read_to_string(&path)
        .map(|text| Some(text.trim().to_owned()))
        .map_err(unreadable)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .bridge_event(&sessions::CHANGED)
        .with_async("remote_login", events, remote_login)
        .with_async("remote_login_sessions", events, ssh_sessions)
        .command_async("remote_login_set_enabled", |Switch { on }| async move {
            service::change::<_, ()>("SetEnabled", &on).await
        })
        .command_async("remote_login_set_passwords", |Switch { on }| async move {
            service::change::<_, ()>("SetPasswordLogin", &on).await
        })
        .command_async("remote_login_set_public", |Switch { on }| async move {
            service::change::<_, ()>("SetPublicNetworks", &on).await
        })
        .command_async(
            "remote_login_set_account",
            |AccountChoice { account, allowed }| async move {
                service::change::<_, ()>("SetAccountAllowed", &(account, allowed)).await
            },
        )
        .command_async("remote_login_keys", keys)
        .command_async("remote_login_add_key", add_key)
        .command_async(
            "remote_login_remove_key",
            |KeyTarget { fingerprint }| async move {
                service::change::<_, ()>("RemoveAuthorizedKey", &fingerprint).await
            },
        )
        .command_async("remote_login_choose_key", choose_key)
        .command_async(
            "remote_login_disconnect",
            |SessionTarget { id }| async move { sessions::disconnect(id).await },
        )
}
