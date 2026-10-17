use std::collections::HashMap;

use futures_util::StreamExt;
use luft_app::dbus;
use zbus::message::Type;
use zbus::{MatchRule, Message, MessageStream, ObjectPath, OwnedVariant};

use super::Engine;

const CONNECTED_GLOBAL: u32 = 70;
const NETWORK_MANAGER: &str = "org.freedesktop.NetworkManager";

fn resumed() -> zbus::Result<MatchRule<'static>> {
    MatchRule::builder()
        .msg_type(Type::Signal)
        .path("/org/freedesktop/login1")
        .interface("org.freedesktop.login1.Manager")
        .member("PrepareForSleep")
        .build()
}

fn network() -> zbus::Result<MatchRule<'static>> {
    MatchRule::builder()
        .msg_type(Type::Signal)
        .path("/org/freedesktop/NetworkManager")
        .interface("org.freedesktop.DBus.Properties")
        .member("PropertiesChanged")
        .arg(0, NETWORK_MANAGER)
        .build()
}

fn woke(message: &Message) -> bool {
    message
        .body()
        .deserialize::<bool>()
        .is_ok_and(|sleeping| !sleeping)
}

fn connected(message: &Message) -> bool {
    let Ok((_, changed, _)) = message
        .body()
        .deserialize::<(String, HashMap<String, OwnedVariant>, Vec<String>)>()
    else {
        return false;
    };
    let state = changed
        .get("State")
        .and_then(|state| state.downcast_ref::<u32>().ok());
    let primary = changed
        .get("PrimaryConnection")
        .and_then(|path| path.downcast_ref::<ObjectPath>().ok());
    state == Some(CONNECTED_GLOBAL) || primary.is_some_and(|path| path.as_str() != "/")
}

async fn listen(
    rule: zbus::Result<MatchRule<'static>>,
    matters: fn(&Message) -> bool,
    engine: &Engine,
) -> Result<(), String> {
    let rule = rule.map_err(dbus::failed)?;
    let mut messages = MessageStream::for_match_rule(rule, dbus::system().await?, None)
        .await
        .map_err(dbus::failed)?;
    while let Some(message) = messages.next().await {
        if let Ok(message) = message
            && matters(&message)
        {
            engine.refresh();
        }
    }
    Ok(())
}

fn follow(
    name: &'static str,
    rule: zbus::Result<MatchRule<'static>>,
    matters: fn(&Message) -> bool,
    engine: Engine,
) {
    luft_app::spawn(async move {
        if let Err(error) = listen(rule, matters, &engine).await {
            eprintln!("mailman: can't follow {name} changes: {error}");
        }
    });
}

pub fn start(engine: Engine) {
    follow("resume", resumed(), woke, engine.clone());
    follow("network", network(), connected, engine);
}
