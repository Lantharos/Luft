use luft_app::apps::App;
use luft_app::identity::permissions::{
    self, BACKGROUND_CLIPBOARD, FULL_ACCESS, NO, StoreProxy, YES,
};
use serde::{Deserialize, Serialize};
use zbus::Connection;

use super::{identify, known, sort};

const PASSWORD_MANAGERS: [&str; 3] = [
    "com.onepassword.OnePassword",
    "org.keepassxc.KeePassXC",
    "com.bitwarden.desktop",
];
const NO_LOCATION: &str = "NONE";
const EXACT_LOCATION: &str = "EXACT";
const NEVER_USED: &str = "0";

#[derive(Serialize)]
pub struct Grant {
    #[serde(flatten)]
    app: App,
    allowed: bool,
}

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum Switch {
    Location,
    Camera,
    Clipboard,
}

impl Switch {
    pub fn entry(self) -> (&'static str, &'static str) {
        match self {
            Self::Location => ("location", "location"),
            Self::Camera => ("devices", "camera"),
            Self::Clipboard => (BACKGROUND_CLIPBOARD.table, BACKGROUND_CLIPBOARD.id),
        }
    }

    fn allows(self, app: &str, answer: &[String]) -> bool {
        let first = answer.first().map(String::as_str);
        match self {
            Self::Location => first.is_some_and(|level| level != NO_LOCATION),
            Self::Clipboard if PASSWORD_MANAGERS.contains(&app) => first != Some(NO),
            Self::Camera | Self::Clipboard => first == Some(YES),
        }
    }

    fn allowed_by_default(self) -> &'static [&'static str] {
        match self {
            Self::Clipboard => &PASSWORD_MANAGERS,
            Self::Location | Self::Camera => &[],
        }
    }
}

pub async fn list(connection: &Connection, switch: Switch) -> zbus::Result<Vec<Grant>> {
    let (table, id) = switch.entry();
    let answers = permissions::lookup(connection, table, id).await?;
    let unanswered: Vec<Grant> = switch
        .allowed_by_default()
        .iter()
        .filter(|app| !answers.contains_key(**app))
        .filter_map(|app| known(app))
        .map(|app| Grant { app, allowed: true })
        .collect();
    let mut grants: Vec<Grant> = answers
        .into_iter()
        .filter(|(app, _)| !app.is_empty())
        .map(|(app, answer)| Grant {
            allowed: switch.allows(&app, &answer),
            app: identify(app),
        })
        .chain(unanswered)
        .collect();
    sort(&mut grants, |grant| &grant.app);
    Ok(grants)
}

pub async fn full_access(connection: &Connection) -> zbus::Result<Vec<App>> {
    let mut apps: Vec<App> = permissions::lookup(connection, FULL_ACCESS.table, FULL_ACCESS.id)
        .await?
        .into_iter()
        .filter(|(_, answer)| answer.first().map(String::as_str) == Some(YES))
        .map(|(app, _)| identify(app))
        .collect();
    sort(&mut apps, |app| app);
    Ok(apps)
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
