//! Development builds, which also count the Luft programs built in this tree
//! as Luft's. An installed service ignores the variables that name them, as an
//! installed Kestrel does.

use std::path::Path;
use std::sync::OnceLock;

use super::image;
use crate::process::open_folder;

const BUILT_PROGRAMS: [&str; 2] = ["KESTREL_LUFT_APPS", "KESTREL_BUILDDIR"];

pub fn is_development_build() -> bool {
    static DEVELOPMENT: OnceLock<bool> = OnceLock::new();
    *DEVELOPMENT.get_or_init(|| {
        open_folder(std::process::id())
            .and_then(|folder| image::running(&folder))
            .is_none_or(|running| !running.is_installed())
    })
}

/// Whether `program` was built in this tree, for a development build:
/// it is in one of the folders `KESTREL_LUFT_APPS` lists, or in
/// `KESTREL_BUILDDIR`.
pub fn built(program: &Path) -> bool {
    is_development_build()
        && BUILT_PROGRAMS
            .iter()
            .filter_map(std::env::var_os)
            .flat_map(|folders| std::env::split_paths(&folders).collect::<Vec<_>>())
            .filter_map(|folder| std::fs::canonicalize(folder).ok())
            .any(|folder| program.parent() == Some(folder.as_path()))
}
