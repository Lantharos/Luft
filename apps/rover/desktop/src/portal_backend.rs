use crate::chooser::ChooserResponse;
use std::{
    collections::HashMap,
    env, fs,
    path::{Path, PathBuf},
    process::Command,
    sync::atomic::{AtomicU64, Ordering},
};
use url::Url;
use zbus::{
    connection, interface,
    zvariant::{OwnedObjectPath, OwnedValue, Value},
};

const BUS_NAME: &str = "org.freedesktop.impl.portal.desktop.rover";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const FILE_CHOOSER_INTERFACE: &str = "org.freedesktop.impl.portal.FileChooser";

type Options = HashMap<String, OwnedValue>;
type Results = HashMap<String, OwnedValue>;

#[derive(Default)]
struct FileChooserBackend {
    request_id: AtomicU64,
}

#[interface(interface = "org.freedesktop.impl.portal.FileChooser")]
impl FileChooserBackend {
    #[zbus(out_args("response", "results"))]
    async fn open_file(
        &self,
        handle: OwnedObjectPath,
        app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.run_chooser(handle, app_id, parent_window, title, options, "open")
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_file(
        &self,
        handle: OwnedObjectPath,
        app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.run_chooser(handle, app_id, parent_window, title, options, "save")
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_files(
        &self,
        handle: OwnedObjectPath,
        app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.run_chooser(handle, app_id, parent_window, title, options, "save_files")
            .await
    }

    #[zbus(property)]
    fn version(&self) -> u32 {
        4
    }
}

impl FileChooserBackend {
    async fn run_chooser(
        &self,
        handle: OwnedObjectPath,
        _app_id: String,
        _parent_window: String,
        title: String,
        options: Options,
        mode: &str,
    ) -> zbus::fdo::Result<(u32, Results)> {
        let response = self
            .spawn_chooser(handle, title, options, mode)
            .await
            .map_err(zbus::fdo::Error::Failed)?;
        Ok(response_to_portal(response))
    }

    async fn spawn_chooser(
        &self,
        handle: OwnedObjectPath,
        title: String,
        options: Options,
        mode: &str,
    ) -> Result<ChooserResponse, String> {
        let exe = env::current_exe().map_err(|error| error.to_string())?;
        let response_path = response_path(
            handle.as_str(),
            self.request_id.fetch_add(1, Ordering::Relaxed),
        );
        let mut command = Command::new(exe);
        command
            .env("ROVER_CHOOSER_RESPONSE", &response_path)
            .env("ROVER_CHOOSER_MODE", mode)
            .env(
                "ROVER_CHOOSER_TITLE",
                if title.is_empty() {
                    default_title(mode).to_string()
                } else {
                    title
                },
            )
            .env(
                "ROVER_CHOOSER_ACCEPT_LABEL",
                option_string(&options, "accept_label")
                    .unwrap_or_else(|| default_accept(mode).to_string()),
            )
            .env(
                "ROVER_CHOOSER_DIRECTORY",
                bool_env(option_bool(&options, "directory").unwrap_or(mode == "save_files")),
            )
            .env(
                "ROVER_CHOOSER_MULTIPLE",
                bool_env(option_bool(&options, "multiple").unwrap_or(false)),
            )
            .env(
                "ROVER_CHOOSER_CURRENT_FOLDER",
                current_folder(&options).unwrap_or_default(),
            )
            .env(
                "ROVER_CHOOSER_CURRENT_NAME",
                option_string(&options, "current_name").unwrap_or_default(),
            )
            .env(
                "ROVER_CHOOSER_FILES",
                serde_json::to_string(&option_files(&options))
                    .map_err(|error| error.to_string())?,
            );

        let status = command.status().map_err(|error| error.to_string())?;
        let response = read_response(&response_path).unwrap_or(ChooserResponse {
            accepted: false,
            paths: Vec::new(),
        });
        let _ = fs::remove_file(&response_path);

        if response.accepted {
            return Ok(response);
        }

        if !status.success() {
            return Err(format!("Rover chooser exited with status {}", status));
        }

        Ok(response)
    }
}

pub fn run() -> Result<(), String> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|error| error.to_string())?;
    runtime.block_on(async {
        let _connection = connection::Builder::session()
            .map_err(|error| error.to_string())?
            .name(BUS_NAME)
            .map_err(|error| error.to_string())?
            .serve_at(PORTAL_PATH, FileChooserBackend::default())
            .map_err(|error| error.to_string())?
            .build()
            .await
            .map_err(|error| error.to_string())?;
        std::future::pending::<()>().await;
        #[allow(unreachable_code)]
        Ok(())
    })
}

