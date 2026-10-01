use std::collections::HashSet;
use std::sync::Arc;

use luft_keyring_vault::{AccessRule, Action};

use crate::daemon::Daemon;
use crate::identity::App;
use crate::keyring::{Decision, decide};
use crate::prompter::{Answer, Request};

pub type ItemKey = (String, u64);

#[derive(Default)]
pub struct Granted {
    items: std::sync::Mutex<HashSet<(String, ItemKey)>>,
}

impl Granted {
    pub fn contains(&self, app: &App, item: &ItemKey) -> bool {
        self.items
            .lock()
            .expect("granted items")
            .contains(&(app.key.clone(), item.clone()))
    }

    pub fn add(&self, app: &App, items: &[ItemKey]) {
        let mut granted = self.items.lock().expect("granted items");
        granted.extend(items.iter().map(|item| (app.key.clone(), item.clone())));
    }

    pub fn clear(&self) {
        self.items.lock().expect("granted items").clear();
    }
}

impl Daemon {
    pub async fn allowed(&self, app: &App, item: &ItemKey) -> bool {
        if self.granted.contains(app, item) {
            return true;
        }
        let mut keyring = self.keyring.lock().await;
        keyring.adopt(app);
        let Some(contents) = keyring.contents() else {
            return false;
        };
        let Some(found) = contents.item(&item.0, item.1) else {
            return false;
        };
        matches!(
            decide(contents, app, &item.0, found),
            Decision::Allowed | Decision::Claim
        )
    }

    pub async fn authorize(
        self: &Arc<Self>,
        app: &App,
        items: &[ItemKey],
        ask: bool,
    ) -> Vec<ItemKey> {
        let mut allowed = Vec::new();
        let mut asked = Vec::new();
        let mut labels = Vec::new();
        {
            let mut keyring = self.keyring.lock().await;
            keyring.adopt(app);
            let Some(contents) = keyring.contents() else {
                return allowed;
            };
            let mut claims = Vec::new();
            for key in items {
                let Some(item) = contents.item(&key.0, key.1) else {
                    continue;
                };
                if self.granted.contains(app, key) {
                    allowed.push(key.clone());
                    continue;
                }
                match decide(contents, app, &key.0, item) {
                    Decision::Allowed => allowed.push(key.clone()),
                    Decision::Claim => {
                        claims.push(key.clone());
                        allowed.push(key.clone());
                    }
                    Decision::Ask => {
                        asked.push(key.clone());
                        labels.push(item.label.clone());
                    }
                    Decision::Denied => keyring.record(app, Action::Denied, &item.label),
                }
            }
            if !claims.is_empty() {
                let claimed = keyring.edit(|contents| {
                    for (collection, id) in &claims {
                        if let Some(item) = contents.item_mut(collection, *id) {
                            item.owner = Some(app.key.clone());
                            item.unclaimed = false;
                        }
                    }
                });
                if let Err(error) = claimed {
                    eprintln!("Couldn't remember who uses an item: {error}");
                }
            }
        }
        if asked.is_empty() || !ask || self.screen_is_locked() {
            return allowed;
        }
        match self.ask_access(app, &labels).await {
            Answer::Allowed { remember } => {
                self.remember(app, &asked, true, remember).await;
                allowed.extend(asked);
            }
            Answer::Denied { remember } => self.remember(app, &asked, false, remember).await,
            Answer::Dismissed => {}
        }
        allowed
    }

    async fn ask_access(&self, app: &App, labels: &[String]) -> Answer {
        let _turn = self.prompting.lock().await;
        let title = match labels {
            [label] => format!("Allow {} to use “{label}”?", app.name),
            labels => format!(
                "Allow {} to use {} things saved in your keyring?",
                app.name,
                labels.len()
            ),
        };
        let body = match labels {
            [_] => "It's saved in your passwords and keys.".to_owned(),
            labels => labels
                .iter()
                .take(3)
                .map(|label| format!("“{label}”"))
                .collect::<Vec<_>>()
                .join(", "),
        };
        let handle = self.prompter.handle();
        let request = Request {
            title: &title,
            body: &body,
            app: &app.icon,
            remember: true,
            ..Request::default()
        };
        self.prompter.access(&handle, &request).await
    }

    async fn remember(&self, app: &App, items: &[ItemKey], allowed: bool, remember: bool) {
        if allowed && !remember {
            self.granted.add(app, items);
            return;
        }
        let mut keyring = self.keyring.lock().await;
        if remember {
            let saved = keyring.edit(|contents| {
                contents.rules.retain(|rule| {
                    !(rule.app == app.key
                        && items.iter().any(|(collection, item)| {
                            rule.collection == *collection && rule.item == *item
                        }))
                });
                contents
                    .rules
                    .extend(items.iter().map(|(collection, item)| AccessRule {
                        app: app.key.clone(),
                        collection: collection.clone(),
                        item: *item,
                        allowed,
                    }));
            });
            if let Err(error) = saved {
                eprintln!("Couldn't remember an access choice: {error}");
            }
        }
        if !allowed && let Some(contents) = keyring.contents() {
            for (collection, id) in items {
                if let Some(item) = contents.item(collection, *id) {
                    keyring.record(app, Action::Denied, &item.label);
                }
            }
        }
    }
}
