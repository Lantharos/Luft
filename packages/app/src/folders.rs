use std::path::PathBuf;

pub fn pictures() -> PathBuf {
    dirs::picture_dir().unwrap_or_else(|| dirs::home_dir().unwrap_or_default().join("Pictures"))
}

pub fn wallpapers() -> PathBuf {
    pictures().join("Wallpapers")
}

/// The app's own folders below the desktop's configuration, data, cache and
/// state folders, named by the app id it runs as, which Sabine lets a
/// confined app write.
pub fn config(app_id: &str) -> PathBuf {
    own(dirs::config_dir(), app_id)
}

pub fn data(app_id: &str) -> PathBuf {
    own(dirs::data_dir(), app_id)
}

pub fn cache(app_id: &str) -> PathBuf {
    own(dirs::cache_dir(), app_id)
}

pub fn state(app_id: &str) -> PathBuf {
    own(dirs::state_dir(), app_id)
}

fn own(folder: Option<PathBuf>, app_id: &str) -> PathBuf {
    folder
        .expect("the desktop has its folders")
        .join(sabine::AppEnvironment::current().app_id(app_id))
}
