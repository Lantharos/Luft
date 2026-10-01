use std::io;
use std::path::Path;

const DISABLED: &str = "/var/lib/luft-usb-protection/disabled";

pub fn enabled() -> bool {
    !Path::new(DISABLED).exists()
}

pub fn save(enabled: bool) -> io::Result<()> {
    if !enabled {
        return std::fs::write(DISABLED, "");
    }
    match std::fs::remove_file(DISABLED) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error),
        _ => Ok(()),
    }
}
