use std::path::{Path, PathBuf};

use super::git::repository_root;
use crate::schema::SCHELF_TOML;

/// The schelf.toml a command works on, the repository it's in and its folder.
pub struct ConfigPlace {
    pub root: PathBuf,
    pub config: PathBuf,
    pub folder: PathBuf,
}

fn nearest(from: &Path, root: &Path) -> PathBuf {
    let mut folder = from;
    loop {
        let candidate = folder.join(SCHELF_TOML);
        if candidate.exists() {
            return candidate;
        }
        match folder.parent() {
            Some(parent) if folder != root => folder = parent,
            _ => return root.join(SCHELF_TOML),
        }
    }
}

/// `--config`, or the nearest schelf.toml from here up to the repository root.
pub fn config_place(given: Option<&str>) -> ConfigPlace {
    let here = std::env::current_dir().unwrap_or_default();
    let root = repository_root(&here);
    let config = match given {
        Some(given) => std::path::absolute(given).unwrap_or_else(|_| here.join(given)),
        None => nearest(&here, &root),
    };
    let folder = config.parent().map(Path::to_path_buf).unwrap_or_default();
    ConfigPlace {
        root,
        config,
        folder,
    }
}

/// `path` from `base`, with forward slashes, as Node's `relative` gives it.
pub fn relative(base: &Path, path: &Path) -> String {
    let base: Vec<_> = base.components().collect();
    let target: Vec<_> = path.components().collect();
    let shared = base
        .iter()
        .zip(&target)
        .take_while(|(left, right)| left == right)
        .count();
    let ups = std::iter::repeat_n("..".to_owned(), base.len() - shared);
    let downs = target[shared..]
        .iter()
        .map(|part| part.as_os_str().to_string_lossy().into_owned());
    ups.chain(downs).collect::<Vec<_>>().join("/")
}
