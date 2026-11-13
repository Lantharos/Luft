//! What this system offers to install software through, found at run time,
//! so the same program works on Luft and on other Linux systems.

use std::path::{Path, PathBuf};
use std::sync::OnceLock;

const OS_RELEASE: [&str; 2] = ["/etc/os-release", "/usr/lib/os-release"];
const SABINE_SERVICE: &str = "bin/current/sabine-service";
const SYSTEM_SABINE: &str = "/usr/lib/sabine";

/// The Schelf app in Luft's image, which also runs AppImages in their sandbox.
pub const APP: &str = "/usr/lib/sabine/com.lantharos.schelf/schelf";

pub const NEEDS_LUFT: &str = "needs Luft";

/// Whether this computer runs Luft.
pub fn luft() -> bool {
    static LUFT: OnceLock<bool> = OnceLock::new();
    *LUFT.get_or_init(|| {
        OS_RELEASE
            .iter()
            .find_map(|path| std::fs::read_to_string(path).ok())
            .is_some_and(|release| release.lines().any(|line| line.trim() == "ID=luft"))
    })
}

/// The Schelf app, when this system has it.
pub fn app() -> Option<&'static Path> {
    (luft() && Path::new(APP).is_file()).then_some(Path::new(APP))
}

fn on_path(program: &str) -> Option<PathBuf> {
    std::env::split_paths(&std::env::var_os("PATH")?)
        .map(|folder| folder.join(program))
        .find(|path| path.is_file())
}

/// Whether Flatpak is installed.
pub fn flatpak() -> bool {
    static FLATPAK: OnceLock<bool> = OnceLock::new();
    *FLATPAK.get_or_init(|| on_path("flatpak").is_some())
}

/// Whether Toolbox is installed, which command-line tools from Fedora live in.
pub fn toolbox() -> bool {
    static TOOLBOX: OnceLock<bool> = OnceLock::new();
    *TOOLBOX.get_or_init(|| on_path("toolbox").is_some())
}

fn user_sabine() -> PathBuf {
    std::env::var_os("XDG_DATA_HOME")
        .filter(|path| !path.is_empty())
        .map(PathBuf::from)
        .or_else(|| dirs::home_dir().map(|home| home.join(".local/share")))
        .unwrap_or_default()
        .join("sabine")
}

/// Sabine's service program, which installs and removes Sabine apps: the
/// system's, then the one installed for this account.
pub fn sabine_service() -> Option<PathBuf> {
    [PathBuf::from(SYSTEM_SABINE), user_sabine()]
        .into_iter()
        .map(|root| root.join(SABINE_SERVICE))
        .find(|program| program.is_file())
}
