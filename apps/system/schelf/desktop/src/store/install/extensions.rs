use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use luft_app::{block_on, dbus};
use luft_dbus_macros::introspect;
use luft_software::progress::Stage;
use luft_software::system::store_extensions::{self, Signed};
use luft_software::task::Task;
use zbus::proxy;

use crate::store::signed::{self, Sealed};

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

    #[zbus(property)]
    fn sandbox_leaves_out(&self) -> zbus::Result<Vec<String>>;
}

fn folder() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join("luft/extensions")
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

/// The parts of the extension API the desktop leaves out of an extension it
/// runs in a sandbox; none when it can't be asked.
pub fn sandbox_leaves_out() -> &'static [String] {
    static LEFT_OUT: OnceLock<Vec<String>> = OnceLock::new();
    LEFT_OUT.get_or_init(|| {
        block_on(async { desktop().await?.sandbox_leaves_out().await.map_err(failed) })
            .unwrap_or_default()
    })
}

fn signed_by_store(document: &Sealed) -> Signed<'_> {
    Signed {
        body: &document.body,
        seal: &document.seal,
    }
}

/// Has the system install the extension for this account, where the
/// account's own programs can't change it, once it confirmed schelf.store's
/// signature: with the extensions that run inside Luft when the store
/// approved this release to, otherwise with the ones that run in a sandbox.
/// Then has the desktop load it. A copy an earlier Luft unpacked into the
/// account's own folder goes. `document` is the listing it was chosen from.
pub fn install(id: &str, document: &str, archive: &Path, task: Task) -> Result<String, String> {
    task.progress(Stage::Installing, None);
    let listing = signed::sealed(document)?;
    let keys = signed::sealed(luft_store_seal::STORE_KEYS)?;
    block_on(store_extensions::install(
        id,
        signed_by_store(&listing),
        signed_by_store(&keys),
        archive,
    ))?;
    remove_own_copy(id)?;
    reload(id);
    Ok(id.to_owned())
}

/// Removes the copy of an extension in the account's own folder, which Luft
/// no longer runs inside the desktop.
fn remove_own_copy(id: &str) -> Result<(), String> {
    let own = folder().join(id);
    if own.exists() {
        fs::remove_dir_all(own).map_err(failed)?;
    }
    Ok(())
}

/// Turns off an extension schelf.store pulled, keeping its files.
pub async fn disable(id: &str) -> Result<(), String> {
    desktop().await?.disable(id).await.map_err(failed)
}

/// Takes the extension off the desktop with what it saved, or removes it
/// when the desktop isn't running.
pub fn remove(id: &str) -> Result<(), String> {
    if block_on(async { desktop().await?.remove(id).await.map_err(failed) }).is_ok() {
        return Ok(());
    }
    block_on(store_extensions::remove(id))?;
    remove_own_copy(id)
}
