use std::io::{Read, Write};
use std::os::fd::AsFd;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_keyring_vault::{Action, Secret};
use zbus::Fd;
use zbus::message::Header;
use zbus::{fdo, interface};

use crate::daemon::Daemon;
use crate::requester::{Caller, Requester, SANDBOXED};

const LIMIT: u64 = 1024 * 1024;

pub struct AppSecrets {
    pub daemon: Arc<Daemon>,
}

impl AppSecrets {
    async fn store_of(&self, header: &Header<'_>, app: &str) -> fdo::Result<(Requester, String)> {
        valid(app, "App IDs")?;
        let requester = self.daemon.requester(header).await;
        let store = match &requester.caller {
            Caller::You => format!("app:{app}"),
            Caller::App(id) if id == app => format!("{SANDBOXED}{id}"),
            Caller::App(_) => {
                return Err(fdo::Error::AccessDenied(
                    "Apps can only use their own secrets".into(),
                ));
            }
            Caller::Unknown => {
                return Err(fdo::Error::AccessDenied(
                    "This app can't be recognized".into(),
                ));
            }
        };
        if !self.daemon.ensure_unlocked(&requester, true).await {
            return Err(fdo::Error::Failed("The keyring is locked".into()));
        }
        Ok((requester, store))
    }
}

fn valid(name: &str, what: &str) -> fdo::Result<()> {
    if name.is_empty() || name.len() > 256 {
        return Err(fdo::Error::InvalidArgs(format!(
            "{what} are 1 to 256 bytes long"
        )));
    }
    Ok(())
}

#[introspect]
#[interface(name = "com.lantharos.Keyring1.AppSecrets")]
impl AppSecrets {
    async fn store(
        &self,
        app: &str,
        name: &str,
        secret: Fd<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        valid(name, "Secret names")?;
        let (requester, store) = self.store_of(&header, app).await?;
        let file = std::fs::File::from(
            secret
                .as_fd()
                .try_clone_to_owned()
                .map_err(|error| fdo::Error::Failed(error.to_string()))?,
        );
        let value = tokio::task::spawn_blocking(move || {
            let mut value = zeroize::Zeroizing::new(Vec::new());
            file.take(LIMIT).read_to_end(&mut value).map(|_| value)
        })
        .await
        .map_err(|error| fdo::Error::Failed(error.to_string()))?
        .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        let mut keyring = self.daemon.keyring.lock().await;
        keyring
            .edit(|contents| {
                contents
                    .apps
                    .entry(store)
                    .or_default()
                    .insert(name.to_owned(), Secret::copy_of(&value))
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        keyring.record(&requester, Action::Saved, name);
        Ok(())
    }

    async fn load(
        &self,
        app: &str,
        name: &str,
        output: Fd<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<bool> {
        let (requester, store) = self.store_of(&header, app).await?;
        let secret = {
            let keyring = self.daemon.keyring.lock().await;
            let secret = keyring
                .contents()
                .and_then(|contents| contents.apps.get(&store)?.get(name).cloned());
            if secret.is_some() {
                keyring.record(&requester, Action::Read, name);
            }
            secret
        };
        let Some(secret) = secret else {
            return Ok(false);
        };
        let mut file = std::fs::File::from(
            output
                .as_fd()
                .try_clone_to_owned()
                .map_err(|error| fdo::Error::Failed(error.to_string()))?,
        );
        tokio::task::spawn_blocking(move || file.write_all(secret.expose()))
            .await
            .map_err(|error| fdo::Error::Failed(error.to_string()))?
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        Ok(true)
    }

    async fn delete(
        &self,
        app: &str,
        name: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<bool> {
        let (requester, store) = self.store_of(&header, app).await?;
        let mut keyring = self.daemon.keyring.lock().await;
        let removed = keyring
            .edit(|contents| {
                let secrets = contents.apps.get_mut(&store)?;
                let removed = secrets.remove(name);
                if secrets.is_empty() {
                    contents.apps.remove(&store);
                }
                removed
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?
            .is_some();
        if removed {
            keyring.record(&requester, Action::Deleted, name);
        }
        Ok(removed)
    }

    async fn list(
        &self,
        app: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Vec<String>> {
        let (_, store) = self.store_of(&header, app).await?;
        let keyring = self.daemon.keyring.lock().await;
        Ok(keyring
            .contents()
            .and_then(|contents| contents.apps.get(&store))
            .map(|secrets| secrets.keys().cloned().collect())
            .unwrap_or_default())
    }
}
