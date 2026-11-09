use std::fs::File;
use std::path::Path;

use zbus::{Fd, Proxy};

use crate::dbus::{self, failed};

const KESTREL: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Share";
const INTERFACE: &str = "com.lantharos.Kestrel.Share";

/// Opens Kestrel's Send sheet for files the app holds, where people choose
/// a device nearby or another app for them. The app hands over the open
/// files, so it works from a sandbox, and it returns once the sheet closes.
/// Kestrel only opens it while one of the app's windows is in front.
pub async fn send(paths: &[impl AsRef<Path>]) -> Result<(), String> {
    let files = paths
        .iter()
        .map(|path| {
            let path = path.as_ref();
            let name = path
                .file_name()
                .ok_or_else(|| format!("{} isn't a file", path.display()))?
                .to_string_lossy()
                .into_owned();
            File::open(path)
                .map(|file| (name, file))
                .map_err(|error| format!("{}: {error}", path.display()))
        })
        .collect::<Result<Vec<_>, String>>()?;
    let handed: Vec<(&str, Fd<'_>)> = files
        .iter()
        .map(|(name, file)| (name.as_str(), Fd::from(file)))
        .collect();
    Proxy::new(dbus::session().await?, KESTREL, PATH, INTERFACE)
        .await
        .map_err(failed)?
        .call::<_, _, ()>("Send", &(handed,))
        .await
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(reason), _) => reason,
            error => failed(error),
        })
}
