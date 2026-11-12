use std::fs::OpenOptions;
use std::os::unix::fs::OpenOptionsExt;

use luft_app::dbus::{self, service::Service};
use serde::Deserialize;
use zbus::Fd;

use super::{ExtensionTarget, request};

const PACKAGES: Service = Service {
    name: "com.lantharos.Packages1",
    path: "/com/lantharos/Packages1",
    interface: "com.lantharos.Packages1",
};

#[derive(Deserialize, specta::Type)]
pub struct UnreviewedExtension {
    id: String,
    path: String,
}

async fn ask<B>(method: &str, id: String, body: &B) -> Result<(), String>
where
    B: serde::Serialize + zbus::DynamicType,
{
    PACKAGES
        .change::<_, ()>(method, body)
        .await
        .map_err(|error| dbus::explain(&error))?;
    request("Reload", ExtensionTarget { id }).await
}

/// Has the system copy the extension's folder as it is now to where only it
/// can change it, to run inside Luft. Asks for the person's password.
pub async fn install_copy(
    UnreviewedExtension { id, path }: UnreviewedExtension,
) -> Result<(), String> {
    let folder = OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_DIRECTORY | libc::O_NOFOLLOW)
        .open(&path)
        .map_err(|error| error.to_string())?;
    ask(
        "InstallUnreviewedExtension",
        id.clone(),
        &(id.as_str(), Fd::from(&folder)),
    )
    .await
}

/// Has the system let the extension run inside Luft from its folder, as it
/// changes. Asks for the person's password.
pub async fn run_from_folder(
    UnreviewedExtension { id, path }: UnreviewedExtension,
) -> Result<(), String> {
    ask(
        "AllowExtensionFolder",
        id.clone(),
        &(id.as_str(), path.as_str()),
    )
    .await
}

/// Takes away the extension's copy and the approval of its folder, which
/// needs no password.
pub async fn stop(ExtensionTarget { id }: ExtensionTarget) -> Result<(), String> {
    ask("RemoveUnreviewedExtension", id.clone(), &(id.as_str(),)).await
}
