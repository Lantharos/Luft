use std::collections::{BTreeMap, HashMap};
use std::io::Write;
use std::os::fd::AsFd;
use std::sync::Arc;

use luft_keyring_vault::{Action, DEFAULT_ALIAS, Item, LOGIN, Secret};
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::names::BusName;
use zbus::zvariant::{Fd, ObjectPath, OwnedValue};
use zbus::{fdo, interface};

use crate::daemon::Daemon;
use crate::identity::App;
use crate::keyring::PORTAL_SCHEMA;

pub const PATH: &str = "/org/freedesktop/portal/desktop";
const PORTAL: &str = "org.freedesktop.portal.Desktop";
const SUCCESS: u32 = 0;
const CANCELLED: u32 = 1;
const TOKEN_SIZE: usize = 64;

pub struct Portal {
    pub daemon: Arc<Daemon>,
}

impl Portal {
    async fn sent_by_portal(&self, header: &Header<'_>) -> bool {
        let Ok(proxy) = DBusProxy::new(&self.daemon.connection).await else {
            return false;
        };
        let Ok(owner) = proxy
            .get_name_owner(BusName::from_static_str(PORTAL).expect("a valid bus name"))
            .await
        else {
            return false;
        };
        header
            .sender()
            .is_some_and(|sender| sender.as_str() == owner.as_str())
    }

    async fn token(&self, app: &App, id: &str) -> Result<Secret, String> {
        let mut keyring = self.daemon.keyring.lock().await;
        let contents = keyring.contents().ok_or("the keyring is locked")?;
        let collection = contents
            .resolve_alias(DEFAULT_ALIAS)
            .unwrap_or(LOGIN)
            .to_owned();
        let query = BTreeMap::from([("app_id".to_owned(), id.to_owned())]);
        let mut matches: Vec<&Item> = contents
            .collection(&collection)
            .into_iter()
            .flat_map(|found| found.items.iter())
            .filter(|item| item.matches(&query))
            .collect();
        matches.sort_by_key(|item| {
            item.attributes
                .get("xdg:schema")
                .is_none_or(|schema| schema != PORTAL_SCHEMA)
        });
        if let Some(item) = matches.first() {
            let secret = item.secret.clone();
            keyring.record(app, Action::Read, &item.label);
            return Ok(secret);
        }
        let mut bytes = vec![0; TOKEN_SIZE];
        getrandom::fill(&mut bytes).map_err(|error| error.to_string())?;
        let secret = Secret::new(bytes);
        let attributes = BTreeMap::from([
            ("app_id".to_owned(), id.to_owned()),
            ("xdg:schema".to_owned(), PORTAL_SCHEMA.to_owned()),
        ]);
        let mut item = Item::new(
            format!("Secret for {}", app.name),
            attributes,
            secret.clone(),
            "application/octet-stream".into(),
        );
        item.owner = Some(app.key.clone());
        keyring
            .edit(|contents| contents.store_item(&collection, item, false))
            .map_err(|error| error.to_string())?;
        keyring.record(app, Action::Saved, &format!("Secret for {}", app.name));
        Ok(secret)
    }
}

#[interface(name = "org.freedesktop.impl.portal.Secret")]
impl Portal {
    async fn retrieve_secret(
        &self,
        _handle: ObjectPath<'_>,
        app_id: &str,
        fd: Fd<'_>,
        _options: HashMap<String, OwnedValue>,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<(u32, HashMap<String, OwnedValue>)> {
        if !self.sent_by_portal(&header).await {
            return Err(fdo::Error::AccessDenied(
                "Only the desktop portal may ask for app secrets".into(),
            ));
        }
        if app_id.is_empty() {
            return Err(fdo::Error::InvalidArgs(
                "Apps without an ID can't have a secret".into(),
            ));
        }
        let app = App::flatpak(app_id);
        if !self.daemon.ensure_unlocked(&app, true).await {
            return Ok((CANCELLED, HashMap::new()));
        }
        let secret = self.token(&app, app_id).await.map_err(fdo::Error::Failed)?;
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
