use std::collections::HashMap;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_keyring_vault::{Action, now};
use zbus::message::Header;
use zbus::{ObjectPath, OwnedObjectPath};
use zbus::{fdo, interface};

use super::collection::Collection;
use super::service::sender;
use super::session::{decode, encode};
use super::{Secret, SecretError, collection_path, item_path, none, sync};
use crate::daemon::Daemon;
use crate::requester::Requester;

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

    async fn permit(&self, header: &Header<'_>) -> Result<Requester, SecretError> {
        let requester = self.daemon.requester(header).await;
        if !self.daemon.ensure_unlocked(&requester, false).await {
            return Err(SecretError::locked());
        }
        if self
            .daemon
            .authorize(&requester, &[self.key()], true)
            .await
            .is_empty()
        {
            return Err(SecretError::locked());
        }
        Ok(requester)
    }

    async fn change(
        &self,
        requester: &Requester,
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
        keyring.record(requester, Action::Saved, &label);
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

#[introspect]
#[interface(name = "org.freedesktop.Secret.Item")]
impl Item {
    async fn delete(
        &self,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<OwnedObjectPath, SecretError> {
        let requester = self.permit(&header).await?;
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
        self.daemon.forget_choices(&[self.key()]).await;
        self.daemon
            .keyring
            .lock()
            .await
            .record(&requester, Action::Deleted, &label);
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
        let transfer = self
            .daemon
            .sessions
            .get(&session, &sender(&header))
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        let requester = self.permit(&header).await?;
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
        keyring.record(&requester, Action::Read, &item.label);
        Ok((secret,))
    }

    async fn set_secret(
        &self,
        secret: Secret,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), SecretError> {
        let transfer = self
            .daemon
            .sessions
            .get(&secret.0, &sender(&header))
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        let value = decode(&transfer, &secret)
            .ok_or_else(|| SecretError::failed("the secret couldn't be decrypted"))?;
        let requester = self.permit(&header).await?;
        self.change(&requester, |item| {
            item.secret = luft_keyring_vault::Secret::copy_of(&value);
            item.content_type = secret.3.clone();
        })
        .await
    }

    #[zbus(property)]
    async fn locked(&self, #[zbus(header)] header: Option<Header<'_>>) -> bool {
        let Some(header) = header else { return true };
        let requester = self.daemon.requester(&header).await;
        !self.daemon.allowed(&requester, &self.key()).await
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
        let requester = self
            .permit(&header)
            .await
            .map_err(|_| fdo::Error::AccessDenied("The item is locked".into()))?;
        self.change(&requester, |item| {
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
        let requester = self
            .permit(&header)
            .await
            .map_err(|_| fdo::Error::AccessDenied("The item is locked".into()))?;
        self.change(&requester, |item| item.label = label)
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
