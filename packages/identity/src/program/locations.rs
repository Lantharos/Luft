//! Where the system image installs Luft's own programs: Kestrel, its
//! helpers and its Mutter, Luft's services and daemons, and its apps.

use std::path::Path;

const APPS: &str = "/usr/lib/sabine/com.lantharos.";
const PROGRAM_FOLDERS: [&str; 2] = ["/usr/bin", "/usr/libexec"];
const PREFIXES: [&str; 3] = ["kestrel", "luft-", "mutter-"];
const NAMED: [&str; 5] = ["peek", "sushictl", "sushid", "trustctl", "trustd"];

pub fn is_luft_location(path: &Path) -> bool {
    if path.to_string_lossy().starts_with(APPS) {
        return true;
    }
    let (Some(folder), Some(name)) = (path.parent(), path.file_name()) else {
        return false;
    };
    let name = name.to_string_lossy();
    PROGRAM_FOLDERS
        .iter()
        .any(|program_folder| folder == Path::new(program_folder))
        && (PREFIXES.iter().any(|prefix| name.starts_with(prefix)) || NAMED.contains(&&*name))
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::is_luft_location;

    #[test]
    fn knows_luft_programs_by_where_they_are_installed() {
        for luft in [
            "/usr/bin/kestrel",
            "/usr/libexec/kestrel-settings",
            "/usr/libexec/luft-firewall",
            "/usr/libexec/trustd",
            "/usr/lib/sabine/com.lantharos.settings/settings",
        ] {
            assert!(is_luft_location(Path::new(luft)), "{luft}");
        }
        for other in [
            "/usr/bin/bash",
            "/usr/bin/flatpak",
            "/usr/lib/sabine/org.example.App/app",
            "/usr/libexec/kestrel/extra/helper",
            "/var/home/mara/.local/bin/luft-firewall",
        ] {
            assert!(!is_luft_location(Path::new(other)), "{other}");
        }
    }
}
