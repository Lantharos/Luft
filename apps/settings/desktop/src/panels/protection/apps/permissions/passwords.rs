use std::collections::HashMap;

use luft_app::identity::permissions::{self, KEYRING_ITEMS, YES};
use serde::Serialize;
use zbus::Connection;

#[derive(Serialize, Default, Clone, Copy)]
pub struct Remembered {
    allowed: usize,
    total: usize,
}

/// How many saved items each app was answered about, and allowed.
pub async fn counts(connection: &Connection) -> zbus::Result<HashMap<String, Remembered>> {
    let mut counts: HashMap<String, Remembered> = HashMap::new();
    for (_, apps) in permissions::entries(connection, KEYRING_ITEMS).await? {
        for (app, answer) in apps {
            let remembered = counts.entry(app).or_default();
            remembered.total += 1;
            if answer.first().map(String::as_str) == Some(YES) {
                remembered.allowed += 1;
            }
        }
    }
    Ok(counts)
}

pub async fn forget(connection: &Connection, app: &str) -> zbus::Result<()> {
    for (item, apps) in permissions::entries(connection, KEYRING_ITEMS).await? {
        if apps.contains_key(app) {
            permissions::forget(connection, KEYRING_ITEMS, &item, app).await?;
        }
    }
    Ok(())
}
