use std::ffi::OsStr;
use std::path::{Path, PathBuf};

const CURRENT_DEPLOYMENT: &str = "active";
const UNPATCHED_APP: &str = "xpui.spa";

/// Where a new Spotify shows up, which comes without the theme: Flatpak swaps in a new deployment, and a package
/// puts back the app Spicetify took apart.
pub fn folders(spotify: &Path) -> Vec<PathBuf> {
    let deployments = spotify
        .ancestors()
        .find(|folder| folder.ends_with(CURRENT_DEPLOYMENT))
        .and_then(Path::parent);
    vec![deployments.map_or_else(|| spotify.join("Apps"), Path::to_path_buf)]
}

pub fn replaces_spotify(name: &OsStr) -> bool {
    name == CURRENT_DEPLOYMENT || name == UNPATCHED_APP
}
