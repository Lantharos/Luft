//! Brings what a person picked in a file dialog within reach of an app that
//! Sabine holds to its `[sandbox]` declaration, through the document portal,
//! as the desktop portal does itself for an app in a sandbox.

use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::ErrorKind;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use zbus::{Fd, OwnedVariant, Proxy};

use super::{path_uri, uri_path};
use crate::dbus::{self, failed};

const DOCUMENTS: &str = "org.freedesktop.portal.Documents";
const DOCUMENTS_PATH: &str = "/org/freedesktop/portal/documents";
const ROOT: &str = "/";
const SANDBOX_INFO: &str = "/.flatpak-info";
const REUSE_EXISTING: u32 = 1;
const FOLDER: u32 = 8;

#[derive(Clone, Copy)]
pub(super) enum Picked {
    File,
    Folder,
    NewFile,
}

fn denied<T>(opened: &std::io::Result<T>) -> bool {
    matches!(opened, Err(error) if error.kind() == ErrorKind::PermissionDenied)
}

/// Whether Sabine holds this app to its declaration with Landlock, under
/// which not even the root folder opens. An app in a sandbox gets its
/// documents from the desktop portal already.
fn confined() -> bool {
    !Path::new(SANDBOX_INFO).exists() && denied(&File::open(ROOT))
}

/// Whether the app can't use what was picked by itself: read a file, save
/// a new one, or, as far as anyone can tell, save into a folder.
fn unreachable(path: &Path, picked: Picked) -> bool {
    match picked {
        Picked::File => denied(&File::open(path)),
        Picked::Folder => true,
        Picked::NewFile => denied(
            &OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(false)
                .open(path),
        ),
    }
}

fn handle(path: &Path) -> Result<File, String> {
    OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_PATH)
        .open(path)
        .map_err(|error| error.to_string())
}

async fn share(documents: &Proxy<'_>, path: &Path, picked: Picked) -> Result<String, String> {
    if let Picked::NewFile = picked {
        let folder = handle(path.parent().ok_or("The file has no folder")?)?;
        let name = path.file_name().ok_or("The file has no name")?;
        let mut name = name.as_bytes().to_vec();
        name.push(0);
        return documents
            .call("AddNamed", &(Fd::from(&folder), name, true, false))
            .await
            .map_err(failed);
    }
    let shared = handle(path)?;
    let flags = match picked {
        Picked::Folder => REUSE_EXISTING | FOLDER,
        _ => REUSE_EXISTING,
    };
    let (ids, _): (Vec<String>, HashMap<String, OwnedVariant>) = documents
        .call(
            "AddFull",
            &(vec![Fd::from(&shared)], flags, "", Vec::<&str>::new()),
        )
        .await
        .map_err(failed)?;
    ids.into_iter()
        .next()
        .ok_or_else(|| "The document portal shared nothing".to_owned())
}

/// The picked `uris`, with every one the app can't open itself replaced by
/// where the document portal shows it.
pub(super) async fn within_reach(uris: Vec<String>, picked: Picked) -> Result<Vec<String>, String> {
    if !confined() {
        return Ok(uris);
    }
    let mut documents = None;
    let mut reachable = Vec::with_capacity(uris.len());
    for uri in uris {
        let Some(path) = uri_path(&uri).filter(|path| unreachable(path, picked)) else {
            reachable.push(uri);
            continue;
        };
        let (portal, mount) = match &documents {
            Some(found) => found,
            None => documents.insert(open().await?),
        };
        let id = share(portal, &path, picked).await?;
        let name = path.file_name().ok_or("The file has no name")?;
        reachable.push(path_uri(&mount.join(id).join(name)));
    }
    Ok(reachable)
}

async fn open() -> Result<(Proxy<'static>, PathBuf), String> {
    let portal = Proxy::new(dbus::session().await?, DOCUMENTS, DOCUMENTS_PATH, DOCUMENTS)
        .await
        .map_err(failed)?;
    let mount: Vec<u8> = portal.call("GetMountPoint", &()).await.map_err(failed)?;
    let mount = mount.strip_suffix(&[0]).unwrap_or(&mount);
    Ok((portal, PathBuf::from(std::ffi::OsStr::from_bytes(mount))))
}
