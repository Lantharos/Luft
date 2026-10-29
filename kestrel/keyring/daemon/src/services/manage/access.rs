use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_keyring_vault::Action;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{fdo, interface};

use super::confirmed;
use crate::daemon::Daemon;
use crate::requester::{app_name, sandboxed_app_of};

pub struct Access {
    pub daemon: Arc<Daemon>,
}

const APP: &str = "app:";

type Store = (String, String, String, u32);
type Event = (u64, String, String, String, String);

fn store_label(key: &str) -> (String, String) {
    match sandboxed_app_of(key).or_else(|| key.strip_prefix(APP)) {
        Some(id) => (app_name(id), id.to_owned()),
        None => (key.to_owned(), String::new()),
    }
}

fn action_name(action: Action) -> &'static str {
    match action {
        Action::Read => "read",
        Action::Saved => "saved",
        Action::Deleted => "deleted",
        Action::Denied => "denied",
        Action::Signed => "signed",
    }
}

#[introspect]
#[interface(name = "com.lantharos.Keyring1.Access")]
impl Access {
    async fn app_stores(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<Vec<Store>> {
        confirmed(
            &self.daemon,
            &header,
            "see which apps keep secrets in your keyring",
        )
        .await?;
        let keyring = self.daemon.keyring.lock().await;
        let Some(contents) = keyring.contents() else {
            return Ok(Vec::new());
        };
        Ok(contents
            .apps
            .iter()
            .map(|(key, secrets)| {
                let (name, icon) = store_label(key);
                (
                    key.clone(),
                    name,
                    icon,
                    u32::try_from(secrets.len()).unwrap_or(u32::MAX),
                )
            })
            .collect())
    }

    async fn forget_app(
        &self,
        app: &str,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        confirmed(&self.daemon, &header, "delete the secrets an app keeps").await?;
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.apps.remove(app))
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        Self::changed(&emitter).await?;
        Ok(())
    }

    async fn history(
        &self,
        limit: u32,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Vec<Event>> {
        confirmed(
            &self.daemon,
            &header,
            "see when apps used your passwords and keys",
        )
        .await?;
        let keyring = self.daemon.keyring.lock().await;
        let Some(key) = keyring.key() else {
            return Ok(Vec::new());
        };
        let records = keyring
            .audit()
            .read(key)
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        Ok(records
            .into_iter()
            .rev()
            .take(limit as usize)
            .map(|record| {
                (
                    record.time,
                    record.app_name,
                    record.app,
                    action_name(record.action).to_owned(),
                    record.target,
                )
            })
            .collect())
    }

    async fn clear_history(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<()> {
        confirmed(
            &self.daemon,
            &header,
            "clear the history of your passwords and keys",
        )
        .await?;
        self.daemon
            .keyring
            .lock()
            .await
            .audit()
            .clear()
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.daemon.changed.notify_one();
        Ok(())
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
