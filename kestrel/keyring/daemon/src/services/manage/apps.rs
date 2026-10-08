use std::io::{Read, Write};
use std::os::fd::AsFd;
use std::sync::Arc;

use luft_keyring_vault::{Action, Secret};
use zbus::message::Header;
use zbus::zvariant::Fd;
use zbus::{fdo, interface};

use crate::daemon::Daemon;
use crate::identity::{App, Kind};

const LIMIT: u64 = 1024 * 1024;

pub struct AppSecrets {
    pub daemon: Arc<Daemon>,
}

impl AppSecrets {
    async fn app(&self, header: &Header<'_>) -> fdo::Result<App> {
        let (_, app) = self.daemon.caller(header).await;
        if app.key == App::unknown().key || (app.kind == Kind::Host && app.executable.is_empty()) {
            return Err(fdo::Error::AccessDenied(
                "This app can't be recognized".into(),
            ));
        }
        if !self.daemon.ensure_unlocked(&app, true).await {
            return Err(fdo::Error::Failed("The keyring is locked".into()));
        }
        self.daemon.keyring.lock().await.adopt(&app);
        Ok(app)
    }
}

fn valid(name: &str) -> fdo::Result<()> {
    if name.is_empty() || name.len() > 256 {
        return Err(fdo::Error::InvalidArgs(
            "Secret names are 1 to 256 bytes long".into(),
        ));
    }
    Ok(())
}

#[interface(name = "com.lantharos.Keyring1.AppSecrets")]
impl AppSecrets {
    async fn store(
        &self,
        name: &str,
        secret: Fd<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        valid(name)?;
        let app = self.app(&header).await?;
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
                    .entry(app.key.clone())
                    .or_default()
                    .insert(name.to_owned(), Secret::copy_of(&value))
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        keyring.record(&app, Action::Saved, name);
        Ok(())
    }

    async fn load(
        &self,
        name: &str,
        output: Fd<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<bool> {
        let app = self.app(&header).await?;
        let secret = {
            let keyring = self.daemon.keyring.lock().await;
            let secret = keyring
                .contents()
                .and_then(|contents| contents.apps.get(&app.key)?.get(name).cloned());
            if secret.is_some() {
                keyring.record(&app, Action::Read, name);
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

    async fn delete(&self, name: &str, #[zbus(header)] header: Header<'_>) -> fdo::Result<bool> {
        let app = self.app(&header).await?;
        let mut keyring = self.daemon.keyring.lock().await;
        let removed = keyring
            .edit(|contents| {
                let secrets = contents.apps.get_mut(&app.key)?;
                let removed = secrets.remove(name);
                if secrets.is_empty() {
                    contents.apps.remove(&app.key);
                }
                removed
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?
            .is_some();
        if removed {
            keyring.record(&app, Action::Deleted, name);
        }
        Ok(removed)
    }

    async fn list(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<Vec<String>> {
        let app = self.app(&header).await?;
        let keyring = self.daemon.keyring.lock().await;
        Ok(keyring
            .contents()
            .and_then(|contents| contents.apps.get(&app.key))
            .map(|secrets| secrets.keys().cloned().collect())
            .unwrap_or_default())
    }
}
