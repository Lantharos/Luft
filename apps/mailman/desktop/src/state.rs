use std::path::PathBuf;

use luft_app::{Appearance, Events};
use serde::Serialize;

use crate::accounts::{Account, Credentials, Provider, oauth_providers};
use crate::services::launch::{self, Launch};
use crate::services::notify::Notifier;
use crate::store::{Identity, Mailbox, Settings, Store};
use crate::sync::Engine;

#[derive(Clone)]
pub struct MailmanState {
    pub events: Events,
    pub store: Store,
    pub engine: Engine,
    pub credentials: Credentials,
    pub notifier: Notifier,
    launch: Vec<Launch>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    launch: Vec<Launch>,
    accounts: Vec<Account>,
    identities: Vec<Identity>,
    mailboxes: Vec<Mailbox>,
    settings: Settings,
    oauth: Vec<Provider>,
    #[serde(flatten)]
    appearance: Appearance,
}

pub fn data_folder() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("mailman")
}

pub fn cache_folder() -> PathBuf {
    dirs::cache_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("mailman")
}

impl MailmanState {
    pub fn new() -> Self {
        let events = Events::default();
        let store = Store::open(&data_folder().join("mail.sqlite")).expect("the mail store opens");
        let credentials = Credentials::default();
        let notifier = Notifier::default();
        notifier.set_enabled(store.settings().notifications);
        Self {
            engine: Engine::new(
                store.clone(),
                events.clone(),
                credentials.clone(),
                notifier.clone(),
            ),
            launch: launch::current_process(),
            events,
            store,
            credentials,
            notifier,
        }
    }

    pub fn start(&self) {
        self.notifier.watch(self.events.clone());
        self.engine.start();
    }

    pub fn app_state(&self) -> Result<AppState, String> {
        Ok(AppState {
            launch: self.launch.clone(),
            accounts: self.store.accounts()?,
            identities: self.store.identities()?,
            mailboxes: self.store.mailboxes(None)?,
            settings: self.store.settings(),
            oauth: oauth_providers(),
            appearance: Appearance::current(),
        })
    }
}
