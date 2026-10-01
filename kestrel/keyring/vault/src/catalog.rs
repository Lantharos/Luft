use std::collections::BTreeMap;

use crate::{Collection, Contents, Item, now};

pub const DEFAULT_ALIAS: &str = "default";
pub const LOGIN: &str = "login";

impl Contents {
    pub fn fresh() -> Self {
        let mut contents = Self::default();
        contents.collections.push(Collection::new(LOGIN, "Login"));
        contents
            .aliases
            .insert(DEFAULT_ALIAS.to_owned(), LOGIN.to_owned());
        contents
    }

    pub fn collection(&self, id: &str) -> Option<&Collection> {
        self.collections
            .iter()
            .find(|collection| collection.id == id)
    }

    pub fn collection_mut(&mut self, id: &str) -> Option<&mut Collection> {
        self.collections
            .iter_mut()
            .find(|collection| collection.id == id)
    }

    pub fn resolve_alias(&self, alias: &str) -> Option<&str> {
        self.aliases
            .get(alias)
            .map(String::as_str)
            .filter(|id| self.collection(id).is_some())
    }

    pub fn item(&self, collection: &str, item: u64) -> Option<&Item> {
        self.collection(collection)?.item(item)
    }

    pub fn item_mut(&mut self, collection: &str, item: u64) -> Option<&mut Item> {
        self.collection_mut(collection)?.item_mut(item)
    }

    pub fn search<'a>(
        &'a self,
        query: &'a BTreeMap<String, String>,
    ) -> impl Iterator<Item = (&'a Collection, &'a Item)> {
        self.collections.iter().flat_map(move |collection| {
            collection
                .items
                .iter()
                .filter(move |item| item.matches(query))
                .map(move |item| (collection, item))
        })
    }

    pub fn create_collection(&mut self, label: &str) -> String {
        let base: String = label
            .chars()
            .map(|character| {
                if character.is_ascii_alphanumeric() {
                    character.to_ascii_lowercase()
                } else {
                    '_'
                }
            })
            .collect();
        let base = if base.trim_matches('_').is_empty() {
            "collection".to_owned()
        } else {
            base
        };
        let mut id = base.clone();
        let mut counter = 1;
        while self.collection(&id).is_some() {
            counter += 1;
            id = format!("{base}_{counter}");
        }
        self.collections.push(Collection::new(&id, label));
        id
    }

    pub fn delete_collection(&mut self, id: &str) -> bool {
        let before = self.collections.len();
        self.collections.retain(|collection| collection.id != id);
        self.aliases.retain(|_, target| target != id);
        self.rules.retain(|rule| rule.collection != id);
        before != self.collections.len()
    }

    pub fn store_item(
        &mut self,
        collection: &str,
        item: Item,
        replace: bool,
    ) -> Option<(u64, bool)> {
        let target = self.collection_mut(collection)?;
        if replace
            && let Some(existing) = target
                .items
                .iter_mut()
                .find(|existing| existing.attributes == item.attributes)
        {
            existing.label = item.label;
            existing.secret = item.secret;
            existing.content_type = item.content_type;
            existing.modified = now();
            target.modified = existing.modified;
            return Some((existing.id, false));
        }
        Some((target.add(item), true))
    }

    pub fn delete_item(&mut self, collection: &str, item: u64) -> bool {
        let Some(target) = self.collection_mut(collection) else {
            return false;
        };
        let before = target.items.len();
        target.items.retain(|existing| existing.id != item);
        target.modified = now();
        let removed = before != target.items.len();
        if removed {
            self.rules
                .retain(|rule| rule.collection != collection || rule.item != item);
        }
        removed
    }

    pub fn item_count(&self) -> usize {
        self.collections
            .iter()
            .map(|collection| collection.items.len())
            .sum()
    }

    pub fn without_secrets(&self) -> Self {
        let mut index = Self {
            collections: self.collections.clone(),
            aliases: self.aliases.clone(),
            preferences: self.preferences.clone(),
            ..Self::default()
        };
        for item in index
            .collections
            .iter_mut()
            .flat_map(|collection| collection.items.iter_mut())
        {
            item.secret = crate::Secret::default();
        }
        index
    }
}
