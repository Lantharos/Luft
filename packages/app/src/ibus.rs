use std::env;
use std::fs;
use std::path::PathBuf;

const MACHINE_IDS: [&str; 2] = ["/var/lib/dbus/machine-id", "/etc/machine-id"];
const PREFIX: &str = "IBUS_ADDRESS=";

fn machine_id() -> String {
    MACHINE_IDS
        .iter()
        .find_map(|path| fs::read_to_string(path).ok())
        .map_or_else(|| "machine-id".into(), |id| id.trim().to_owned())
}

fn display() -> (String, String) {
    if let Ok(wayland) = env::var("WAYLAND_DISPLAY") {
        return ("unix".into(), wayland);
    }
    let Ok(display) = env::var("DISPLAY") else {
        return ("unix".into(), "0".into());
    };
    let (host, rest) = display.split_once(':').unwrap_or((display.as_str(), "0"));
    let number = rest.split('.').next().unwrap_or("0");
    let host = if host.is_empty() { "unix" } else { host };
    (host.into(), number.into())
}

fn socket_file() -> PathBuf {
    if let Some(file) = env::var_os("IBUS_ADDRESS_FILE") {
        return file.into();
    }
    let (host, number) = display();
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from(".config"))
        .join("ibus/bus")
        .join(format!("{}-{host}-{number}", machine_id()))
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
