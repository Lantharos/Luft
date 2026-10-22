use std::io::{Read, Write};
use std::os::fd::OwnedFd;

use anyhow::{Context, Result, anyhow};
use zbus::{Connection, Fd};

use super::secret::Secret;

const NAME: &str = "com.lantharos.Keyring1";
const PATH: &str = "/com/lantharos/Keyring1";
const INTERFACE: &str = "com.lantharos.Keyring1.AppSecrets";
const APP_ID: &str = "com.lantharos.accounts";

#[derive(Clone)]
pub struct Keyring {
    connection: Connection,
}

fn key(account: &str) -> String {
    format!("account-{account}")
}

fn explain(error: zbus::Error) -> anyhow::Error {
    match error {
        zbus::Error::MethodError(_, Some(message), _) => anyhow!("Luft Keyring: {message}"),
        error => anyhow!("Luft Keyring isn't reachable: {error}"),
    }
}

impl Keyring {
    pub fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub async fn store(&self, account: &str, secret: &Secret) -> Result<()> {
        let encoded = serde_json::to_vec(secret)?;
        let (reader, mut writer) = std::io::pipe()?;
        let reader = OwnedFd::from(reader);
        let feeding = tokio::task::spawn_blocking(move || writer.write_all(&encoded));
        let stored = self
            .connection
            .call_method(
                Some(NAME),
                PATH,
                Some(INTERFACE),
                "Store",
                &(APP_ID, key(account), Fd::from(&reader)),
            )
            .await;
        drop(reader);
        feeding
            .await?
            .context("The secret couldn't be handed to Luft Keyring")?;
        stored.map_err(explain)?;
        Ok(())
    }

    pub async fn load(&self, account: &str) -> Result<Option<Secret>> {
        let (mut reader, writer) = std::io::pipe()?;
        let writer = OwnedFd::from(writer);
        let draining = tokio::task::spawn_blocking(move || {
            let mut secret = Vec::new();
            reader.read_to_end(&mut secret).map(|_| secret)
        });
        let found = self
            .connection
            .call_method(
                Some(NAME),
                PATH,
                Some(INTERFACE),
                "Load",
                &(APP_ID, key(account), Fd::from(&writer)),
            )
            .await;
        drop(writer);
        let bytes = draining.await??;
        let found: bool = found.map_err(explain)?.body().deserialize()?;
        if !found {
            return Ok(None);
        }
        Ok(Some(
            serde_json::from_slice(&bytes).context("The saved sign-in is damaged")?,
        ))
    }

    pub async fn delete(&self, account: &str) -> Result<()> {
        self.connection
            .call_method(
                Some(NAME),
                PATH,
                Some(INTERFACE),
                "Delete",
                &(APP_ID, key(account)),
            )
            .await
            .map_err(explain)?;
        Ok(())
    }
}
