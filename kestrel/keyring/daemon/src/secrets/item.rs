use std::collections::HashMap;
use std::sync::Arc;

use luft_keyring_vault::{Action, now};
use zbus::message::Header;
use zbus::zvariant::{ObjectPath, OwnedObjectPath};
use zbus::{fdo, interface};

use super::collection::Collection;
use super::session::{decode, encode};
use super::{Secret, SecretError, collection_path, item_path, none, sync};
use crate::daemon::Daemon;
use crate::identity::App;

pub struct Item {
    pub daemon: Arc<Daemon>,
    pub collection: String,
    pub id: u64,
}

impl Item {
    fn key(&self) -> (String, u64) {
        (self.collection.clone(), self.id)
    }

    async fn read<T>(&self, read: impl FnOnce(&luft_keyring_vault::Item) -> T) -> Option<T> {
        let keyring = self.daemon.keyring.lock().await;
        keyring.view()?.item(&self.collection, self.id).map(read)
    }

    async fn permit(&self, header: &Header<'_>) -> Result<App, SecretError> {
        let (_, app) = self.daemon.caller(header).await;
        if !self.daemon.ensure_unlocked(&app, false).await {
            return Err(SecretError::locked());
        }
        if self
            .daemon
            .authorize(&app, &[self.key()], true)
            .await
            .is_empty()
        {
            return Err(SecretError::locked());
        }
        Ok(app)
    }

    async fn change(
        &self,
        app: &App,
        change: impl FnOnce(&mut luft_keyring_vault::Item),
    ) -> Result<(), SecretError> {
        let mut keyring = self.daemon.keyring.lock().await;
        let label = keyring
            .edit(|contents| {
                let item = contents.item_mut(&self.collection, self.id)?;
                change(item);
                item.modified = now();
                Some(item.label.clone())
            })
            .map_err(SecretError::failed)?
            .ok_or_else(SecretError::missing)?;
        keyring.record(app, Action::Saved, &label);
        drop(keyring);
        if let Ok(emitter) = zbus::object_server::SignalEmitter::new(
            &self.daemon.connection,
            collection_path(&self.collection),
        ) {
            let _ =
                Collection::item_changed(&emitter, item_path(&self.collection, self.id).as_ref())
                    .await;
        }
        Ok(())
    }
}

#[interface(name = "org.freedesktop.Secret.Item")]
impl Item {
    async fn delete(
        &self,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<OwnedObjectPath, SecretError> {
        let app = self.permit(&header).await?;
        let label = self
            .read(|item| item.label.clone())
            .await
            .unwrap_or_default();
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.delete_item(&self.collection, self.id))
            .map_err(SecretError::failed)?;
        self.daemon
            .keyring
            .lock()
            .await
            .record(&app, Action::Deleted, &label);
        sync(&self.daemon).await;
        if let Ok(emitter) = zbus::object_server::SignalEmitter::new(
            &self.daemon.connection,
            collection_path(&self.collection),
        ) {
            let _ =
                Collection::item_deleted(&emitter, item_path(&self.collection, self.id).as_ref())
                    .await;
        }
        self.daemon.changed.notify_one();
        Ok(none())
    }

    async fn get_secret(
        &self,
        session: ObjectPath<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(Secret,), SecretError> {
        let (sender, _) = self.daemon.caller(&header).await;
        let transfer = self
            .daemon
            .sessions
            .get(&session, &sender)
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        let app = self.permit(&header).await?;
        let keyring = self.daemon.keyring.lock().await;
        let item = keyring
            .contents()
            .and_then(|contents| contents.item(&self.collection, self.id))
            .ok_or_else(SecretError::missing)?;
        let secret = encode(
            &OwnedObjectPath::from(session),
            &transfer,
            item.secret.expose(),
            &item.content_type,
        );
        keyring.record(&app, Action::Read, &item.label);
        Ok((secret,))
    }

    async fn set_secret(
        &self,
        secret: Secret,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), SecretError> {
        let (sender, _) = self.daemon.caller(&header).await;
        let transfer = self
            .daemon
            .sessions
            .get(&secret.0, &sender)
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        let value = decode(&transfer, &secret)
            .ok_or_else(|| SecretError::failed("the secret couldn't be decrypted"))?;
        let app = self.permit(&header).await?;
        self.change(&app, |item| {
            item.secret = luft_keyring_vault::Secret::copy_of(&value);
            item.content_type = secret.3.clone();
        })
        .await
    }

    #[zbus(property)]
    async fn locked(&self, #[zbus(header)] header: Option<Header<'_>>) -> bool {
        let Some(header) = header else { return true };
        let (_, app) = self.daemon.caller(&header).await;
        !self.daemon.allowed(&app, &self.key()).await
    }

    #[zbus(property)]
    async fn attributes(&self) -> HashMap<String, String> {
        self.read(|item| item.attributes.clone().into_iter().collect())
            .await
            .unwrap_or_default()
    }

    #[zbus(property)]
    async fn set_attributes(
        &self,
        attributes: HashMap<String, String>,
        #[zbus(header)] header: Option<Header<'_>>,
    ) -> fdo::Result<()> {
        let header = header.ok_or_else(|| fdo::Error::AccessDenied("Unknown caller".into()))?;
        let app = self
            .permit(&header)
            .await
            .map_err(|_| fdo::Error::AccessDenied("The item is locked".into()))?;
        self.change(&app, |item| {
            item.attributes = attributes.into_iter().collect()
        })
        .await
        .map_err(|_| fdo::Error::Failed("The item couldn't be changed".into()))
    }

    #[zbus(property)]
    async fn label(&self) -> String {
        self.read(|item| item.label.clone())
            .await
            .unwrap_or_default()
    }

    #[zbus(property)]
    async fn set_label(
        &self,
        label: String,
        #[zbus(header)] header: Option<Header<'_>>,
    ) -> fdo::Result<()> {
        let header = header.ok_or_else(|| fdo::Error::AccessDenied("Unknown caller".into()))?;
        let app = self
            .permit(&header)
            .await
            .map_err(|_| fdo::Error::AccessDenied("The item is locked".into()))?;
        self.change(&app, |item| item.label = label)
            .await
            .map_err(|_| fdo::Error::Failed("The item couldn't be changed".into()))
    }

    #[zbus(property)]
    async fn created(&self) -> u64 {
        self.read(|item| item.created).await.unwrap_or_default()
    }

    #[zbus(property)]
    async fn modified(&self) -> u64 {
        self.read(|item| item.modified).await.unwrap_or_default()
    }
}
