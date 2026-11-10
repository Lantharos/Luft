use std::ffi::OsStr;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};

use luft_dbus::service::Service;
use serde::Serialize;
use zbus::DynamicType;
use zbus::wire::DynamicDeserialize;

pub const NAME: &str = "com.lantharos.Files1";
pub const PATH: &str = "/com/lantharos/Files1";

const FILES: Service = Service {
    name: NAME,
    path: PATH,
    interface: NAME,
};

/// A running process and the clock tick it started on, which tells it apart
/// from a later process that got the same number.
pub type Process = (u32, u64);

/// Where a trashed item went: the item itself and the note about where it
/// came from.
pub struct Trashed {
    pub file: PathBuf,
    pub info: PathBuf,
}

pub async fn copy(source: &Path, target: &Path) -> Result<(), String> {
    call("Copy", &(named(source), named(target))).await
}

pub async fn move_to(source: &Path, target: &Path) -> Result<(), String> {
    call("Move", &(named(source), named(target))).await
}

pub async fn delete(path: &Path) -> Result<(), String> {
    call("Delete", &(named(path),)).await
}

/// Moves an item to the trash of the person asking, not the administrator's.
pub async fn trash(path: &Path) -> Result<Trashed, String> {
    let (file, info): (Vec<u8>, Vec<u8>) = call("Trash", &(named(path),)).await?;
    let path = |bytes: Vec<u8>| PathBuf::from(OsStr::from_bytes(&bytes));
    Ok(Trashed {
        file: path(file),
        info: path(info),
    })
}

/// Makes a folder and the folders above it that are missing. Answers whether
/// the folder is new.
pub async fn make_folder(path: &Path) -> Result<bool, String> {
    call("MakeFolder", &(named(path),)).await
}

pub async fn make_file(path: &Path) -> Result<(), String> {
    call("MakeFile", &(named(path),)).await
}

pub async fn signal(processes: &[Process], signal: i32) -> Result<(), String> {
    call("Signal", &(processes, signal)).await
}

pub async fn set_priority(process: Process, nice: i32) -> Result<(), String> {
    call("SetPriority", &(process, nice)).await
}

async fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    FILES
        .change(method, body)
        .await
        .map_err(|error| luft_dbus::explain(&error))
}

fn named(path: &Path) -> Vec<u8> {
    let (known, rest) = path
        .ancestors()
        .skip(1)
        .find_map(|ancestor| Some((ancestor.canonicalize().ok()?, ancestor)))
        .and_then(|(known, ancestor)| Some((known, path.strip_prefix(ancestor).ok()?)))
        .unwrap_or((PathBuf::new(), path));
    known.join(rest).into_os_string().into_encoded_bytes()
}
