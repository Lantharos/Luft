use std::fs;
use std::path::Path;

use luft_i18n::t;

use super::xcursor;
use crate::L10N;

const KEPT_FILES: [&str; 2] = ["index.theme", "cursor.theme"];
const CURSORS: &str = "cursors";
const LARGEST_CURSOR: u64 = 64 * 1024 * 1024;

fn failed(error: std::io::Error) -> String {
    error.to_string()
}

fn is_cursor(path: &Path) -> bool {
    fs::metadata(path).is_ok_and(|file| file.len() <= LARGEST_CURSOR)
        && fs::read(path).is_ok_and(|bytes| xcursor::well_formed(&bytes))
}

fn keep_cursors(folder: &Path) -> Result<usize, String> {
    let mut kept = 0;
    let mut links = Vec::new();
    for entry in fs::read_dir(folder).map_err(failed)?.flatten() {
        let (path, kind) = (entry.path(), entry.file_type().map_err(failed)?);
        if kind.is_dir() {
            fs::remove_dir_all(&path).map_err(failed)?;
        } else if kind.is_symlink() {
            links.push(path);
        } else if is_cursor(&path) {
            kept += 1;
        } else {
            fs::remove_file(&path).map_err(failed)?;
        }
    }
    for link in links {
        let inside = fs::read_link(&link)
            .is_ok_and(|target| target.parent() == Some(Path::new("")) && link.exists());
        if !inside {
            fs::remove_file(&link).map_err(failed)?;
        }
    }
    Ok(kept)
}

pub fn keep_only_cursors(theme: &Path) -> Result<(), String> {
    for entry in fs::read_dir(theme).map_err(failed)?.flatten() {
        let (path, name) = (entry.path(), entry.file_name());
        let kind = entry.file_type().map_err(failed)?;
        if kind.is_dir() && name == CURSORS {
            continue;
        }
        if kind.is_file() && KEPT_FILES.iter().any(|kept| name == *kept) {
            continue;
        }
        if kind.is_dir() {
            fs::remove_dir_all(&path).map_err(failed)?;
        } else {
            fs::remove_file(&path).map_err(failed)?;
        }
    }
    if keep_cursors(&theme.join(CURSORS))? == 0 {
        return Err(t!(L10N, "desktop-cursors-no-linux-theme"));
    }
    Ok(())
}
