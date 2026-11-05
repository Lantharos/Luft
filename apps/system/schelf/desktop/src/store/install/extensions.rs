use std::fs::{self, File};
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use luft_app::{block_on, dbus};
use luft_dbus_macros::introspect;
use luft_software::progress::Stage;
use luft_software::task::Task;
use zbus::proxy;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Extensions",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Extensions"
)]
trait Extensions {
    fn reload(&self, id: &str) -> zbus::Result<()>;

    fn disable(&self, id: &str) -> zbus::Result<()>;

    fn remove(&self, id: &str) -> zbus::Result<()>;

    #[zbus(property)]
    fn api_versions(&self) -> zbus::Result<Vec<u32>>;
}

fn folder() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("luft/extensions")
}

fn failed(error: impl ToString) -> String {
    error.to_string()
}

async fn desktop() -> Result<ExtensionsProxy<'static>, String> {
    ExtensionsProxy::new(dbus::session().await?)
        .await
        .map_err(|error| dbus::explain(&error))
}

/// Has the desktop load the extension's folder again, after it changed. A
/// desktop that isn't running finds it when it starts.
fn reload(id: &str) {
    let _ = block_on(async { desktop().await?.reload(id).await.map_err(failed) });
}

/// The extension API versions the desktop runs; none when it can't be asked.
pub fn api_versions() -> &'static [u32] {
    static VERSIONS: OnceLock<Vec<u32>> = OnceLock::new();
    VERSIONS.get_or_init(|| {
        block_on(async { desktop().await?.api_versions().await.map_err(failed) })
            .unwrap_or_default()
    })
}

/// The extension's own folder inside what was unpacked: the archive holds
/// either its contents or the folder itself.
fn root(unpacked: &Path) -> Result<PathBuf, String> {
    let entries: Vec<PathBuf> = fs::read_dir(unpacked)
        .map_err(failed)?
        .map(|entry| entry.map(|entry| entry.path()))
        .collect::<Result<_, _>>()
        .map_err(failed)?;
    match entries.as_slice() {
        [only] if only.is_dir() => Ok(only.clone()),
        _ => Ok(unpacked.to_path_buf()),
    }
}

/// Unpacks the extension into `~/.local/share/luft/extensions/ID` in place of
/// any earlier version, and has the desktop load it.
pub fn install(id: &str, archive: &Path, task: Task) -> Result<String, String> {
    task.progress(Stage::Installing, None);
    let extensions = folder();
    let staging = extensions.join(format!(".{id}.unpacking"));
    let _ = fs::remove_dir_all(&staging);
    fs::create_dir_all(&staging).map_err(failed)?;
    let unpacked = zstd::Decoder::new(File::open(archive).map_err(failed)?)
        .map(tar::Archive::new)
        .and_then(|mut contents| {
            contents.set_preserve_permissions(false);
            contents.set_unpack_xattrs(false);
            contents.unpack(&staging)
        });
    if let Err(error) = unpacked {
        let _ = fs::remove_dir_all(&staging);
        return Err(format!("The extension couldn't be unpacked: {error}"));
    }
    let destination = extensions.join(id);
    let previous = extensions.join(format!(".{id}.previous"));
    let _ = fs::remove_dir_all(&previous);
    if destination.exists() {
        fs::rename(&destination, &previous).map_err(failed)?;
    }
    fs::rename(root(&staging)?, &destination).map_err(failed)?;
    let _ = fs::remove_dir_all(&staging);
    let _ = fs::remove_dir_all(&previous);
    reload(id);
    Ok(id.to_owned())
}

/// Turns off an extension schelf.store pulled, keeping its files.
pub async fn disable(id: &str) -> Result<(), String> {
    desktop().await?.disable(id).await.map_err(failed)
}

/// Takes the extension off the desktop with what it saved, or removes its
/// folder when the desktop isn't running.
pub fn remove(id: &str) -> Result<(), String> {
    if block_on(async { desktop().await?.remove(id).await.map_err(failed) }).is_ok() {
        return Ok(());
    }
    let destination = folder().join(id);
    if destination.exists() {
        fs::remove_dir_all(destination).map_err(failed)?;
    }
    Ok(())
}
