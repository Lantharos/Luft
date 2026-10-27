use std::collections::HashMap;

use luft_app::identity::permissions::{self, BACKGROUND_CLIPBOARD, StoreProxy, YES};
use serde::Deserialize;
use specta::Type;
use zbus::Connection;

const NO_LOCATION: &str = "NONE";
const EXACT_LOCATION: &str = "EXACT";
const NEVER_USED: &str = "0";

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
pub enum Switch {
    Location,
    Camera,
    Clipboard,
}

pub const SWITCHES: [Switch; 3] = [Switch::Location, Switch::Camera, Switch::Clipboard];

impl Switch {
    pub fn entry(self) -> (&'static str, &'static str) {
        match self {
            Self::Location => ("location", "location"),
            Self::Camera => ("devices", "camera"),
            Self::Clipboard => (BACKGROUND_CLIPBOARD.table, BACKGROUND_CLIPBOARD.id),
        }
    }

    fn allows(self, answer: &[String]) -> Option<bool> {
        let first = answer.first().map(String::as_str)?;
        Some(match self {
            Self::Location => first != NO_LOCATION,
            Self::Camera | Self::Clipboard => first == YES,
        })
    }

    /// Each app's answer, for the apps that have one.
    pub async fn answers(self, connection: &Connection) -> zbus::Result<HashMap<String, bool>> {
        let (table, id) = self.entry();
        Ok(permissions::lookup(connection, table, id)
            .await?
            .into_iter()
            .filter(|(app, _)| !app.is_empty())
            .filter_map(|(app, answer)| Some((app, self.allows(&answer)?)))
            .collect())
    }
}

pub async fn set(
    connection: &Connection,
    switch: Switch,
    app: &str,
    allowed: bool,
) -> zbus::Result<()> {
    let (table, id) = switch.entry();
    let Switch::Location = switch else {
        return permissions::set(connection, table, id, app, allowed).await;
    };
    let previous = permissions::lookup(connection, table, id)
        .await?
        .remove(app)
        .unwrap_or_default();
    let level = if allowed { EXACT_LOCATION } else { NO_LOCATION };
    let last_used = previous.get(1).map_or(NEVER_USED, String::as_str);
    StoreProxy::new(connection)
        .await?
        .set_permission(table, true, id, app, &[level, last_used])
        .await
}
