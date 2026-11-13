use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Connection;

use super::{Access, Answer, Drive, Known, everything, held, mounted};

/// A drive an app was given, plugged in or not.
#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct GivenDrive {
    uuid: String,
    drive: String,
    label: String,
    size: f64,
    read_only: bool,
    plugged_in: bool,
}

/// A drive plugged in now that an app could be given.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PluggedDrive {
    uuid: String,
    drive: String,
    label: String,
    size: f64,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DriveTarget {
    pub app: String,
    pub uuid: String,
    pub drive: String,
    #[serde(default)]
    pub read_only: bool,
}

/// The drives each app was given, as Settings and Schelf show them.
pub async fn given(connection: &Connection) -> Result<HashMap<String, Vec<GivenDrive>>, String> {
    let (everything, mounted) = futures_util::join!(everything(connection), mounted());
    let mounted = mounted.unwrap_or_default();
    let mut given: HashMap<String, Vec<GivenDrive>> = HashMap::new();
    for (known, answers) in everything? {
        let plugged_in = mounted.iter().any(|drive| known.is(drive));
        for (app, answer) in answers {
            let Answer::Given(access) = answer else {
                continue;
            };
            given.entry(app).or_default().push(GivenDrive {
                uuid: known.uuid.clone(),
                drive: known.drive.clone(),
                label: known.label.clone(),
                size: known.size as f64,
                read_only: access == Access::ReadOnly,
                plugged_in,
            });
        }
    }
    Ok(given)
}

/// The drives plugged in now that the app doesn't have.
pub async fn plugged(connection: &Connection, app: &str) -> Result<Vec<PluggedDrive>, String> {
    let (held, mounted) = futures_util::try_join!(held(connection, app), mounted())?;
    Ok(mounted
        .into_iter()
        .filter(|drive| {
            !held
                .iter()
                .any(|(known, answer)| known.is(drive) && matches!(answer, Answer::Given(_)))
        })
        .map(|drive| PluggedDrive {
            size: drive.size as f64,
            uuid: drive.uuid,
            drive: drive.drive,
            label: drive.label,
        })
        .collect())
}

fn chosen(mounted: Vec<Drive>, target: &DriveTarget) -> Option<Drive> {
    mounted
        .into_iter()
        .find(|drive| drive.uuid == target.uuid && drive.drive == target.drive)
}

/// Gives the app the drive you picked among those plugged in.
pub async fn give_chosen(connection: &Connection, target: DriveTarget) -> Result<(), String> {
    let drive = chosen(mounted().await?, &target).ok_or("That drive isn't plugged in any more.")?;
    let access = if target.read_only {
        Access::ReadOnly
    } else {
        Access::ReadWrite
    };
    super::give(connection, &target.app, &drive, access).await
}

/// Takes the drive you picked away from the app.
pub async fn take_chosen(connection: &Connection, target: DriveTarget) -> Result<(), String> {
    let known = Known {
        uuid: target.uuid,
        drive: target.drive,
        label: String::new(),
        size: 0,
    };
    super::take(connection, &target.app, &known).await
}
