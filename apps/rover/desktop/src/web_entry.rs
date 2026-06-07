use std::{
    env, fs,
    path::{Path, PathBuf},
};

pub fn resolve(source_root: &Path) -> PathBuf {
    installed()
        .or_else(bundled)
        .unwrap_or_else(|| source_root.join("build/index.html"))
}

fn installed() -> Option<PathBuf> {
    env::var_os("FENESTRA_WEB_ENTRY")
        .map(PathBuf::from)
        .filter(|entry| entry.is_file())
        .or_else(|| {
            env::var_os("FENESTRA_WEB_DIR")
                .map(|dir| PathBuf::from(dir).join("index.html"))
                .filter(|entry| entry.is_file())
        })
        .or_else(|| {
            env::var_os("FENESTRA_APP_DIR")
                .map(|dir| PathBuf::from(dir).join("web/index.html"))
                .filter(|entry| entry.is_file())
        })
}

fn bundled() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let bin_dir = exe.parent()?;
    let resources_root = bin_dir.parent()?.join("share/fenestra");
    let mut entries = fs::read_dir(resources_root)
        .ok()?
        .filter_map(Result::ok)
        .map(|entry| entry.path().join("web/index.html"))
        .filter(|entry| entry.is_file())
        .collect::<Vec<_>>();
    entries.sort();
    entries.into_iter().next()
}
