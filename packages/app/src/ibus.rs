use std::env;
use std::fs;
use std::path::PathBuf;

const MACHINE_IDS: [&str; 2] = ["/var/lib/dbus/machine-id", "/etc/machine-id"];
const PREFIX: &str = "IBUS_ADDRESS=";
const DEFAULT_WAYLAND_DISPLAY: &str = "wayland-0";

fn machine_id() -> String {
    MACHINE_IDS
        .iter()
        .find_map(|path| fs::read_to_string(path).ok())
        .map_or_else(|| "machine-id".into(), |id| id.trim().to_owned())
}

fn socket_file() -> PathBuf {
    if let Some(file) = env::var_os("IBUS_ADDRESS_FILE") {
        return file.into();
    }
    let display = env::var("WAYLAND_DISPLAY").unwrap_or_else(|_| DEFAULT_WAYLAND_DISPLAY.into());
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from(".config"))
        .join("ibus/bus")
        .join(format!("{}-unix-{display}", machine_id()))
}

pub fn address() -> Result<String, String> {
    if let Ok(address) = env::var("IBUS_ADDRESS") {
        return Ok(address);
    }
    let file = socket_file();
    let contents =
        fs::read_to_string(&file).map_err(|error| format!("{}: {error}", file.display()))?;
    contents
        .lines()
        .find_map(|line| line.strip_prefix(PREFIX))
        .map(str::to_owned)
        .ok_or_else(|| format!("{} has no address", file.display()))
}
