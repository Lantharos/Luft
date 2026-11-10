use std::collections::HashMap;
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use futures_util::StreamExt;
use serde::Serialize;
use zbus::zvariant::DynamicType;
use zbus::{MessageStream, OwnedObjectPath, OwnedVariant, Proxy, Variant};

use crate::dbus::{self, failed};

pub(crate) const PORTAL: &str = "org.freedesktop.portal.Desktop";
pub(crate) const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const OPEN_URI: &str = "org.freedesktop.portal.OpenURI";
const FILE_SCHEME: &str = "file://";

static TOKENS: AtomicU32 = AtomicU32::new(0);

/// A handle token no other request or session of this app has.
pub(crate) fn token() -> String {
    format!(
        "luft{}_{}",
        std::process::id(),
        TOKENS.fetch_add(1, Ordering::Relaxed)
    )
}

#[derive(PartialEq)]
pub(crate) enum Response {
    Answered,
    Cancelled,
    Ended,
}

impl From<u32> for Response {
    fn from(code: u32) -> Self {
        match code {
            0 => Self::Answered,
            1 => Self::Cancelled,
            _ => Self::Ended,
        }
    }
}

pub struct Filter<'a> {
    pub name: &'a str,
    pub patterns: Vec<String>,
}

#[derive(Default)]
pub struct FileChooser<'a> {
    pub title: &'a str,
    pub filters: Vec<Filter<'a>>,
    pub multiple: bool,
    pub directory: bool,
    pub current_name: Option<&'a str>,
    pub current_folder: Option<&'a Path>,
}

impl FileChooser<'_> {
    pub async fn open(&self) -> Result<Vec<String>, String> {
        self.request("OpenFile").await
    }

    pub async fn save(&self) -> Result<Option<String>, String> {
        Ok(self.request("SaveFile").await?.into_iter().next())
    }

    fn options(&self, token: &str) -> HashMap<&'static str, Variant<'_>> {
        let mut options = HashMap::new();
        options.insert("handle_token", Variant::from(token.to_owned()));
        options.insert("multiple", Variant::from(self.multiple));
        options.insert("directory", Variant::from(self.directory));
        if !self.filters.is_empty() {
            let filters: Vec<(&str, Vec<(u32, String)>)> = self
                .filters
                .iter()
                .map(|filter| {
                    let patterns = filter
                        .patterns
                        .iter()
                        .map(|pattern| (0, pattern.clone()))
                        .collect();
                    (filter.name, patterns)
                })
                .collect();
            options.insert("filters", Variant::from(filters));
        }
        if let Some(name) = self.current_name {
            options.insert("current_name", Variant::from(name));
        }
        if let Some(folder) = self.current_folder {
            let mut bytes = folder.as_os_str().as_bytes().to_vec();
            bytes.push(0);
            options.insert("current_folder", Variant::from(bytes));
        }
        options
    }

    async fn request(&self, method: &str) -> Result<Vec<String>, String> {
        let (response, results) = request("org.freedesktop.portal.FileChooser", method, |token| {
            ("", self.title, self.options(&token))
        })
        .await?;
        if response != Response::Answered {
            return Ok(Vec::new());
        }
        Ok(results
            .get("uris")
            .cloned()
            .map(Vec::<String>::try_from)
            .transpose()
            .map_err(failed)?
            .unwrap_or_default())
    }
}

pub(crate) async fn request<B>(
    interface: &str,
    method: &str,
    body: impl FnOnce(String) -> B,
) -> Result<(Response, HashMap<String, OwnedVariant>), String>
where
    B: Serialize + DynamicType,
{
    let connection = dbus::session().await?;
    let portal = Proxy::new(connection, PORTAL, PORTAL_PATH, interface)
        .await
        .map_err(failed)?;
    let token = token();
    let sender = connection
        .unique_name()
        .ok_or("Not connected to the session bus")?
        .trim_start_matches(':')
        .replace('.', "_");
    let handle = format!("{PORTAL_PATH}/request/{sender}/{token}");
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .interface("org.freedesktop.portal.Request")
        .member("Response")
        .path(handle.as_str())
        .build()
        .map_err(failed)?;
    let mut responses = MessageStream::for_match_rule(rule, connection, None)
        .await
        .map_err(failed)?;
    let _: OwnedObjectPath = portal.call(method, &body(token)).await.map_err(failed)?;
    let message = responses
        .next()
        .await
        .ok_or("The portal closed")?
        .map_err(failed)?;
    let (response, results): (u32, HashMap<String, OwnedVariant>) =
        message.body().deserialize().map_err(failed)?;
    Ok((response.into(), results))
}

