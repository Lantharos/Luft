use std::path::PathBuf;

pub fn pictures() -> PathBuf {
    dirs::picture_dir().unwrap_or_else(|| dirs::home_dir().unwrap_or_default().join("Pictures"))
}

pub fn wallpapers() -> PathBuf {
    pictures().join("Wallpapers")
}
