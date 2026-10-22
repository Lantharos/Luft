use std::collections::HashMap;
use std::ffi::CString;
use std::os::fd::{FromRawFd, OwnedFd};
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};

use luft_software::apps::appimage::{FILES, URIS};
use zbus::{Connection, Fd, OwnedVariant, proxy};

const FILE_SCHEME: &str = "file://";
const REUSE_EXISTING: u32 = 1;
const PERMISSIONS: [&str; 3] = ["read", "write", "grant-permissions"];

#[proxy(
    interface = "org.freedesktop.portal.Documents",
    default_service = "org.freedesktop.portal.Documents",
    default_path = "/org/freedesktop/portal/documents"
)]
trait Documents {
    fn add_full(
        &self,
        files: &[Fd<'_>],
        flags: u32,
        app_id: &str,
        permissions: &[&str],
    ) -> zbus::Result<(Vec<String>, HashMap<String, OwnedVariant>)>;

    fn get_mount_point(&self) -> zbus::Result<Vec<u8>>;
}

enum Marked {
    Plain(String),
    Path(PathBuf),
    Uri(PathBuf),
}

fn decode(uri: &str) -> Option<PathBuf> {
    let encoded = uri.strip_prefix(FILE_SCHEME)?;
    let mut bytes = Vec::with_capacity(encoded.len());
    let mut rest = encoded.as_bytes();
    while let Some((&byte, tail)) = rest.split_first() {
        if byte == b'%' && tail.len() >= 2 {
            let hex = std::str::from_utf8(&tail[..2]).ok()?;
            bytes.push(u8::from_str_radix(hex, 16).ok()?);
            rest = &tail[2..];
        } else {
            bytes.push(byte);
            rest = tail;
        }
    }
    Some(PathBuf::from(std::ffi::OsStr::from_bytes(&bytes)))
}

fn encode(path: &Path) -> String {
    let mut uri = FILE_SCHEME.to_owned();
    for &byte in path.as_os_str().as_bytes() {
        if byte.is_ascii_alphanumeric() || b"/-._~".contains(&byte) {
            uri.push(byte as char);
        } else {
            uri.push_str(&format!("%{byte:02X}"));
        }
    }
    uri
}

fn classify(arguments: Vec<String>) -> Vec<Marked> {
    let mut marked = Vec::with_capacity(arguments.len());
    let mut inside = None;
    for argument in arguments {
        match (argument.as_str(), inside) {
            (FILES, None) => inside = Some(false),
            (URIS, None) => inside = Some(true),
            (FILES, Some(_)) => inside = None,
            (_, Some(false)) => marked.push(Marked::Path(PathBuf::from(argument))),
            (_, Some(true)) => match decode(&argument) {
                Some(path) => marked.push(Marked::Uri(path)),
                None => marked.push(Marked::Plain(argument)),
            },
            (_, None) => marked.push(Marked::Plain(argument)),
        }
    }
    marked
}

/// The arguments as they were given, for an app that sees your files anyway.
pub fn unmarked(arguments: Vec<String>) -> Vec<String> {
    arguments
        .into_iter()
        .filter(|argument| argument != FILES && argument != URIS)
        .collect()
}

fn open_path(path: &Path) -> Option<OwnedFd> {
    let path = CString::new(path.as_os_str().as_bytes()).ok()?;
    let fd = unsafe { libc::open(path.as_ptr(), libc::O_PATH | libc::O_CLOEXEC) };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}

/// Where the document portal shows shared files, starting it if it isn't
/// running yet so the sandbox can show the app its own share of them.
pub async fn mount_point(connection: &Connection) -> Option<PathBuf> {
    let mount = DocumentsProxy::new(connection)
        .await
        .ok()?
        .get_mount_point()
        .await
        .ok()?;
    Some(PathBuf::from(std::ffi::OsStr::from_bytes(
        mount.strip_suffix(&[0]).unwrap_or(&mount),
    )))
}

/// Shares the files the app was opened with through the document portal and
/// rewrites their paths to where the app finds them in its sandbox.
pub async fn forward(
    connection: &Connection,
    id: &str,
    arguments: Vec<String>,
) -> Result<Vec<String>, String> {
    let marked = classify(arguments);
    let paths: Vec<PathBuf> = marked
        .iter()
        .filter_map(|argument| match argument {
            Marked::Path(path) | Marked::Uri(path) => Some(path.clone()),
            Marked::Plain(_) => None,
        })
        .collect();
    if paths.is_empty() {
        return Ok(marked
            .into_iter()
            .filter_map(|argument| match argument {
                Marked::Plain(argument) => Some(argument),
                _ => None,
            })
            .collect());
    }
    let fds: Vec<OwnedFd> = paths
        .iter()
        .map(|path| open_path(path).ok_or_else(|| format!("{} can't be opened", path.display())))
        .collect::<Result<_, _>>()?;
    let documents = DocumentsProxy::new(connection)
        .await
        .map_err(|error| error.to_string())?;
    let borrowed: Vec<Fd<'_>> = fds.iter().map(Fd::from).collect();
    let (ids, _) = documents
        .add_full(&borrowed, REUSE_EXISTING, id, &PERMISSIONS)
        .await
        .map_err(|error| error.to_string())?;
    let mount = mount_point(connection)
        .await
        .ok_or("The document portal isn't running.")?;
    let mut shared = ids.iter().zip(&paths).map(|(document, path)| {
        mount
            .join(document)
            .join(path.file_name().unwrap_or_default())
    });
    Ok(marked
        .into_iter()
        .filter_map(|argument| match argument {
            Marked::Plain(argument) => Some(argument),
            Marked::Path(_) => shared.next().map(|path| path.display().to_string()),
            Marked::Uri(_) => shared.next().map(|path| encode(&path)),
        })
        .collect())
}
