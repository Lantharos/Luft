use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use luft_identity::permissions::{self, KEYRING_ITEMS};
use luft_keyring_vault::Action;

use crate::daemon::Daemon;
use crate::keyring::{Decision, decide, sandboxed_owner};
use crate::prompter::{Answer, Request};
use crate::requester::{Caller, Requester, app_name};

pub type ItemKey = (String, u64);

const MANAGING: Duration = Duration::from_secs(5 * 60);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum Grantee {
    Connection(String),
    App(String),
}

impl Grantee {
    fn of(requester: &Requester) -> Option<Self> {
        match (&requester.caller, &requester.connection) {
            (Caller::App(id), _) => Some(Self::App(id.clone())),
            (Caller::You | Caller::Unknown, Some(connection)) => {
                Some(Self::Connection(connection.clone()))
            }
            _ => None,
        }
    }
}

#[derive(Default)]
pub struct Granted {
    items: Mutex<HashSet<(Grantee, ItemKey)>>,
    managing: Mutex<HashMap<String, Instant>>,
}

impl Granted {
    pub fn contains(&self, requester: &Requester, item: &ItemKey) -> bool {
        Grantee::of(requester).is_some_and(|grantee| {
            self.items
                .lock()
                .expect("granted items")
                .contains(&(grantee, item.clone()))
        })
    }

    pub fn add(&self, requester: &Requester, items: &[ItemKey]) {
        let Some(grantee) = Grantee::of(requester) else {
            return;
        };
        let mut granted = self.items.lock().expect("granted items");
        granted.extend(items.iter().map(|item| (grantee.clone(), item.clone())));
    }

    pub fn may_manage(&self, connection: &str) -> bool {
        self.managing
            .lock()
            .expect("managing connections")
            .get(connection)
            .is_some_and(|since| since.elapsed() < MANAGING)
    }

    pub fn let_manage(&self, connection: &str) {
        self.managing
            .lock()
            .expect("managing connections")
            .insert(connection.to_owned(), Instant::now());
    }

    pub fn forget_connection(&self, connection: &str) {
        let gone = Grantee::Connection(connection.to_owned());
        self.items
            .lock()
            .expect("granted items")
            .retain(|(grantee, _)| *grantee != gone);
        self.managing
            .lock()
            .expect("managing connections")
            .remove(connection);
    }

    pub fn clear(&self) {
        self.items.lock().expect("granted items").clear();
        self.managing.lock().expect("managing connections").clear();
    }
}

struct Pending {
    key: ItemKey,
    label: String,
    owner: Option<String>,
}

pub fn entry(item: &ItemKey) -> String {
    format!("{}/{}", item.0, item.1)
}

impl Daemon {
    pub async fn allowed(&self, requester: &Requester, item: &ItemKey) -> bool {
        if self.granted.contains(requester, item) {
            return true;
        }
        let decision = {
            let keyring = self.keyring.lock().await;
            let Some(found) = keyring
                .contents()
                .and_then(|contents| contents.item(&item.0, item.1))
            else {
                return false;
            };
            decide(requester, found)
        };
        match decision {
            Decision::Allowed => true,
            Decision::AskTheApp => self.remembered(requester, item).await == Some(true),
            Decision::Denied | Decision::ConfirmItsYou => false,
        }
    }

    async fn remembered(&self, requester: &Requester, item: &ItemKey) -> Option<bool> {
        let app = requester.sandboxed_app()?;
        permissions::answer(&self.connection, KEYRING_ITEMS, &entry(item), app).await
    }

    pub async fn authorize(
        self: &Arc<Self>,
        requester: &Requester,
        items: &[ItemKey],
        ask: bool,
    ) -> Vec<ItemKey> {
        let decisions: Vec<(Pending, Decision)> = {
            let keyring = self.keyring.lock().await;
            let Some(contents) = keyring.contents() else {
                return Vec::new();
            };
            items
                .iter()
                .filter_map(|key| {
                    let item = contents.item(&key.0, key.1)?;
                    let pending = Pending {
                        key: key.clone(),
                        label: item.label.clone(),
                        owner: sandboxed_owner(item).map(ToOwned::to_owned),
                    };
                    Some((pending, decide(requester, item)))
                })
                .collect()
        };
        let mut allowed = Vec::new();
        let mut denied = Vec::new();
        let mut asked = Vec::new();
        let mut confirmed = Vec::new();
        for (pending, decision) in decisions {
            if self.granted.contains(requester, &pending.key) {
                allowed.push(pending.key);
                continue;
            }
            match decision {
                Decision::Allowed => allowed.push(pending.key),
                Decision::Denied => denied.push(pending),
                Decision::ConfirmItsYou => confirmed.push(pending),
                Decision::AskTheApp => match self.remembered(requester, &pending.key).await {
                    Some(true) => allowed.push(pending.key),
                    Some(false) => denied.push(pending),
                    None => asked.push(pending),
                },
            }
        }
        self.record_denied(requester, &denied).await;
        if !ask || self.screen_is_locked() {
            return allowed;
        }
        if !asked.is_empty() {
            allowed.extend(self.ask_the_app(requester, asked).await);
        }
        if !confirmed.is_empty() {
            allowed.extend(self.confirm_for_you(requester, confirmed).await);
        }
        allowed
    }

