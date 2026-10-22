use std::collections::HashMap;

use luft_app::apps::App;
use luft_app::identity::permissions::{self, KEYRING_ITEMS, YES};
use serde::Serialize;
use zbus::Connection;

use super::{identify, sort};

#[derive(Serialize)]
pub struct Remembered {
    #[serde(flatten)]
    app: App,
    allowed: usize,
    total: usize,
}

pub async fn list(connection: &Connection) -> zbus::Result<Vec<Remembered>> {
    let mut answers: HashMap<String, (usize, usize)> = HashMap::new();
    for (_, apps) in permissions::entries(connection, KEYRING_ITEMS).await? {
        for (app, answer) in apps {
            let (allowed, total) = answers.entry(app).or_default();
            *total += 1;
            if answer.first().map(String::as_str) == Some(YES) {
                *allowed += 1;
            }
        }
    }
    let mut apps: Vec<Remembered> = answers
        .into_iter()
        .map(|(app, (allowed, total))| Remembered {
            app: identify(app),
            allowed,
            total,
        })
        .collect();
    sort(&mut apps, |remembered| &remembered.app);
    Ok(apps)
}

pub async fn forget(connection: &Connection, app: &str) -> zbus::Result<()> {
    for (item, apps) in permissions::entries(connection, KEYRING_ITEMS).await? {
        if apps.contains_key(app) {
            permissions::forget(connection, KEYRING_ITEMS, &item, app).await?;
        }
    }
    Ok(())
}
