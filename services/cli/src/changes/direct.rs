//! Changes any program of yours could make: luft makes them itself.

use serde_json::Value as Json;

use super::Change;
use super::history::Restore;
use crate::failure::Outcome;
use crate::settings::catalogue::{Keeping, Setting};
use crate::settings::gsettings::{self, Key};
use crate::settings::values;

/// The keys a setting that chooses between sets of keys may write.
fn mapped_keys(setting: &Setting) -> Vec<&str> {
    let mut keys: Vec<&str> = setting
        .options
        .iter()
        .flat_map(|option| option.set.keys().map(String::as_str))
        .collect();
    keys.sort_unstable();
    keys.dedup();
    keys
}

async fn make_one(change: &Change, from: &Json, restore: &mut Vec<Restore>) -> Outcome {
    let setting = &change.setting.id;
    match change.setting.keeping() {
        Keeping::Key(name) => {
            let key = Key::open(name)?;
            restore.push(Restore::Key {
                setting: setting.clone(),
                key: name.to_owned(),
                own: key.own_value(),
            });
            key.write(&change.value)?;
        }
        Keeping::Mapped => {
            let option = change
                .setting
                .options
                .iter()
                .find(|option| option.value == change.value)
                .expect("the value was checked against the options");
            for name in mapped_keys(change.setting) {
                restore.push(Restore::Key {
                    setting: setting.clone(),
                    key: name.to_owned(),
                    own: Key::open(name)?.own_value(),
                });
            }
            for (name, value) in &option.set {
                Key::open(name)?.write(value)?;
            }
        }
        Keeping::Service(service) => {
            values::set_service(service, &change.value).await?;
            restore.push(Restore::Setting {
                setting: setting.clone(),
                value: from.clone(),
            });
        }
        Keeping::System(_) => unreachable!("system settings are only changed after review"),
    }
    Ok(())
}

/// Makes the changes in order, and returns how to put back those it made,
/// with why it stopped when one failed.
pub async fn make(changes: &[(Change, Json)]) -> (Vec<Restore>, Option<String>) {
    let mut restore = Vec::new();
    let mut stopped = None;
    for (change, from) in changes {
        if let Err(error) = make_one(change, from, &mut restore).await {
            restore.retain(|kept| kept.setting() != change.setting.id);
            stopped = Some(format!("{}: {error}", change.setting.id));
            break;
        }
    }
    gsettings::sync();
    (restore, stopped)
}

/// Puts back what a change made, the way `make` kept it.
pub async fn restore(kept: &[Restore]) -> Outcome {
    for restore in kept {
        match restore {
            Restore::Key { key, own, .. } => Key::open(key)?.restore(own.as_deref())?,
            Restore::Setting { setting, value } => {
                let found = crate::settings::catalogue::find(setting);
                if let Some(Keeping::Service(service)) = found.map(Setting::keeping) {
                    values::set_service(service, value).await?;
                }
            }
        }
    }
    gsettings::sync();
    Ok(())
}
