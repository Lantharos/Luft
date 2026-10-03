use std::collections::HashMap;
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};

use zbus::blocking::{MessageIterator, Proxy};
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};

use crate::dbus;

const PORTAL: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const FILE_SCHEME: &str = "file://";

static REQUESTS: AtomicU32 = AtomicU32::new(0);

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

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

impl FileChooser<'_> {
    pub fn open(&self) -> Result<Vec<String>, String> {
        self.request("OpenFile")
    }

    pub fn save(&self) -> Result<Option<String>, String> {
        Ok(self.request("SaveFile")?.into_iter().next())
    }

    fn options(&self, token: &str) -> HashMap<&'static str, Value<'_>> {
        let mut options = HashMap::new();
        options.insert("handle_token", Value::from(token.to_owned()));
        options.insert("multiple", Value::from(self.multiple));
        options.insert("directory", Value::from(self.directory));
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
            options.insert("filters", Value::from(filters));
        }
        if let Some(name) = self.current_name {
            options.insert("current_name", Value::from(name));
        }
        if let Some(folder) = self.current_folder {
            let mut bytes = folder.as_os_str().as_bytes().to_vec();
            bytes.push(0);
            options.insert("current_folder", Value::from(bytes));
        }
        options
    }

    fn request(&self, method: &str) -> Result<Vec<String>, String> {
        let connection = dbus::session()?;
        let chooser = Proxy::new(
            connection,
            PORTAL,
            PORTAL_PATH,
            "org.freedesktop.portal.FileChooser",
        )
        .map_err(failed)?;
        let token = format!(
            "luft{}_{}",
            std::process::id(),
            REQUESTS.fetch_add(1, Ordering::Relaxed)
        );
        let sender = connection
            .unique_name()
            .ok_or("Not connected to the session bus")?
            .trim_start_matches(':')
            .replace('.', "_");
        let handle = format!("{PORTAL_PATH}/request/{sender}/{token}");
        let rule = zbus::MatchRule::builder()
            .msg_type(zbus::message::Type::Signal)
            .interface("org.freedesktop.portal.Request")
            .map_err(failed)?
            .member("Response")
            .map_err(failed)?
            .path(handle.as_str())
            .map_err(failed)?
            .build();
        let mut responses =
            MessageIterator::for_match_rule(rule, connection, None).map_err(failed)?;
        let _: OwnedObjectPath = chooser
            .call(method, &("", self.title, self.options(&token)))
            .map_err(failed)?;
        let message = responses
            .next()
            .ok_or("The file chooser closed")?
            .map_err(failed)?;
        let (response, results): (u32, HashMap<String, OwnedValue>) =
            message.body().deserialize().map_err(failed)?;
        if response != 0 {
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

pub fn open_file(title: &str, filter: Filter) -> Result<Option<String>, String> {
    Ok(FileChooser {
        title,
        filters: vec![filter],
        ..FileChooser::default()
    }
    .open()?
    .into_iter()
    .next())
}

pub fn open_files(title: &str, filter: Filter) -> Result<Vec<String>, String> {
    FileChooser {
        title,
        filters: vec![filter],
        multiple: true,
        ..FileChooser::default()
    }
    .open()
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