pub async fn open_file(title: &str, filter: Filter<'_>) -> Result<Option<String>, String> {
    Ok(FileChooser {
        title,
        filters: vec![filter],
        ..FileChooser::default()
    }
    .open()
    .await?
    .into_iter()
    .next())
}

pub async fn open_files(title: &str, filter: Filter<'_>) -> Result<Vec<String>, String> {
    FileChooser {
        title,
        filters: vec![filter],
        multiple: true,
        ..FileChooser::default()
    }
    .open()
    .await
}

/// Asks to use the camera and opens a PipeWire connection that sees only
/// cameras, or `None` when the person said no.
pub async fn camera() -> Result<Option<zbus::OwnedFd>, String> {
    let (response, _) = request("org.freedesktop.portal.Camera", "AccessCamera", |token| {
        (HashMap::from([("handle_token", Variant::from(token))]),)
    })
    .await?;
    if response != Response::Answered {
        return Ok(None);
    }
    let portal = Proxy::new(
        dbus::session().await?,
        PORTAL,
        PORTAL_PATH,
        "org.freedesktop.portal.Camera",
    )
    .await
    .map_err(failed)?;
    let options: HashMap<&str, Variant<'_>> = HashMap::new();
    portal
        .call("OpenPipeWireRemote", &(options,))
        .await
        .map(Some)
        .map_err(failed)
}

/// Shows a file in the file manager, through the portal, which finds it
/// outside a sandbox too.
pub async fn reveal(path: &Path, token: Option<&str>) -> Result<(), String> {
    let file = std::fs::File::open(path).map_err(|error| error.to_string())?;
    request(OPEN_URI, "OpenDirectory", |handle| {
        let mut options = HashMap::from([("handle_token", Variant::from(handle))]);
        if let Some(token) = token {
            options.insert("activation_token", Variant::from(token.to_owned()));
        }
        ("", zbus::Fd::from(&file), options)
    })
    .await
    .map(drop)
}

async fn open_uri_portal() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, PORTAL, PORTAL_PATH, OPEN_URI)
        .await
        .map_err(failed)
}

fn activation(token: Option<&str>) -> HashMap<&'static str, Variant<'_>> {
    token
        .map(|token| ("activation_token", Variant::from(token)))
        .into_iter()
        .collect()
}

/// Opens `uri` in the person's default app for it, which the portal starts
/// outside this app's sandbox.
pub async fn open_uri(uri: &str, token: Option<&str>) -> Result<(), String> {
    if let Some(path) = uri_path(uri) {
        return open_path(&path, token).await;
    }
    open_uri_portal()
        .await?
        .call::<_, _, OwnedObjectPath>("OpenURI", &("", uri, activation(token)))
        .await
        .map(drop)
        .map_err(failed)
}

/// Opens a web or mail link from a page in the person's default app for it.
pub async fn open_web_link(uri: &str, token: Option<&str>) -> Result<(), String> {
    if !crate::launch::is_web_link(uri) {
        return Err("Only web and mail links open in other apps".to_owned());
    }
    open_uri(uri, token).await
}

/// Opens the file or folder at `path` in the person's default app for it.
pub async fn open_path(path: &Path, token: Option<&str>) -> Result<(), String> {
    let file = std::fs::File::open(path).map_err(|error| error.to_string())?;
    open_uri_portal()
        .await?
        .call::<_, _, OwnedObjectPath>("OpenFile", &("", zbus::Fd::from(&file), activation(token)))
        .await
        .map(drop)
        .map_err(failed)
}

pub fn path_uri(path: &Path) -> String {
    let mut uri = String::from(FILE_SCHEME);
    for &byte in path.as_os_str().as_bytes() {
        if byte.is_ascii_alphanumeric() || b"-._~/".contains(&byte) {
            uri.push(char::from(byte));
        } else {
            uri.push_str(&format!("%{byte:02X}"));
        }
    }
    uri
}

pub fn uri_path(uri: &str) -> Option<PathBuf> {
    let encoded = uri.strip_prefix(FILE_SCHEME)?.as_bytes();
    let mut bytes = Vec::with_capacity(encoded.len());
    let mut index = 0;
    while index < encoded.len() {
        let hex = encoded
            .get(index + 1..index + 3)
            .and_then(|digits| std::str::from_utf8(digits).ok())
            .and_then(|digits| u8::from_str_radix(digits, 16).ok());
        match (encoded[index], hex) {
            (b'%', Some(byte)) => {
                bytes.push(byte);
                index += 3;
            }
            (byte, _) => {
                bytes.push(byte);
                index += 1;
            }
        }
    }
    Some(PathBuf::from(std::ffi::OsString::from_vec(bytes)))
}