    async fn record_denied(&self, requester: &Requester, denied: &[Pending]) {
        if denied.is_empty() {
            return;
        }
        let keyring = self.keyring.lock().await;
        for pending in denied {
            keyring.record(requester, Action::Denied, &pending.label);
        }
    }

    async fn ask_the_app(&self, requester: &Requester, asked: Vec<Pending>) -> Vec<ItemKey> {
        let labels: Vec<&str> = asked.iter().map(|pending| pending.label.as_str()).collect();
        let answer = self.ask_access(requester, &labels).await;
        let keys: Vec<ItemKey> = asked.iter().map(|pending| pending.key.clone()).collect();
        match answer {
            Answer::Allowed { remember } => {
                self.remember(requester, &keys, true, remember).await;
                keys
            }
            Answer::Denied { remember } => {
                self.remember(requester, &keys, false, remember).await;
                self.record_denied(requester, &asked).await;
                Vec::new()
            }
            Answer::Dismissed => Vec::new(),
        }
    }

    async fn ask_access(&self, requester: &Requester, labels: &[&str]) -> Answer {
        let _turn = self.prompting.lock().await;
        let who = requester.named();
        let title = match labels {
            [label] => format!("Allow {who} to use “{label}”?"),
            labels => format!(
                "Allow {who} to use {} things saved in your keyring?",
                labels.len()
            ),
        };
        let body = match labels {
            [_] => "It's saved in your passwords and keys.".to_owned(),
            labels => quoted(labels),
        };
        let request = Request {
            title: &title,
            body: &body,
            app: requester.icon(),
            remember: requester.sandboxed_app().is_some(),
            ..Request::default()
        };
        self.prompter
            .access(&self.prompter.handle(), &request)
            .await
    }

    async fn remember(
        &self,
        requester: &Requester,
        items: &[ItemKey],
        allowed: bool,
        remember: bool,
    ) {
        match requester.sandboxed_app() {
            Some(app) if remember => {
                for item in items {
                    let saved = permissions::set(
                        &self.connection,
                        KEYRING_ITEMS,
                        &entry(item),
                        app,
                        allowed,
                    )
                    .await;
                    if let Err(error) = saved {
                        eprintln!("Couldn't remember an access choice: {error}");
                    }
                }
            }
            _ if allowed => self.granted.add(requester, items),
            _ => {}
        }
    }

    async fn confirm_for_you(
        self: &Arc<Self>,
        requester: &Requester,
        items: Vec<Pending>,
    ) -> Vec<ItemKey> {
        let owners: HashSet<&str> = items
            .iter()
            .filter_map(|pending| pending.owner.as_deref())
            .collect();
        let saved_by = owners
            .into_iter()
            .map(app_name)
            .collect::<Vec<_>>()
            .join(", ");
        let title = match items.as_slice() {
            [pending] => format!("Allow an app on this computer to use “{}”?", pending.label),
            items => format!(
                "Allow an app on this computer to use {} things other apps saved?",
                items.len()
            ),
        };
        let them = if items.len() == 1 { "it" } else { "them" };
        let body = format!("{saved_by} saved {them}. Confirm it's you to share {them}.");
        if !self.confirm_its_you(&title, &body).await {
            self.record_denied(requester, &items).await;
            return Vec::new();
        }
        let keys: Vec<ItemKey> = items.into_iter().map(|pending| pending.key).collect();
        self.granted.add(requester, &keys);
        keys
    }

    pub async fn may_save(&self, requester: &Requester, label: &str) -> bool {
        if requester.caller != Caller::Unknown {
            return true;
        }
        let _turn = self.prompting.lock().await;
        let title = format!("Allow an app to save “{label}”?");
        let request = Request {
            title: &title,
            body: "It would be saved in your passwords and keys.",
            action: "Save",
            ..Request::default()
        };
        matches!(
            self.prompter
                .access(&self.prompter.handle(), &request)
                .await,
            Answer::Allowed { .. }
        )
    }

    pub async fn forget_choices(&self, items: &[ItemKey]) {
        for item in items {
            if let Err(error) =
                permissions::remove(&self.connection, KEYRING_ITEMS, &entry(item)).await
            {
                eprintln!("Couldn't forget the access choices about an item: {error}");
            }
        }
    }

    pub async fn forget_collection_choices(&self, collection: &str) {
        let prefix = format!("{collection}/");
        let entries = match permissions::entries(&self.connection, KEYRING_ITEMS).await {
            Ok(entries) => entries,
            Err(error) => {
                eprintln!("Couldn't look up access choices: {error}");
                return;
            }
        };
        for (id, _) in entries.iter().filter(|(id, _)| id.starts_with(&prefix)) {
            if let Err(error) = permissions::remove(&self.connection, KEYRING_ITEMS, id).await {
                eprintln!("Couldn't forget the access choices about an item: {error}");
            }
        }
    }
}

fn quoted(labels: &[&str]) -> String {
    labels
        .iter()
        .take(3)
        .map(|label| format!("“{label}”"))
        .collect::<Vec<_>>()
        .join(", ")
}
