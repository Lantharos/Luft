use std::collections::BTreeSet;

use luft_keyring_vault::{AccessRule, Contents, Item};

use super::access::app_hint;
use crate::identity::{App, Program};

pub fn predecessors(contents: &Contents, app: &App) -> BTreeSet<String> {
    let owners = items(contents).filter_map(|item| item.owner.as_ref());
    let ruled = contents.rules.iter().map(|rule| &rule.app);
    let keys: BTreeSet<&String> = owners.chain(ruled).chain(contents.apps.keys()).collect();
    keys.into_iter()
        .filter(|key| app.succeeds(key))
        .cloned()
        .collect()
}

pub fn inherited(contents: &Contents, app: &App) -> Vec<AccessRule> {
    contents
        .rules
        .iter()
        .filter(|rule| rule.allowed && app.inherits(&rule.app))
        .filter(|rule| !has_rule(contents, &app.key, rule))
        .map(|rule| AccessRule {
            app: app.key.clone(),
            ..rule.clone()
        })
        .collect()
}

pub fn inherit(contents: &mut Contents, rules: Vec<AccessRule>) {
    for rule in rules {
        if !has_rule(contents, &rule.app, &rule) {
            contents.rules.push(rule);
        }
    }
}

fn has_rule(contents: &Contents, app: &str, like: &AccessRule) -> bool {
    contents
        .rules
        .iter()
        .any(|rule| rule.app == app && rule.collection == like.collection && rule.item == like.item)
}

pub fn hand_over(contents: &mut Contents, previous: &BTreeSet<String>, key: &str) {
    for item in items_mut(contents).filter(|item| {
        item.owner
            .as_ref()
            .is_some_and(|owner| previous.contains(owner))
    }) {
        item.owner = Some(key.to_owned());
    }
    let mut covered: BTreeSet<(String, u64)> = contents
        .rules
        .iter()
        .filter(|rule| rule.app == key)
        .map(|rule| (rule.collection.clone(), rule.item))
        .collect();
    contents.rules.retain_mut(|rule| {
        if !previous.contains(&rule.app) {
            return true;
        }
        rule.app = key.to_owned();
        covered.insert((rule.collection.clone(), rule.item))
    });
    for old in previous {
        if let Some(secrets) = contents.apps.remove(old) {
            let kept = contents.apps.entry(key.to_owned()).or_default();
            for (name, secret) in secrets {
                kept.entry(name).or_insert(secret);
            }
        }
    }
}

pub fn has_misclaimed(contents: &Contents) -> bool {
    items(contents).any(misclaimed)
}

pub fn release_misclaimed(contents: &mut Contents) {
    for item in items_mut(contents).filter(|item| misclaimed(item)) {
        item.owner = None;
        item.unclaimed = true;
    }
}

fn misclaimed(item: &Item) -> bool {
    item.owner
        .as_deref()
        .and_then(|owner| owner.strip_prefix("exe:"))
        .map(Program::parse)
        .zip(app_hint(item))
        .is_some_and(|(owner, hint)| owner.is_inspector() && owner.name() != hint)
}

fn items(contents: &Contents) -> impl Iterator<Item = &Item> {
    contents
        .collections
        .iter()
        .flat_map(|collection| &collection.items)
}

fn items_mut(contents: &mut Contents) -> impl Iterator<Item = &mut Item> {
    contents
        .collections
        .iter_mut()
        .flat_map(|collection| &mut collection.items)
}
