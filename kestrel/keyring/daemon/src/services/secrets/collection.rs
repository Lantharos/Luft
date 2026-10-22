use std::collections::{BTreeMap, HashMap};
use std::sync::Arc;

use luft_keyring_vault::{Action, Item as StoredItem, Secret as Stored};
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{ObjectPath, OwnedObjectPath};
use zbus::{fdo, interface};

use super::service::sender;
use super::session::decode;
use super::{Properties, Secret, SecretError, Target, item_path, none, sync};
use crate::daemon::Daemon;
use crate::prompter::{Answer, Request};
use crate::requester::Requester;

const ITEM_LABEL: &str = "org.freedesktop.Secret.Item.Label";
const ITEM_ATTRIBUTES: &str = "org.freedesktop.Secret.Item.Attributes";

pub struct Collection {
    pub daemon: Arc<Daemon>,
    pub target: Target,
}

impl Collection {
    async fn id(&self) -> Option<String> {
        match &self.target {
            Target::Collection(id) => Some(id.clone()),
            Target::Alias(alias) => {
                let keyring = self.daemon.keyring.lock().await;
                keyring.view()?.resolve_alias(alias).map(ToOwned::to_owned)
            }
            Target::Item(..) => None,
        }
    }

    async fn read<T>(&self, read: impl FnOnce(&luft_keyring_vault::Collection) -> T) -> Option<T> {
        let id = self.id().await?;
        let keyring = self.daemon.keyring.lock().await;
        keyring.view()?.collection(&id).map(read)
    }

    /// The item a save replaces: one with the same attributes that the
    /// requester may already use. Anything else stays as it is, and the
    /// requester gets an item of its own.
    async fn replaceable(
        &self,
        requester: &Requester,
        id: &str,
        attributes: &BTreeMap<String, String>,
    ) -> Option<u64> {
        let matching: Vec<u64> = {
            let keyring = self.daemon.keyring.lock().await;
            keyring
                .contents()?
                .collection(id)?
                .items
                .iter()
                .filter(|item| item.attributes == *attributes && requester.view.shows(item))
                .map(|item| item.id)
                .collect()
        };
        for item in matching {
            if self.daemon.allowed(requester, &(id.to_owned(), item)).await {
                return Some(item);
            }
        }
        None
    }
}

#[interface(name = "org.freedesktop.Secret.Collection")]
impl Collection {
    async fn delete(
        &self,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<OwnedObjectPath, SecretError> {
        let requester = self.daemon.requester(&header).await;
        let id = self.id().await.ok_or_else(SecretError::missing)?;
        if !self.daemon.ensure_unlocked(&requester, true).await {
            return Err(SecretError::locked());
        }
        let label = self
            .read(|collection| collection.label.clone())
            .await
            .unwrap_or_default();
        let title = format!(
            "Allow {} to delete “{label}” and everything in it?",
            requester.named()
        );
        let request = Request {
            title: &title,
            app: requester.icon(),
            action: "Delete",
            ..Request::default()
        };
        let answer = {
            let _turn = self.daemon.prompting.lock().await;
            self.daemon
                .prompter
                .access(&self.daemon.prompter.handle(), &request)
                .await
        };
        if !matches!(answer, Answer::Allowed { .. }) {
            return Err(SecretError::IsLocked("Deleting was declined".into()));
        }
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.delete_collection(&id))
            .map_err(SecretError::failed)?;
        self.daemon.forget_collection_choices(&id).await;
        self.daemon
            .keyring
            .lock()
            .await
            .record(&requester, Action::Deleted, &label);
        sync(&self.daemon).await;
        let emitter = super::service::root_emitter(&self.daemon);
        super::Service::collection_deleted(&emitter, super::collection_path(&id).as_ref()).await?;
        Ok(none())
    }

    async fn search_items(
        &self,
        attributes: HashMap<String, String>,
        #[zbus(header)] header: Header<'_>,
    ) -> Vec<OwnedObjectPath> {
        let view = self.daemon.requester(&header).await.view;
        let query: BTreeMap<String, String> = attributes.into_iter().collect();
        let Some(id) = self.id().await else {
            return Vec::new();
        };
        self.read(|collection| {
            collection
                .items
                .iter()
                .filter(|item| item.matches(&query) && view.shows(item))
                .map(|item| item_path(&id, item.id))
                .collect()
        })
        .await
        .unwrap_or_default()
    }

