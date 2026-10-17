use std::collections::HashMap;
use std::time::Duration;

use futures_util::{Stream, StreamExt};
use tokio::time::{Instant, timeout_at};
use zbus::message::Type;
use zbus::{Connection, MatchRule, MessageStream, OwnedObjectPath, OwnedVariant, Proxy};

use crate::failed;

const SETTLE: Duration = Duration::from_millis(120);
const MAX_DELAY: Duration = Duration::from_millis(600);

type Properties = HashMap<String, OwnedVariant>;
type Managed = HashMap<OwnedObjectPath, HashMap<String, Properties>>;

pub struct Objects(HashMap<String, HashMap<String, Properties>>);

#[derive(Clone, Copy)]
pub struct Object<'a> {
    pub path: &'a str,
    properties: &'a Properties,
}

impl Objects {
    pub async fn fetch(connection: &Connection, service: &str, root: &str) -> Result<Self, String> {
        let manager = Proxy::new(
            connection,
            service,
            root,
            "org.freedesktop.DBus.ObjectManager",
        )
        .await
        .map_err(failed)?;
        let managed: Managed = manager
            .call("GetManagedObjects", &())
            .await
            .map_err(failed)?;
        Ok(Self(
            managed
                .into_iter()
                .map(|(path, interfaces)| (path.to_string(), interfaces))
                .collect(),
        ))
    }

    pub fn get(&self, path: &str, interface: &str) -> Option<Object<'_>> {
        let (path, interfaces) = self.0.get_key_value(path)?;
        Some(Object {
            path,
            properties: interfaces.get(interface)?,
        })
    }

    pub fn implementing<'a>(&'a self, interface: &'a str) -> impl Iterator<Item = Object<'a>> {
        self.0.iter().filter_map(move |(path, interfaces)| {
            Some(Object {
                path,
                properties: interfaces.get(interface)?,
            })
        })
    }
}

impl Object<'_> {
    pub fn get<T: TryFrom<OwnedVariant>>(&self, name: &str) -> Option<T> {
        self.properties.get(name)?.try_clone().ok()?.try_into().ok()
    }

    pub fn flag(&self, name: &str) -> bool {
        self.get(name).unwrap_or(false)
    }

    pub fn link(&self, name: &str) -> Option<String> {
        self.get::<OwnedObjectPath>(name)
            .map(|path| path.to_string())
            .filter(|path| path != "/")
    }
}

/// Every signal `sender` sends from an object under `root`.
pub async fn signals(
    connection: &Connection,
    sender: &str,
    root: &str,
) -> Result<MessageStream, String> {
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(sender)
        .path_namespace(root)
        .build()
        .map_err(failed)?;
    MessageStream::for_match_rule(rule, connection, None)
        .await
        .map_err(failed)
}

/// Waits for the next change, then for the burst it starts to quiet down,
/// so a refresh follows a flurry of changes once. False once the changes end.
pub async fn settle<S: Stream + Unpin>(changes: &mut S) -> bool {
    if changes.next().await.is_none() {
        return false;
    }
    let deadline = Instant::now() + MAX_DELAY;
    while let Ok(Some(_)) =
        timeout_at((Instant::now() + SETTLE).min(deadline), changes.next()).await
    {}
    true
}
