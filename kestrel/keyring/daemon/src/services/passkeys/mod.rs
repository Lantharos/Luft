mod key;
mod record;

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use luft_keyring_vault::now;
use luft_keyring_wire::{Chip, Problem};
use zbus::message::Header;
use zbus::zvariant::{OwnedValue, Value};
use zbus::{DBusError, interface};

use crate::daemon::Daemon;
use crate::identity::App;
use crate::unlocking::link;
use record::{Passkey, collection, find};

pub use record::SCHEMA;

const AGENT: &str = "luft-passkeys";

#[derive(Debug, DBusError)]
#[zbus(prefix = "com.lantharos.Keyring1.Error")]
pub enum PasskeyError {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAllowed(String),
    Locked(String),
    NotFound(String),
    Failed(String),
}

fn failed(error: impl std::fmt::Display) -> PasskeyError {
    PasskeyError::Failed(error.to_string())
}

fn chip_failed(problem: Problem) -> PasskeyError {
    PasskeyError::Failed(format!("{problem:?}"))
}

fn locked() -> PasskeyError {
    PasskeyError::Locked("The keyring is locked".into())
}

fn missing() -> PasskeyError {
    PasskeyError::NotFound("No such passkey".into())
}

fn text(fields: &HashMap<String, OwnedValue>, name: &str) -> String {
    fields
        .get(name)
        .and_then(|value| String::try_from(value.try_clone().ok()?).ok())
        .unwrap_or_default()
}

fn bytes(fields: &HashMap<String, OwnedValue>, name: &str) -> Vec<u8> {
    fields
        .get(name)
        .and_then(|value| Vec::<u8>::try_from(value.try_clone().ok()?).ok())
        .unwrap_or_default()
}

fn agent_path() -> Option<PathBuf> {
    Some(std::env::current_exe().ok()?.parent()?.join(AGENT))
}

pub struct Passkeys {
    pub daemon: Arc<Daemon>,
}

impl Passkeys {
    async fn caller(&self, header: &Header<'_>) -> Result<App, PasskeyError> {
        let (_, app) = self.daemon.caller(header).await;
        if !agent_path().is_some_and(|path| path.as_os_str() == app.executable.as_str()) {
            return Err(PasskeyError::NotAllowed(
                "Only Luft Passkeys can use passkeys".into(),
            ));
        }
        if !self.daemon.ensure_unlocked(&app, true).await {
            return Err(locked());
        }
        Ok(app)
    }

    async fn passkey(&self, id: &[u8]) -> Result<Passkey, PasskeyError> {
        let keyring = self.daemon.keyring.lock().await;
        let contents = keyring.contents().ok_or_else(locked)?;
        find(contents, id)
            .map(|(_, passkey)| passkey)
            .ok_or_else(missing)
    }

    async fn change(
        &self,
        id: &[u8],
        change: impl FnOnce(&mut Passkey),
    ) -> Result<Passkey, PasskeyError> {
        let mut keyring = self.daemon.keyring.lock().await;
        let changed = keyring.edit(|contents| {
            let (item, mut passkey) = find(contents, id)?;
            change(&mut passkey);
            let stored = contents.item_mut(record::COLLECTION, item)?;
            stored.secret = passkey.secret();
            stored.modified = now();
            Some(passkey)
        });
        match changed {
            Ok(Some(passkey)) => Ok(passkey),
            Ok(None) => Err(missing()),
            Err(error) => Err(failed(error)),
        }
    }

    async fn chip_ready(&self) -> bool {
        link::available()
            && self
                .daemon
                .chip
                .lock()
                .await
                .as_ref()
                .is_some_and(|status| status.chip == Chip::Ready)
    }
}

#[interface(name = "com.lantharos.Keyring1.Passkeys")]
impl Passkeys {
    async fn list(
        &self,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<HashMap<&'static str, OwnedValue>>, PasskeyError> {
        self.caller(&header).await?;
        let keyring = self.daemon.keyring.lock().await;
        let contents = keyring.contents().ok_or_else(locked)?;
        Ok(record::all(contents)
            .iter()
            .map(Passkey::describe)
            .collect())
    }

