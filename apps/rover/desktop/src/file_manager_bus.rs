use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

use url::Url;
use zbus::{connection, interface};

const BUS_NAME: &str = "org.freedesktop.FileManager1";
const SERVICE_PATH: &str = "/org/freedesktop/FileManager1";

struct FileManagerBus;

#[interface(interface = "org.freedesktop.FileManager1")]
impl FileManagerBus {
    async fn show_items(
        &self,
        uris: Vec<String>,
        _display_name: String,
        _startup_id: String,
    ) -> zbus::fdo::Result<()> {
        launch_rover(&uris, ItemKind::Auto);
        Ok(())
    }

    async fn show_folders(
        &self,
        uris: Vec<String>,
        _display_name: String,
        _startup_id: String,
    ) -> zbus::fdo::Result<()> {
        launch_rover(&uris, ItemKind::Folder);
        Ok(())
    }

    async fn open_folder(
        &self,
        uri: String,
        _display_name: String,
        _startup_id: String,
    ) -> zbus::fdo::Result<()> {
        launch_rover(&[uri], ItemKind::Folder);
        Ok(())
    }
}

enum ItemKind {
    Auto,
    Folder,
}

fn launch_rover(uris: &[String], kind: ItemKind) {
    let mut args = Vec::new();
    for uri in uris {
        let Some(path) = uri_to_path(uri) else {
            continue;
        };
        let target = match kind {
            ItemKind::Folder => path,
            ItemKind::Auto => match fs::metadata(&path) {
                Ok(metadata) if metadata.is_dir() => path,
                _ => parent_path(&path),
            },
        };
        args.push(target);
    }
    if args.is_empty() {
        return;
    }
    let Ok(exe) = env::current_exe() else {
        return;
    };
    let _ = Command::new(exe).args(&args).spawn();
}

fn uri_to_path(uri: &str) -> Option<String> {
    let url = Url::parse(uri).ok()?;
    if url.scheme() != "file" {
        return None;
    }
    let path = url.to_file_path().ok()?;
    Some(path.to_string_lossy().into_owned())
}

fn parent_path(path: &str) -> String {
    PathBuf::from(path)
        .parent()
        .map(|parent| parent.to_string_lossy().into_owned())
        .unwrap_or_else(|| path.to_string())
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
            .serve_at(SERVICE_PATH, FileManagerBus)
            .map_err(|error| error.to_string())?
            .build()
            .await
            .map_err(|error| error.to_string())?;
        std::future::pending::<()>().await;
        #[allow(unreachable_code)]
        Ok(())
    })
}

pub fn install_user_service() -> Result<(), String> {
    let exe = env::current_exe().map_err(|error| error.to_string())?;
    let data_home = xdg_data_home();
    let service_path = data_home.join("dbus-1/services/org.freedesktop.FileManager1.service");
    write_file(&service_path, &service_file(&exe))?;
    Ok(())
}

fn service_file(exe: &Path) -> String {
    format!(
        "[D-BUS Service]\nName={}\nExec={} --file-manager-bus\n",
        BUS_NAME,
        shell_quote(&exe.to_string_lossy())
    )
}

fn xdg_data_home() -> PathBuf {
    env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .or_else(|| dirs::home_dir().map(|home| home.join(".local/share")))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn write_file(path: &Path, contents: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(path, contents).map_err(|error| error.to_string())
}

fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}
