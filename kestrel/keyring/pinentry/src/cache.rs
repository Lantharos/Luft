use std::collections::HashMap;

use futures_util::StreamExt;
use zbus::Connection;
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};
use zeroize::Zeroizing;

const SERVICE: &str = "org.freedesktop.secrets";
const ROOT: &str = "/org/freedesktop/secrets";
const DEFAULT_COLLECTION: &str = "/org/freedesktop/secrets/aliases/default";
const SECRETS: &str = "org.freedesktop.Secret.Service";
const ITEM: &str = "org.freedesktop.Secret.Item";
const COLLECTION: &str = "org.freedesktop.Secret.Collection";
const PROMPT: &str = "org.freedesktop.Secret.Prompt";
const NO_PROMPT: &str = "/";

const SCHEMA: &str = "org.gnupg.Passphrase";
const STORED_BY: &str = "GnuPG Pinentry";

type Secret = (OwnedObjectPath, Vec<u8>, Vec<u8>, String);

pub struct Cache<'a> {
    connection: &'a Connection,
    keygrip: &'a str,
}

impl<'a> Cache<'a> {
    pub fn new(connection: &'a Connection, keygrip: &'a str) -> Self {
        Self {
            connection,
            keygrip,
        }
    }

    fn attributes(&self) -> HashMap<&'static str, &str> {
        HashMap::from([("xdg:schema", SCHEMA), ("keygrip", self.keygrip)])
    }

    async fn call<B, R>(
        &self,
        path: &str,
        interface: &str,
        method: &str,
        body: &B,
    ) -> zbus::Result<R>
    where
        B: serde::Serialize + zbus::zvariant::DynamicType,
        R: for<'d> serde::Deserialize<'d> + zbus::zvariant::Type,
    {
        self.connection
            .call_method(Some(SERVICE), path, Some(interface), method, body)
            .await?
            .body()
            .deserialize()
    }

    async fn session(&self) -> zbus::Result<OwnedObjectPath> {
        let (_, session): (OwnedValue, OwnedObjectPath) = self
            .call(ROOT, SECRETS, "OpenSession", &("plain", Value::from("")))
            .await?;
        Ok(session)
    }

    async fn prompt(&self, prompt: OwnedObjectPath) -> zbus::Result<Option<OwnedValue>> {
        if prompt.as_str() == NO_PROMPT {
            return Ok(None);
        }
        let proxy = zbus::Proxy::new(self.connection, SERVICE, prompt, PROMPT).await?;
        let mut completed = proxy.receive_signal("Completed").await?;
        proxy.call_method("Prompt", &("",)).await?;
        let Some(signal) = completed.next().await else {
            return Ok(None);
        };
        let (dismissed, result): (bool, OwnedValue) = signal.body().deserialize()?;
        Ok((!dismissed).then_some(result))
    }

    async fn items(&self) -> zbus::Result<Vec<OwnedObjectPath>> {
        let (mut unlocked, locked): (Vec<OwnedObjectPath>, Vec<OwnedObjectPath>) = self
            .call(ROOT, SECRETS, "SearchItems", &(self.attributes(),))
            .await?;
        if !locked.is_empty() {
            let (opened, prompt): (Vec<OwnedObjectPath>, OwnedObjectPath) =
                self.call(ROOT, SECRETS, "Unlock", &(&locked,)).await?;
            unlocked.extend(opened);
            if let Some(result) = self.prompt(prompt).await? {
                unlocked.extend(Vec::<OwnedObjectPath>::try_from(result).unwrap_or_default());
            }
        }
        Ok(unlocked)
    }

    pub async fn lookup(&self) -> Option<Zeroizing<Vec<u8>>> {
        let item = self.items().await.ok()?.into_iter().next()?;
        let session = self.session().await.ok()?;
        let (_, _, value, _): Secret = self
            .call(item.as_str(), ITEM, "GetSecret", &(&session,))
            .await
            .ok()?;
        Some(Zeroizing::new(value))
    }

    pub async fn store(&self, secret: &[u8]) {
        if let Err(error) = self.try_store(secret).await {
            eprintln!("The passphrase couldn't be saved in the keyring: {error}");
        }
    }

    async fn try_store(&self, secret: &[u8]) -> zbus::Result<()> {
        let session = self.session().await?;
        let mut attributes = self.attributes();
        attributes.insert("stored-by", STORED_BY);
        let label = format!("GnuPG: {}", self.keygrip);
        let properties = HashMap::from([
            (
                "org.freedesktop.Secret.Item.Label",
                Value::from(label.as_str()),
            ),
            (
                "org.freedesktop.Secret.Item.Attributes",
                Value::from(attributes),
            ),
        ]);
        let secret = (&session, Vec::<u8>::new(), secret, "text/plain");
        let (_, prompt): (OwnedObjectPath, OwnedObjectPath) = self
            .call(
                DEFAULT_COLLECTION,
                COLLECTION,
                "CreateItem",
                &(properties, secret, true),
            )
            .await?;
        self.prompt(prompt).await?;
        Ok(())
    }

    pub async fn clear(&self) {
        let Ok(items) = self.items().await else {
            return;
        };
        for item in items {
            if let Ok(prompt) = self
                .call::<_, OwnedObjectPath>(item.as_str(), ITEM, "Delete", &())
                .await
            {
                let _ = self.prompt(prompt).await;
            }
        }
    }
}
