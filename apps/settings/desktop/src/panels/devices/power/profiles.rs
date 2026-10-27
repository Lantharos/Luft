use std::collections::HashMap;

use serde::Serialize;
use specta::Type;
use zbus::{Connection, OwnedVariant, Variant};

use super::properties::{self, Properties};

const DESTINATION: &str = "org.freedesktop.UPower.PowerProfiles";
const PATH: &str = "/org/freedesktop/UPower/PowerProfiles";

#[derive(Serialize, Type)]
pub struct Profiles {
    active: String,
    available: Vec<String>,
    degraded: Vec<String>,
}

pub async fn read(connection: &Connection) -> Result<Profiles, String> {
    let properties = Properties::read(connection, DESTINATION, PATH, DESTINATION).await?;
    let available = properties
        .owned("Profiles")
        .and_then(|profiles| Vec::<HashMap<String, OwnedVariant>>::try_from(profiles).ok())
        .unwrap_or_default()
        .iter()
        .filter_map(|profile| profile.get("Profile")?.downcast_ref::<String>().ok())
        .collect();
    Ok(Profiles {
        active: properties
            .get::<String>("ActiveProfile")
            .unwrap_or_default(),
        available,
        degraded: properties
            .get::<&str>("PerformanceDegraded")
            .unwrap_or_default()
            .split(',')
            .map(str::trim)
            .filter(|reason| !reason.is_empty())
            .map(str::to_owned)
            .collect(),
    })
}

pub async fn set(connection: &Connection, profile: &str) -> Result<(), String> {
    properties::set(
        connection,
        DESTINATION,
        PATH,
        DESTINATION,
        "ActiveProfile",
        Variant::from(profile),
    )
    .await
}
