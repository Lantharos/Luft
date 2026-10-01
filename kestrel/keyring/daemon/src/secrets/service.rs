use std::collections::HashMap;
use std::sync::Arc;

use luft_keyring_vault::{Action as Logged, DEFAULT_ALIAS, LOGIN};
use zbus::message::Header;
use zbus::object_server::{ObjectServer, SignalEmitter};
use zbus::zvariant::{ObjectPath, OwnedObjectPath, OwnedValue, Value};
use zbus::{fdo, interface};

use super::prompt::{Action, PromptObject};
use super::session::{Session, encode};
use super::transfer::{PLAIN, Transfer};
use super::{Properties, ROOT, Secret, SecretError, Target, collection_path, none, parse, sync};
use crate::access::ItemKey;
use crate::daemon::Daemon;
use crate::identity::App;

const LABEL: &str = "org.freedesktop.Secret.Collection.Label";

pub struct Service {
    pub daemon: Arc<Daemon>,
}

impl Daemon {
    pub async fn caller(&self, header: &Header<'_>) -> (String, App) {
        let sender = header.sender().map(ToString::to_string).unwrap_or_default();
        let app = self.identities.identify(&self.connection, &sender).await;
        (sender, app)
    }

    pub async fn items_of(&self, paths: &[OwnedObjectPath]) -> Vec<ItemKey> {
        paths
            .iter()
            .filter_map(|path| match parse(path) {
                Some(Target::Item(collection, item)) => Some((collection, item)),
                _ => None,
            })
            .collect()
    }
}

#[interface(name = "org.freedesktop.Secret.Service")]
impl Service {
    async fn open_session(
        &self,
        algorithm: &str,
        input: OwnedValue,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
    ) -> fdo::Result<(OwnedValue, OwnedObjectPath)> {
        let (sender, _) = self.daemon.caller(&header).await;
        let bytes = Vec::<u8>::try_from(input).unwrap_or_default();
        let (transfer, output) = Transfer::negotiate(algorithm, &bytes)
            .map_err(|_| fdo::Error::NotSupported(format!("{algorithm} isn't supported")))?;
        let output = if algorithm == PLAIN {
            Value::from("")
        } else {
            Value::from(output)
        };
        let path = self.daemon.sessions.add(&sender, transfer);
        server
            .at(
                &path,
                Session {
                    path: path.clone(),
                    daemon: self.daemon.clone(),
                },
            )
            .await?;
        Ok((output.try_into().map_err(zbus::Error::from)?, path))
    }

