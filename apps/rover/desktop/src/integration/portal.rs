use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use tokio::process::Command;
use url::Url;
use zbus::interface;
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};

use super::chooser::{
    ACCEPT_LABEL_ENV, CURRENT_FOLDER_ENV, CURRENT_NAME_ENV, ChooserMode, ChooserResponse,
    DIRECTORY_ENV, FILES_ENV, MODE_ENV, MULTIPLE_ENV, RESPONSE_ENV, TITLE_ENV,
};
use super::{data_dir, install_dbus_service, serve_dbus, write_file};

const BUS_NAME: &str = "org.freedesktop.impl.portal.desktop.rover";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const FILE_CHOOSER_INTERFACE: &str = "org.freedesktop.impl.portal.FileChooser";
const RESPONSE_SUCCESS: u32 = 0;
const RESPONSE_CANCELLED: u32 = 1;

type Options = HashMap<String, OwnedValue>;
type Results = HashMap<String, OwnedValue>;

#[derive(Default)]
struct FileChooser {
    next_request: AtomicU64,
}

#[interface(interface = "org.freedesktop.impl.portal.FileChooser")]
impl FileChooser {
    #[zbus(out_args("response", "results"))]
    async fn open_file(
        &self,
        handle: OwnedObjectPath,
        _app_id: String,
        _parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(&handle, title, &options, ChooserMode::Open)
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_file(
        &self,
        handle: OwnedObjectPath,
        _app_id: String,
        _parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(&handle, title, &options, ChooserMode::Save)
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_files(
        &self,
        handle: OwnedObjectPath,
        _app_id: String,
        _parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(&handle, title, &options, ChooserMode::SaveFiles)
            .await
    }

    #[zbus(property)]
    fn version(&self) -> u32 {
        4
    }
}

impl FileChooser {
    async fn choose(
        &self,
        handle: &OwnedObjectPath,
        title: String,
        options: &Options,
        mode: ChooserMode,
    ) -> zbus::fdo::Result<(u32, Results)> {
        let response_path = response_path(
            handle.as_str(),
            self.next_request.fetch_add(1, Ordering::Relaxed),
        );
        let response = run_chooser(&response_path, title, options, mode).await;
        let _ = fs::remove_file(&response_path);
        let response = response.map_err(zbus::fdo::Error::Failed)?;
        Ok(portal_results(response))
    }
}

pub fn run() -> Result<(), String> {
    serve_dbus(BUS_NAME, PORTAL_PATH, FileChooser::default())
}

pub fn install() -> Result<(), String> {
    install_dbus_service(BUS_NAME, "--portal-backend")?;
    write_file(
        &data_dir()?.join("xdg-desktop-portal/portals/rover.portal"),
        &format!("[portal]\nDBusName={BUS_NAME}\nInterfaces={FILE_CHOOSER_INTERFACE};\nUseIn=*;\n"),
    )
}

async fn run_chooser(
    response_path: &Path,
    title: String,
    options: &Options,
    mode: ChooserMode,
) -> Result<ChooserResponse, String> {
    let exe = env::current_exe().map_err(|error| error.to_string())?;
    let directory = option_bool(options, "directory").unwrap_or(mode == ChooserMode::SaveFiles);
    let files = serde_json::to_string(&option_files(options)).map_err(|error| error.to_string())?;
    let status = Command::new(exe)
        .env(RESPONSE_ENV, response_path)
        .env(MODE_ENV, mode.as_str())
        .env(TITLE_ENV, title)
        .env(
            ACCEPT_LABEL_ENV,
            option_string(options, "accept_label").unwrap_or_default(),
        )
        .env(DIRECTORY_ENV, if directory { "1" } else { "0" })
        .env(
            MULTIPLE_ENV,
            if option_bool(options, "multiple").unwrap_or(false) {
                "1"
            } else {
                "0"
            },
        )
        .env(
            CURRENT_FOLDER_ENV,
            current_folder(options).unwrap_or_default(),
        )
        .env(
            CURRENT_NAME_ENV,
            option_string(options, "current_name").unwrap_or_default(),
        )
        .env(FILES_ENV, files)
        .status()
        .await
        .map_err(|error| error.to_string())?;

    let response = fs::read(response_path)
        .ok()
        .and_then(|bytes| serde_json::from_slice::<ChooserResponse>(&bytes).ok());
    match response {
        Some(response) => Ok(response),
        None if status.success() => Ok(ChooserResponse::default()),
        None => Err(format!("Rover chooser exited with status {status}")),
    }
}

fn portal_results(response: ChooserResponse) -> (u32, Results) {
    if !response.accepted {
        return (RESPONSE_CANCELLED, Results::new());
    }
    let uris: Vec<String> = response
        .paths
        .into_iter()
        .filter_map(|path| Url::from_file_path(path).ok())
        .map(String::from)
        .collect();
    let mut results = Results::new();
    results.insert("uris".to_string(), owned(uris));
    results.insert("writable".to_string(), OwnedValue::from(false));
    (RESPONSE_SUCCESS, results)
}

fn option_bool(options: &Options, key: &str) -> Option<bool> {
    options
        .get(key)
        .and_then(|value| bool::try_from(value).ok())
}

fn option_string(options: &Options, key: &str) -> Option<String> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| String::try_from(value).ok())
}

fn option_bytes(options: &Options, key: &str) -> Option<String> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<u8>::try_from(value).ok())
        .and_then(bytes_to_path)
}

fn current_folder(options: &Options) -> Option<String> {
    option_bytes(options, "current_folder").or_else(|| {
        option_bytes(options, "current_file").and_then(|path| {
            Path::new(&path)
                .parent()
                .map(|parent| parent.to_string_lossy().into_owned())
        })
    })
}

fn option_files(options: &Options) -> Vec<String> {
    options
        .get("files")
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<Vec<u8>>::try_from(value).ok())
        .map(|files| files.into_iter().filter_map(bytes_to_path).collect())
        .unwrap_or_default()
}

fn bytes_to_path(mut bytes: Vec<u8>) -> Option<String> {
    while bytes.last() == Some(&0) {
        bytes.pop();
    }
    String::from_utf8(bytes)
        .ok()
        .filter(|value| !value.is_empty())
}

fn response_path(handle: &str, request: u64) -> PathBuf {
    let handle: String = handle
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect();
    env::temp_dir().join(format!(
        "rover-chooser-{}-{request}-{handle}.json",
        std::process::id()
    ))
}

fn owned<T>(value: T) -> OwnedValue
where
    Value<'static>: From<T>,
{
    OwnedValue::try_from(Value::from(value)).expect("URI lists always fit in a D-Bus variant")
}
