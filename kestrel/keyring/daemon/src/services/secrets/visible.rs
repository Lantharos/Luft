use std::collections::{BTreeMap, HashSet};

use luft_identity::permissions::{self, KEYRING_ITEMS, YES};
use luft_keyring_vault::Item;

use crate::access::{ItemKey, entry};
use crate::daemon::Daemon;
use crate::keyring::{Decision, decide};
use crate::requester::Requester;

const SCHEMA: &str = "xdg:schema";

/// Whether a search spells an item out: every attribute the item has, with
/// its value, and nothing else. The schema may be left out, as libsecret
/// does for schemas that aren't matched by name.
fn names(query: &BTreeMap<String, String>, item: &Item) -> bool {
    !query.is_empty()
        && item.matches(query)
        && item
            .attributes
            .keys()
            .all(|name| name == SCHEMA || query.contains_key(name))
}

impl Daemon {
    pub async fn shows(&self, requester: &Requester, item: &ItemKey) -> bool {
        if requester.is_you() || self.granted.contains(requester, item) {
            return true;
        }
        match self.decisions(requester, std::slice::from_ref(item)).await[..] {
            [(_, Decision::Allowed)] => true,
            [(_, Decision::AskTheApp)] => self.remembered(requester, item).await == Some(true),
            _ => false,
        }
    }

    pub async fn shown(&self, requester: &Requester, items: Vec<ItemKey>) -> Vec<ItemKey> {
        self.visible(requester, None, items).await
    }

    /// What a search may tell its caller. You get every match. Anyone else
    /// gets the matches they already see, and of the rest only those the
    /// search names in full and that they could still be given, so they can
    /// ask for an item they know but can't find out what else is saved.
    pub async fn found(
        &self,
        requester: &Requester,
        query: &BTreeMap<String, String>,
        items: Vec<ItemKey>,
    ) -> Vec<ItemKey> {
        self.visible(requester, Some(query), items).await
    }

    async fn visible(
        &self,
        requester: &Requester,
        query: Option<&BTreeMap<String, String>>,
        items: Vec<ItemKey>,
    ) -> Vec<ItemKey> {
        if requester.is_you() {
            return items;
        }
        let judged = self
            .judged(&items, |item| {
                let named = query.is_some_and(|query| names(query, item));
                (decide(requester, item), named)
            })
            .await;
        let remembered = if judged
            .iter()
            .any(|(_, (decision, _))| *decision == Decision::AskTheApp)
        {
            self.remembered_entries(requester).await
        } else {
            HashSet::new()
        };
        judged
            .into_iter()
            .filter(|(item, (decision, named))| {
                self.granted.contains(requester, item)
                    || match decision {
                        Decision::Allowed => true,
                        Decision::AskTheApp => *named || remembered.contains(&entry(item)),
                        Decision::ConfirmItsYou => *named,
                        Decision::Denied => false,
                    }
            })
            .map(|(item, _)| item)
            .collect()
    }

    async fn decisions(
        &self,
        requester: &Requester,
        items: &[ItemKey],
    ) -> Vec<(ItemKey, Decision)> {
        self.judged(items, |item| decide(requester, item)).await
    }

    async fn judged<T>(&self, items: &[ItemKey], judge: impl Fn(&Item) -> T) -> Vec<(ItemKey, T)> {
        let keyring = self.keyring.lock().await;
        let Some(view) = keyring.view() else {
            return Vec::new();
        };
        items
            .iter()
            .filter_map(|key| Some((key.clone(), judge(view.item(&key.0, key.1)?))))
            .collect()
    }

    async fn remembered_entries(&self, requester: &Requester) -> HashSet<String> {
        let Some(app) = requester.sandboxed_app() else {
            return HashSet::new();
        };
        permissions::entries(&self.connection, KEYRING_ITEMS)
            .await
            .unwrap_or_default()
            .into_iter()
            .filter(|(_, apps)| {
                apps.get(app)
                    .and_then(|answers| answers.first())
                    .is_some_and(|answer| answer == YES)
            })
            .map(|(id, _)| id)
            .collect()
    }
}
