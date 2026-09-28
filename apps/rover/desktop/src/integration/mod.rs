pub mod chooser;
pub mod file_manager_bus;
pub mod launch_args;
pub mod portal;

use std::env;
use std::fs;
use std::path::{Path, PathBuf};

use zbus::{connection, object_server::Interface};

fn serve_dbus<I: Interface>(bus_name: &str, object_path: &str, interface: I) -> Result<(), String> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|error| error.to_string())?;
    runtime.block_on(async {
        let _connection = connection::Builder::session()
            .and_then(|builder| builder.name(bus_name))
            .and_then(|builder| builder.serve_at(object_path, interface))
            .map_err(|error| error.to_string())?
            .build()
            .await
            .map_err(|error| error.to_string())?;
        std::future::pending::<Result<(), String>>().await
    })
}

fn install_dbus_service(bus_name: &str, flag: &str) -> Result<(), String> {
    let exe = env::current_exe().map_err(|error| error.to_string())?;
    let service = format!(
        "[D-BUS Service]\nName={bus_name}\nExec={} {flag}\n",
        shell_quote(&exe.to_string_lossy())
    );
    write_file(
        &data_dir()?.join(format!("dbus-1/services/{bus_name}.service")),
        &service,
    )
}

fn data_dir() -> Result<PathBuf, String> {
    dirs::data_dir().ok_or_else(|| "Could not find the user data folder".to_string())
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
