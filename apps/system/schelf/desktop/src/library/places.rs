use luft_app::dbus;
use luft_app::portal::{FileChooser, uri_path};
use luft_software::apps::flatpak;
use luft_software::apps::places::{self, Access, DriveTarget, GivenDrive, PluggedDrive};
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Deserialize, Type)]
pub struct App {
    id: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GivenFolder {
    path: String,
    read_only: bool,
}

/// The drives and folders an app was given beyond its sandbox.
#[derive(Serialize, Type)]
pub struct Places {
    drives: Vec<GivenDrive>,
    folders: Vec<GivenFolder>,
}

#[derive(Deserialize, Type)]
pub struct Folder {
    id: String,
    folder: String,
}

/// Whether an AppImage is open now, so Schelf can offer to restart it.
/// Flatpak apps keep running as they started until you open them again.
fn running(id: &str) -> Result<bool, String> {
    if flatpak::is_installed(id) {
        Ok(false)
    } else {
        luft_sandbox::running(id)
    }
}

pub async fn given(App { id }: App) -> Result<Places, String> {
    let connection = dbus::session().await?;
    let mut drives = places::given(connection).await?;
    let folders = places::folders(connection, &id).await?;
    Ok(Places {
        drives: drives.remove(&id).unwrap_or_default(),
        folders: folders
            .into_iter()
            .map(|(path, access)| GivenFolder {
                path,
                read_only: access == Access::ReadOnly,
            })
            .collect(),
    })
}

pub async fn plugged(App { id }: App) -> Result<Vec<PluggedDrive>, String> {
    places::plugged(dbus::session().await?, &id).await
}

/// Gives the app a drive, and says whether it's open, since it sees the
/// drive once it opens again.
pub async fn give_drive(target: DriveTarget) -> Result<bool, String> {
    let id = target.app.clone();
    places::give_chosen(dbus::session().await?, target).await?;
    running(&id)
}

pub async fn take_drive(target: DriveTarget) -> Result<(), String> {
    places::take_chosen(dbus::session().await?, target).await
}

/// Gives the app a folder you pick, and says whether it's open.
pub async fn add_folder(App { id }: App) -> Result<Option<bool>, String> {
    let chooser = FileChooser {
        title: "Choose a folder",
        directory: true,
        ..FileChooser::default()
    };
    let Some(folder) = chooser.open().await?.first().and_then(|uri| uri_path(uri)) else {
        return Ok(None);
    };
    places::give_folder(
        dbus::session().await?,
        &id,
        &folder.to_string_lossy(),
        Access::ReadWrite,
    )
    .await?;
    running(&id).map(Some)
}

pub async fn remove_folder(Folder { id, folder }: Folder) -> Result<(), String> {
    places::take_folder(dbus::session().await?, &id, &folder).await
}
