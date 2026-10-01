use std::sync::Arc;

use luft_keyring_vault::Action;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::zvariant::{ObjectPath, OwnedObjectPath};
use zbus::{fdo, interface};

use super::settings_only;
use crate::daemon::Daemon;
use crate::identity::App;
use crate::secrets::{Target, item_path, parse};

pub struct Access {
    pub daemon: Arc<Daemon>,
}

type Entry = (String, String, String, String, OwnedObjectPath, bool);
type Store = (String, String, String, u32);
type Event = (u64, String, String, String, String);

fn action_name(action: Action) -> &'static str {
    match action {
        Action::Read => "read",
        Action::Saved => "saved",
        Action::Deleted => "deleted",
        Action::Denied => "denied",
        Action::Signed => "signed",
    }
}

#[interface(name = "com.lantharos.Keyring1.Access")]
impl Access {
    async fn entries(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<Vec<Entry>> {
        settings_only(&self.daemon, &header).await?;
        let keyring = self.daemon.keyring.lock().await;
        let Some(contents) = keyring.contents() else {
            return Ok(Vec::new());
        };
        let entry = |key: &str, label: &str, path: OwnedObjectPath, allowed: bool| {
            let app = App::from_key(key);
            (
                key.to_owned(),
                app.name,
                app.icon,
                label.to_owned(),
                path,
                allowed,
            )
        };
        let mut entries: Vec<Entry> = contents
            .collections
            .iter()
            .flat_map(|collection| collection.items.iter().map(move |item| (collection, item)))
            .filter_map(|(collection, item)| {
                Some(entry(
                    item.owner.as_deref()?,
                    &item.label,
                    item_path(&collection.id, item.id),
                    true,
                ))
            })
            .collect();
        entries.extend(contents.rules.iter().filter_map(|rule| {
            let item = contents.item(&rule.collection, rule.item)?;
            Some(entry(
                &rule.app,
                &item.label,
                item_path(&rule.collection, rule.item),
                rule.allowed,
            ))
        }));
        Ok(entries)
    }

    async fn revoke(
        &self,
        app: &str,
        item: ObjectPath<'_>,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        settings_only(&self.daemon, &header).await?;
        let Some(Target::Item(collection, id)) = parse(&item) else {
            return Err(fdo::Error::InvalidArgs("Not an item".into()));
        };
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| {
                contents.rules.retain(|rule| {
                    !(rule.app == app && rule.collection == collection && rule.item == id)
                });
                if let Some(item) = contents.item_mut(&collection, id)
                    && item.owner.as_deref() == Some(app)
                {
                    item.owner = None;
                    item.unclaimed = false;
                }
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.daemon.granted.clear();
        Self::changed(&emitter).await?;
        Ok(())
    }

    async fn app_stores(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<Vec<Store>> {
        settings_only(&self.daemon, &header).await?;
        let keyring = self.daemon.keyring.lock().await;
        let Some(contents) = keyring.contents() else {
            return Ok(Vec::new());
        };
        Ok(contents
            .apps
            .iter()
            .map(|(key, secrets)| {
                let app = App::from_key(key);
                (
                    key.clone(),
                    app.name,
                    app.icon,
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
        settings_only(&self.daemon, &header).await?;
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
        settings_only(&self.daemon, &header).await?;
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
        settings_only(&self.daemon, &header).await?;
        self.daemon
            .keyring
            .lock()
            .await
            .audit()
            .clear()
            .map_err(|error| fdo::Error::Failed(error.to_string()))
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