pub fn install_user_portal() -> Result<(), String> {
    let exe = env::current_exe().map_err(|error| error.to_string())?;
    let data_home = xdg_data_home();
    let config_home = xdg_config_home();
    let service_path =
        data_home.join("dbus-1/services/org.freedesktop.impl.portal.desktop.rover.service");
    let portal_path = data_home.join("xdg-desktop-portal/portals/rover.portal");
    let portals_conf_path = config_home.join("xdg-desktop-portal/portals.conf");

    write_file(&service_path, &service_file(&exe))?;
    write_file(&portal_path, portal_file())?;
    write_file(&portals_conf_path, &portal_config(&portals_conf_path)?)?;
    Ok(())
}

fn response_to_portal(response: ChooserResponse) -> (u32, Results) {
    if !response.accepted {
        return (1, Results::new());
    }

    let uris = response
        .paths
        .into_iter()
        .filter_map(|path| Url::from_file_path(path).ok())
        .map(|uri| uri.to_string())
        .collect::<Vec<_>>();
    let mut results = Results::new();
    results.insert("uris".to_string(), owned(uris));
    results.insert("writable".to_string(), OwnedValue::from(false));
    (0, results)
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

fn current_folder(options: &Options) -> Option<String> {
    option_bytes(options, "current_folder").or_else(|| {
        option_bytes(options, "current_file")
            .and_then(|path| PathBuf::from(path).parent().map(path_to_string))
    })
}

fn option_files(options: &Options) -> Vec<String> {
    options
        .get("files")
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<Vec<u8>>::try_from(value).ok())
        .map(|files| files.into_iter().filter_map(bytes_to_string).collect())
        .unwrap_or_default()
}

fn option_bytes(options: &Options, key: &str) -> Option<String> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<u8>::try_from(value).ok())
        .and_then(bytes_to_string)
}

fn bytes_to_string(mut bytes: Vec<u8>) -> Option<String> {
    while bytes.last() == Some(&0) {
        bytes.pop();
    }
    String::from_utf8(bytes)
        .ok()
        .filter(|value| !value.is_empty())
}

fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

fn response_path(handle: &str, id: u64) -> PathBuf {
    let safe_handle = handle
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect::<String>();
    env::temp_dir().join(format!(
        "rover-chooser-{}-{}-{}.json",
        std::process::id(),
        id,
        safe_handle
    ))
}

fn default_title(mode: &str) -> &'static str {
    match mode {
        "save" => "Save file",
        "save_files" => "Select folder",
        _ => "Select file",
    }
}

fn default_accept(mode: &str) -> &'static str {
    match mode {
        "save" => "Save",
        "save_files" => "Select",
        _ => "Open",
    }
}

fn bool_env(value: bool) -> &'static str {
    if value {
        "1"
    } else {
        "0"
    }
}

fn read_response(path: &Path) -> Option<ChooserResponse> {
    serde_json::from_slice(&fs::read(path).ok()?).ok()
}

fn owned<T>(value: T) -> OwnedValue
where
    Value<'static>: From<T>,
{
    OwnedValue::try_from(Value::from(value)).expect("value must fit into D-Bus variant")
}

fn xdg_data_home() -> PathBuf {
    env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .or_else(|| dirs::home_dir().map(|home| home.join(".local/share")))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn xdg_config_home() -> PathBuf {
    env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| dirs::home_dir().map(|home| home.join(".config")))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn write_file(path: &Path, contents: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(path, contents).map_err(|error| error.to_string())
}

fn service_file(exe: &Path) -> String {
    format!(
        "[D-BUS Service]\nName={}\nExec={} --portal-backend\n",
        BUS_NAME,
        shell_quote(&exe.to_string_lossy())
    )
}

fn portal_file() -> &'static str {
    "[portal]\nDBusName=org.freedesktop.impl.portal.desktop.rover\nInterfaces=org.freedesktop.impl.portal.FileChooser;\nUseIn=*;\n"
}

fn portal_config(path: &Path) -> Result<String, String> {
    let current = fs::read_to_string(path).unwrap_or_default();
    let line = format!("{}=rover;*\n", FILE_CHOOSER_INTERFACE);
    if current.contains(&format!("{}=", FILE_CHOOSER_INTERFACE)) {
        return Ok(current
            .lines()
            .map(|existing| {
                if existing
                    .trim_start()
                    .starts_with(&format!("{}=", FILE_CHOOSER_INTERFACE))
                {
                    line.trim_end().to_string()
                } else {
                    existing.to_string()
                }
            })
            .collect::<Vec<_>>()
            .join("\n")
            + "\n");
    }
    if current.contains("[preferred]") {
        return Ok(current.replacen("[preferred]", &format!("[preferred]\n{}", line), 1));
    }
    Ok(format!("[preferred]\n{}", line))
}

fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}
