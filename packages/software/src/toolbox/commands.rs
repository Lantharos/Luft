use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

const PROGRAMS: &str = "/usr/bin/";
const SYSTEM_PATHS: [&str; 2] = ["/usr/bin", "/usr/sbin"];
const INSIDE_TOOLBOX: &str = "/run/.toolboxenv";

fn folder() -> Option<PathBuf> {
    dirs::executable_dir()
}

pub fn programs(files: &str) -> Vec<String> {
    files
        .lines()
        .filter_map(|file| file.strip_prefix(PROGRAMS))
        .filter(|name| !name.is_empty() && !name.contains('/'))
        .map(str::to_owned)
        .collect()
}

pub fn on_system(name: &str) -> bool {
    SYSTEM_PATHS
        .iter()
        .any(|folder| Path::new(folder).join(name).exists())
}

fn launcher(container: &str, name: &str) -> String {
    format!(
        "#!/bin/sh\n\
         if [ -e {INSIDE_TOOLBOX} ]; then exec {PROGRAMS}{name} \"$@\"; fi\n\
         exec toolbox run --container {container} {PROGRAMS}{name} \"$@\"\n"
    )
}

pub fn export(container: &str, names: &[String], owned: &[String]) -> Vec<String> {
    let Some(folder) = folder() else {
        return Vec::new();
    };
    if std::fs::create_dir_all(&folder).is_err() {
        return Vec::new();
    }
    names
        .iter()
        .filter(|name| !on_system(name))
        .filter(|name| owned.contains(name) || !folder.join(name).exists())
        .filter(|name| {
            let path = folder.join(name);
            std::fs::write(&path, launcher(container, name)).is_ok()
                && std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755)).is_ok()
        })
        .cloned()
        .collect()
}

pub fn unexport(names: &[String]) {
    let Some(folder) = folder() else {
        return;
    };
    for name in names {
        let _ = std::fs::remove_file(folder.join(name));
    }
}
