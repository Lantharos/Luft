use std::collections::{BTreeMap, HashMap};
use std::io::Write;
use std::os::fd::AsFd;
use std::sync::Arc;

use luft_keyring_vault::{Action, DEFAULT_ALIAS, Item, LOGIN, Secret};
use zbus::message::Header;
use zbus::{Fd, ObjectPath, OwnedVariant};
use zbus::{fdo, interface};

use crate::daemon::Daemon;
use crate::keyring::{PORTAL_SCHEMA, sandboxed_owner};
use crate::requester::{Caller, Requester, app_name};

pub const PATH: &str = "/org/freedesktop/portal/desktop";
const PORTAL: &str = "org.freedesktop.portal.Desktop";
const SUCCESS: u32 = 0;
const CANCELLED: u32 = 1;
const REQUESTS: &str = "/org/freedesktop/portal/desktop/request/";
const TOKEN_SIZE: usize = 64;
const APP_ID: &str = "app_id";
const SCHEMA: &str = "xdg:schema";

pub struct Portal {
    pub daemon: Arc<Daemon>,
}

impl Portal {
    async fn requester(&self, handle: &ObjectPath<'_>) -> Option<Requester> {
        let escaped = handle.as_str().strip_prefix(REQUESTS)?.split_once('/')?.0;
        let sender = format!(":{}", escaped.replace('_', "."));
        let requester = self
            .daemon
            .requesters
            .identify(&self.daemon.connection, &sender)
            .await;
        (requester.caller != Caller::Unknown).then_some(requester)
    }

    async fn token(&self, requester: &Requester, app_id: &str) -> Result<Secret, String> {
        let mut keyring = self.daemon.keyring.lock().await;
        let contents = keyring.contents().ok_or("the keyring is locked")?;
        let collection = contents
            .resolve_alias(DEFAULT_ALIAS)
            .unwrap_or(LOGIN)
            .to_owned();
        let kept = contents
            .collection(&collection)
            .into_iter()
            .flat_map(|found| found.items.iter())
            .find(|item| kept_for(item, requester, app_id));
        if let Some(item) = kept {
            let secret = item.secret.clone();
            keyring.record(requester, Action::Read, &item.label);
            return Ok(secret);
        }
        let mut bytes = vec![0; TOKEN_SIZE];
        getrandom::fill(&mut bytes).map_err(|error| error.to_string())?;
        let secret = Secret::new(bytes);
        let attributes = BTreeMap::from([
            (APP_ID.to_owned(), app_id.to_owned()),
            (SCHEMA.to_owned(), PORTAL_SCHEMA.to_owned()),
        ]);
        let label = match requester.sandboxed_app() {
            Some(id) => format!("Secret for {}", app_name(id)),
            None if app_id.is_empty() => "Secret for apps on this computer".to_owned(),
            None => format!("Secret for {app_id}"),
        };
        let mut item = Item::new(
            label.clone(),
            attributes,
            secret.clone(),
            "application/octet-stream".into(),
        );
        item.owner = requester.owner();
        keyring
            .edit(|contents| contents.store_item(&collection, item, None))
            .map_err(|error| error.to_string())?;
        keyring.record(requester, Action::Saved, &label);
        Ok(secret)
    }
}

fn kept_for(item: &Item, requester: &Requester, app_id: &str) -> bool {
    item.attributes
        .get(SCHEMA)
        .is_some_and(|schema| schema == PORTAL_SCHEMA)
        && item
            .attributes
            .get(APP_ID)
            .is_some_and(|named| named == app_id)
        && sandboxed_owner(item) == requester.sandboxed_app()
}

#[interface(name = "org.freedesktop.impl.portal.Secret")]
impl Portal {
    async fn retrieve_secret(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        fd: Fd<'_>,
        _options: HashMap<String, OwnedVariant>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<(u32, HashMap<String, OwnedVariant>)> {
        if !self.daemon.sent_by(&header, PORTAL).await {
            return Err(fdo::Error::AccessDenied(
                "Only the desktop portal may ask for app secrets".into(),
            ));
        }
        let Some(requester) = self.requester(&handle).await else {
            return Err(fdo::Error::AccessDenied(
                "The app asking for a secret couldn't be identified".into(),
            ));
        };
        if !self.daemon.ensure_unlocked(&requester, true).await {
            return Ok((CANCELLED, HashMap::new()));
        }
        let app_id = requester.sandboxed_app().unwrap_or(app_id).to_owned();
        let secret = self
            .token(&requester, &app_id)
            .await
            .map_err(fdo::Error::Failed)?;
        let file = fd
            .as_fd()
            .try_clone_to_owned()
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        std::fs::File::from(file)
            .write_all(secret.expose())
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.daemon.changed.notify_one();
        Ok((SUCCESS, HashMap::new()))
    }

    #[zbus(property, name = "version")]
    fn version(&self) -> u32 {
        1
    }
}
