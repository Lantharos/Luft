use std::collections::HashSet;

use luft_identity::permissions::{self, KEYRING_ITEMS, YES};

use crate::access::{ItemKey, entry};
use crate::daemon::Daemon;
use crate::keyring::{Decision, decide};
use crate::requester::Requester;

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
        if requester.is_you() {
            return items;
        }
        let decisions = self.decisions(requester, &items).await;
        let remembered = if decisions
            .iter()
            .any(|(_, decision)| *decision == Decision::AskTheApp)
        {
            self.remembered_entries(requester).await
        } else {
            HashSet::new()
        };
        decisions
            .into_iter()
            .filter(|(item, decision)| {
                self.granted.contains(requester, item)
                    || match decision {
                        Decision::Allowed => true,
                        Decision::AskTheApp => remembered.contains(&entry(item)),
                        Decision::Denied | Decision::ConfirmItsYou => false,
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
        let keyring = self.keyring.lock().await;
        let Some(view) = keyring.view() else {
            return Vec::new();
        };
        items
            .iter()
            .filter_map(|key| {
                let item = view.item(&key.0, key.1)?;
                Some((key.clone(), decide(requester, item)))
            })
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