    async fn create(
        &self,
        fields: HashMap<String, OwnedValue>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<HashMap<&'static str, OwnedValue>, PasskeyError> {
        let app = self.caller(&header).await?;
        let created = key::create(self.chip_ready().await)
            .await
            .map_err(chip_failed)?;
        let protection = fields
            .get("protection")
            .and_then(|value| u8::try_from(value).ok())
            .unwrap_or(1);
        let discoverable = fields
            .get("discoverable")
            .and_then(|value| bool::try_from(value).ok())
            .unwrap_or(false);
        let mut id = vec![0; 16];
        getrandom::fill(&mut id).map_err(failed)?;
        let time = now();
        let passkey = Passkey {
            id,
            rp: text(&fields, "rp"),
            rp_name: text(&fields, "rp_name"),
            user_id: bytes(&fields, "user_id"),
            user_name: text(&fields, "user_name"),
            display_name: text(&fields, "display_name"),
            discoverable,
            protection,
            x: created.x,
            y: created.y,
            nickname: String::new(),
            created: time,
            used: 0,
            counter: 0,
            private: created.private,
            random: key::credential_random().map_err(chip_failed)?,
        };
        if passkey.rp.is_empty() || passkey.user_id.is_empty() {
            return Err(failed("A passkey needs a site and an account"));
        }
        let item = passkey.item(&app.key);
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| collection(contents).add(item))
            .map_err(failed)?;
        self.daemon.changed.notify_one();
        Ok(passkey.describe())
    }

    async fn count(
        &self,
        id: Vec<u8>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<u32, PasskeyError> {
        self.caller(&header).await?;
        let passkey = self
            .change(&id, |passkey| {
                passkey.counter = passkey.counter.wrapping_add(1);
                passkey.used = now();
            })
            .await?;
        Ok(passkey.counter)
    }

    async fn sign(
        &self,
        id: Vec<u8>,
        message: Vec<u8>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<u8>, PasskeyError> {
        self.caller(&header).await?;
        let passkey = self.passkey(&id).await?;
        key::sign(&passkey.private, &message)
            .await
            .map_err(chip_failed)
    }

    async fn hmac_secret(
        &self,
        id: Vec<u8>,
        verified: bool,
        salts: Vec<u8>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<u8>, PasskeyError> {
        self.caller(&header).await?;
        let passkey = self.passkey(&id).await?;
        Ok(key::hmac_secret(&passkey.random, verified, &salts).to_vec())
    }

    async fn update(
        &self,
        id: Vec<u8>,
        changes: HashMap<String, OwnedValue>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), PasskeyError> {
        self.caller(&header).await?;
        self.change(&id, |passkey| {
            for (name, value) in &changes {
                let Ok(value) = value.try_clone() else {
                    continue;
                };
                match (name.as_str(), Value::from(value)) {
                    ("nickname", Value::Str(text)) => passkey.nickname = text.to_string(),
                    ("user_name", Value::Str(text)) => passkey.user_name = text.to_string(),
                    ("display_name", Value::Str(text)) => passkey.display_name = text.to_string(),
                    _ => {}
                }
            }
        })
        .await?;
        self.daemon.changed.notify_one();
        Ok(())
    }

    async fn delete(
        &self,
        id: Vec<u8>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), PasskeyError> {
        self.caller(&header).await?;
        let mut keyring = self.daemon.keyring.lock().await;
        let deleted = keyring.edit(|contents| {
            let (item, _) = find(contents, &id)?;
            let collection = contents.collection_mut(record::COLLECTION)?;
            collection.items.retain(|stored| stored.id != item);
            collection.modified = now();
            Some(())
        });
        match deleted {
            Ok(Some(())) => {
                self.daemon.changed.notify_one();
                Ok(())
            }
            Ok(None) => Err(missing()),
            Err(error) => Err(failed(error)),
        }
    }

    #[zbus(property)]
    async fn chip(&self) -> bool {
        self.chip_ready().await
    }
}
