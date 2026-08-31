use std::{env, io, path::PathBuf};

const RESOURCE_ENV: &str = "LUFT_SHELL_WEB_DIR";

pub fn entrypoint() -> io::Result<PathBuf> {
    let candidates = resource_candidates();
    candidates
        .into_iter()
        .map(|directory| directory.join("index.html"))
        .find(|entrypoint| entrypoint.is_file())
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::NotFound,
                format!("Luft shell resources are missing; set {RESOURCE_ENV} or reinstall Luft"),
            )
        })
}

fn resource_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();
    if let Some(directory) = env::var_os(RESOURCE_ENV) {
        candidates.push(directory.into());
    }
    if let Ok(executable) = env::current_exe()
        && let Some(prefix) = executable.parent().and_then(|bin| bin.parent())
    {
        candidates.push(prefix.join("share/luft/shell"));
    }
    #[cfg(debug_assertions)]
    candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("web/dist"));
    candidates
}