    async fn create_collection(
        &self,
        properties: Properties,
        alias: &str,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(OwnedObjectPath, OwnedObjectPath), SecretError> {
        let (_, app) = self.daemon.caller(&header).await;
        if !self.daemon.ensure_unlocked(&app, true).await {
            return Err(SecretError::locked());
        }
        let label = properties
            .get(LABEL)
            .and_then(|value| String::try_from(value.clone()).ok())
            .unwrap_or_default();
        let id = self
            .daemon
            .keyring
            .lock()
            .await
            .edit(|contents| {
                if let Some(existing) = (!alias.is_empty())
                    .then(|| contents.resolve_alias(alias))
                    .flatten()
                {
                    return (existing.to_owned(), false);
                }
                let id = contents.create_collection(&label);
                if !alias.is_empty() {
                    contents.aliases.insert(alias.to_owned(), id.clone());
                }
                (id, true)
            })
            .map_err(SecretError::failed)?;
        let path = collection_path(&id.0);
        if id.1 {
            sync(&self.daemon).await;
            Self::collection_created(&emitter, path.as_ref()).await?;
        }
        Ok((path, none()))
    }

    async fn search_items(
        &self,
        attributes: HashMap<String, String>,
        #[zbus(header)] header: Header<'_>,
    ) -> (Vec<OwnedObjectPath>, Vec<OwnedObjectPath>) {
        let (_, app) = self.daemon.caller(&header).await;
        self.daemon.ensure_unlocked(&app, false).await;
        let query = attributes.into_iter().collect();
        let found: Vec<ItemKey> = {
            let keyring = self.daemon.keyring.lock().await;
            let Some(view) = keyring.view() else {
                return (Vec::new(), Vec::new());
            };
            view.search(&query)
                .map(|(collection, item)| (collection.id.clone(), item.id))
                .collect()
        };
        let (mut unlocked, mut locked) = (Vec::new(), Vec::new());
        for key in found {
            let path = super::item_path(&key.0, key.1);
            if self.daemon.allowed(&app, &key).await {
                unlocked.push(path);
            } else {
                locked.push(path);
            }
        }
        (unlocked, locked)
    }

    async fn unlock(
        &self,
        objects: Vec<OwnedObjectPath>,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
    ) -> fdo::Result<(Vec<OwnedObjectPath>, OwnedObjectPath)> {
        let (_, app) = self.daemon.caller(&header).await;
        let locked = self.daemon.keyring.lock().await.is_locked();
        let mut unlocked = Vec::new();
        let mut pending = Vec::new();
        for object in objects {
            match parse(&object) {
                Some(Target::Item(collection, item))
                    if !locked && self.daemon.allowed(&app, &(collection.clone(), item)).await =>
                {
                    unlocked.push(object);
                }
                Some(Target::Collection(_) | Target::Alias(_)) if !locked => unlocked.push(object),
                Some(_) => pending.push(object),
                None => {}
            }
        }
        if pending.is_empty() {
            return Ok((unlocked, none()));
        }
        let prompt = PromptObject::register(
            &self.daemon,
            server,
            Action::Unlock {
                app,
                objects: pending,
            },
        )
        .await?;
        Ok((unlocked, prompt))
    }

    async fn lock(&self, objects: Vec<OwnedObjectPath>) -> (Vec<OwnedObjectPath>, OwnedObjectPath) {
        self.daemon.lock().await;
        (objects, none())
    }

    async fn get_secrets(
        &self,
        items: Vec<OwnedObjectPath>,
        session: ObjectPath<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<HashMap<OwnedObjectPath, Secret>, SecretError> {
        let (sender, app) = self.daemon.caller(&header).await;
        let transfer = self
            .daemon
            .sessions
            .get(&session, &sender)
            .ok_or_else(|| SecretError::NoSession("No such session".into()))?;
        if !self.daemon.ensure_unlocked(&app, false).await {
            return Ok(HashMap::new());
        }
        let keys = self.daemon.items_of(&items).await;
        let allowed = self.daemon.authorize(&app, &keys, true).await;
        let keyring = self.daemon.keyring.lock().await;
        let Some(contents) = keyring.contents() else {
            return Ok(HashMap::new());
        };
        let session = OwnedObjectPath::from(session);
        let mut secrets = HashMap::new();
        for (collection, id) in allowed {
            if let Some(item) = contents.item(&collection, id) {
                secrets.insert(
                    super::item_path(&collection, id),
                    encode(
                        &session,
                        &transfer,
                        item.secret.expose(),
                        &item.content_type,
                    ),
                );
                keyring.record(&app, Logged::Read, &item.label);
            }
        }
        Ok(secrets)
    }

    async fn read_alias(&self, name: &str) -> OwnedObjectPath {
        let keyring = self.daemon.keyring.lock().await;
        match keyring.view() {
            Some(view) => view.resolve_alias(name).map_or_else(none, collection_path),
            None if name == DEFAULT_ALIAS => collection_path(LOGIN),
            None => none(),
        }
    }

    async fn set_alias(
        &self,
        name: &str,
        collection: ObjectPath<'_>,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), SecretError> {
        let (_, app) = self.daemon.caller(&header).await;
        if !self.daemon.ensure_unlocked(&app, true).await {
            return Err(SecretError::locked());
        }
        let target = match parse(&collection) {
            Some(Target::Collection(id)) => Some(id),
            _ if collection.as_str() == "/" => None,
            _ => return Err(SecretError::missing()),
        };
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| match target {
                Some(id) => contents.aliases.insert(name.to_owned(), id),
                None => contents.aliases.remove(name),
            })
            .map_err(SecretError::failed)?;
        sync(&self.daemon).await;
        Ok(())
    }

    #[zbus(property)]
    async fn collections(&self) -> Vec<OwnedObjectPath> {
        let keyring = self.daemon.keyring.lock().await;
        match keyring.view() {
            Some(view) => view
                .collections
                .iter()
                .map(|collection| collection_path(&collection.id))
                .collect(),
            None => vec![collection_path(LOGIN)],
        }
    }

    #[zbus(signal)]
    pub async fn collection_created(
        emitter: &SignalEmitter<'_>,
        collection: ObjectPath<'_>,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn collection_deleted(
        emitter: &SignalEmitter<'_>,
        collection: ObjectPath<'_>,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn collection_changed(
        emitter: &SignalEmitter<'_>,
        collection: ObjectPath<'_>,
    ) -> zbus::Result<()>;
}

pub fn root_emitter(daemon: &Daemon) -> SignalEmitter<'static> {
    SignalEmitter::new(&daemon.connection, ROOT)
        .expect("the service path is valid")
        .into_owned()
}
