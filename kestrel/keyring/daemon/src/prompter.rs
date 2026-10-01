use std::collections::HashMap;
use std::io::Read;
use std::os::fd::OwnedFd;
use std::sync::atomic::{AtomicU64, Ordering};

use zbus::Connection;
use zbus::zvariant::{Fd, OwnedValue, Value};
use zeroize::Zeroizing;

const NAME: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/KeyringPrompter";
const INTERFACE: &str = "com.lantharos.Kestrel.KeyringPrompter";

const PATIENCE_STEP: std::time::Duration = std::time::Duration::from_millis(250);
const PATIENCE_STEPS: u32 = 240;
const CHOSEN: u32 = 0;
const REFUSED: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Answer {
    Allowed { remember: bool },
    Denied { remember: bool },
    Dismissed,
}

#[derive(Default)]
pub struct Request<'a> {
    pub title: &'a str,
    pub body: &'a str,
    pub app: &'a str,
    pub icon: &'a str,
    pub warning: &'a str,
    pub label: &'a str,
    pub action: &'a str,
    pub remember: bool,
    pub fingerprint: bool,
    pub numeric: bool,
    pub confirm: bool,
}

impl Request<'_> {
    fn options(&self, action_key: &'static str) -> HashMap<&'static str, Value<'_>> {
        let mut options = HashMap::new();
        for (key, value) in [
            ("title", self.title),
            ("body", self.body),
            ("app", self.app),
            ("icon", self.icon),
            ("warning", self.warning),
            ("label", self.label),
        ] {
            if !value.is_empty() {
                options.insert(key, Value::from(value));
            }
        }
        if !self.action.is_empty() {
            options.insert(action_key, Value::from(self.action));
        }
        for (key, value) in [
            ("remember", self.remember),
            ("fingerprint", self.fingerprint),
            ("numeric", self.numeric),
            ("confirm", self.confirm),
        ] {
            if value {
                options.insert(key, Value::from(true));
            }
        }
        options
    }
}

pub struct Prompter {
    connection: Connection,
    next: AtomicU64,
}

impl Prompter {
    pub fn new(connection: Connection) -> Self {
        Self {
            connection,
            next: AtomicU64::new(1),
        }
    }

    pub fn handle(&self) -> String {
        format!("keyring-{}", self.next.fetch_add(1, Ordering::Relaxed))
    }

    async fn shown(&self) -> bool {
        let Ok(bus) = zbus::fdo::DBusProxy::new(&self.connection).await else {
            return false;
        };
        let name = zbus::names::BusName::from_static_str(NAME).expect("a valid bus name");
        for _ in 0..PATIENCE_STEPS {
            if bus.name_has_owner(name.clone()).await.unwrap_or(false) {
                return true;
            }
            tokio::time::sleep(PATIENCE_STEP).await;
        }
        eprintln!("Kestrel isn't there to ask");
        false
    }

    pub async fn access(&self, handle: &str, request: &Request<'_>) -> Answer {
        if !self.shown().await {
            return Answer::Dismissed;
        }
        let reply = self
            .connection
            .call_method(
                Some(NAME),
                PATH,
                Some(INTERFACE),
                "Access",
                &(handle, request.options("allow")),
            )
            .await;
        let Ok(reply) = reply else {
            return Answer::Dismissed;
        };
        let Ok((response, results)) = reply
            .body()
            .deserialize::<(u32, HashMap<String, OwnedValue>)>()
        else {
            return Answer::Dismissed;
        };
        let remember = results
            .get("remember")
            .and_then(|value| bool::try_from(value).ok())
            .unwrap_or(false);
        match response {
            CHOSEN => Answer::Allowed { remember },
            REFUSED => Answer::Denied { remember },
            _ => Answer::Dismissed,
        }
    }

    pub async fn password(
        &self,
        handle: &str,
        request: &Request<'_>,
    ) -> Option<Zeroizing<Vec<u8>>> {
        if !self.shown().await {
            return None;
        }
        let (reader, writer) = rustix::pipe::pipe_with(rustix::pipe::PipeFlags::CLOEXEC).ok()?;
        let reply = self
            .connection
            .call_method(
                Some(NAME),
                PATH,
                Some(INTERFACE),
                "Password",
                &(handle, request.options("continue"), Fd::from(&writer)),
            )
            .await;
        drop(writer);
        let reply = reply
            .inspect_err(|error| eprintln!("Kestrel couldn't ask for a password: {error}"))
            .ok()?;
        let response = reply.body().deserialize::<u32>().ok()?;
        if response != CHOSEN {
            return None;
        }
        tokio::task::spawn_blocking(move || read_all(reader))
            .await
            .ok()
            .flatten()
    }

    pub async fn close(&self, handle: &str) {
        let _ = self
            .connection
            .call_method(Some(NAME), PATH, Some(INTERFACE), "Close", &(handle,))
            .await;
    }
}

fn read_all(reader: OwnedFd) -> Option<Zeroizing<Vec<u8>>> {
    let mut secret = Zeroizing::new(Vec::new());
    std::fs::File::from(reader).read_to_end(&mut secret).ok()?;
    Some(secret)
}