    async fn create_item(
        &self,
        properties: Properties,
        secret: Secret,
        replace: bool,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(OwnedObjectPath, OwnedObjectPath), SecretError> {
        let requester = self.daemon.requester(&header).await;
        let id = self.id().await.ok_or_else(SecretError::missing)?;
        let transfer = self
            .daemon
            .sessions
            .get(&secret.0, &sender(&header))
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        let value = decode(&transfer, &secret)
            .ok_or_else(|| SecretError::failed("the secret couldn't be decrypted"))?;
        if !self.daemon.ensure_unlocked(&requester, true).await {
            return Err(SecretError::locked());
        }
        let label = properties
            .get(ITEM_LABEL)
            .and_then(|value| String::try_from(value.clone()).ok())
            .unwrap_or_default();
        let attributes: BTreeMap<String, String> = properties
            .get(ITEM_ATTRIBUTES)
            .and_then(|value| HashMap::<String, String>::try_from(value.clone()).ok())
            .unwrap_or_default()
            .into_iter()
            .collect();
        let existing = if replace {
            self.replaceable(&requester, &id, &attributes).await
        } else {
            None
        };
        if existing.is_none() && !self.daemon.may_save(&requester, &label).await {
            return Err(SecretError::IsLocked(
                "Saving this item was declined".into(),
            ));
        }
        let mut item = StoredItem::new(
            label.clone(),
            attributes,
            Stored::copy_of(&value),
            secret.3.clone(),
        );
        item.owner = requester.owner();
        let stored = self
            .daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.store_item(&id, item, existing))
            .map_err(SecretError::failed)?;
        let (item_id, created) = stored.ok_or_else(SecretError::missing)?;
        self.daemon
            .keyring
            .lock()
            .await
            .record(&requester, Action::Saved, &label);
        sync(&self.daemon).await;
        let path = item_path(&id, item_id);
        if created {
            Self::item_created(&emitter, path.as_ref()).await?;
        } else {
            Self::item_changed(&emitter, path.as_ref()).await?;
        }
        self.daemon.changed.notify_one();
        Ok((path, none()))
    }

    #[zbus(property)]
    async fn items(&self) -> Vec<OwnedObjectPath> {
        let Some(id) = self.id().await else {
            return Vec::new();
        };
        self.read(|collection| {
            collection
                .items
                .iter()
                .map(|item| item_path(&id, item.id))
                .collect()
        })
        .await
        .unwrap_or_default()
    }

    #[zbus(property)]
    async fn label(&self) -> String {
        self.read(|collection| collection.label.clone())
            .await
            .unwrap_or_default()
    }

    #[zbus(property)]
    async fn set_label(&self, label: String) -> fdo::Result<()> {
        let id = self
            .id()
            .await
            .ok_or_else(|| fdo::Error::UnknownObject("No such collection".into()))?;
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| {
                if let Some(collection) = contents.collection_mut(&id) {
                    collection.label = label;
                }
            })
            .map_err(|error| fdo::Error::Failed(error.to_string()))
    }

    #[zbus(property)]
    async fn locked(&self) -> bool {
        self.daemon.keyring.lock().await.is_locked()
    }

    #[zbus(property)]
    async fn created(&self) -> u64 {
        self.read(|collection| collection.created)
            .await
            .unwrap_or_default()
    }

    #[zbus(property)]
    async fn modified(&self) -> u64 {
        self.read(|collection| collection.modified)
            .await
            .unwrap_or_default()
    }

    #[zbus(signal)]
    pub async fn item_created(
        emitter: &SignalEmitter<'_>,
        item: ObjectPath<'_>,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn item_deleted(
        emitter: &SignalEmitter<'_>,
        item: ObjectPath<'_>,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn item_changed(
        emitter: &SignalEmitter<'_>,
        item: ObjectPath<'_>,
    ) -> zbus::Result<()>;
}
