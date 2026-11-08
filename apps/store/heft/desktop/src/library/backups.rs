use std::fs;
use std::io;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use super::{root, state_folder, trash};

const KEPT: usize = 14;
const FIRST_AFTER: Duration = Duration::from_secs(60);
const CHECK_EVERY: Duration = Duration::from_secs(60 * 60);
const APPENDED: &str = "journal";

pub fn start() {
    luft_app::spawn(async {
        tokio::time::sleep(FIRST_AFTER).await;
        loop {
            let _ = trash::purge_expired();
            if let Err(error) = take() {
                eprintln!("Heft could not back up the library: {error}");
            }
            tokio::time::sleep(CHECK_EVERY).await;
        }
    });
}

fn today() -> String {
    let days = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs() / 86_400) as i64;
    let shifted = days + 719_468;
    let era = shifted.div_euclid(146_097);
    let day_of_era = shifted.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_index = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_index + 2) / 5 + 1;
    let month = if month_index < 10 { month_index + 3 } else { month_index - 9 };
    let year = year_of_era + era * 400 + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

fn snapshots(folder: &Path) -> Vec<PathBuf> {
    let mut found: Vec<PathBuf> = fs::read_dir(folder)
        .map(|entries| entries.flatten().map(|entry| entry.path()).collect())
        .unwrap_or_default();
    found.retain(|path| !path.extension().is_some_and(|extension| extension == "partial"));
    found.sort();
    found
}

fn take() -> io::Result<()> {
    let library = root().map_err(io::Error::other)?;
    if !library.exists() {
        return Ok(());
    }
    let folder = state_folder().map_err(io::Error::other)?.join("backups");
    fs::create_dir_all(&folder)?;
    let target = folder.join(today());
    if target.exists() {
        return Ok(());
    }
    let previous = snapshots(&folder).pop();
    let partial = target.with_extension("partial");
    let _ = fs::remove_dir_all(&partial);
    mirror(&library, previous.as_deref(), &partial)?;
    fs::rename(&partial, &target)?;
    let all = snapshots(&folder);
    for old in &all[..all.len().saturating_sub(KEPT)] {
        fs::remove_dir_all(old)?;
    }
    Ok(())
}

fn unchanged(source: &fs::Metadata, earlier: &Path) -> bool {
    fs::metadata(earlier).is_ok_and(|kept| {
        kept.len() == source.len() && kept.mtime() == source.mtime() && kept.mtime_nsec() == source.mtime_nsec()
    })
}

fn mirror(source: &Path, previous: Option<&Path>, target: &Path) -> io::Result<()> {
    fs::create_dir_all(target)?;
    for entry in fs::read_dir(source)?.flatten() {
        let name = entry.file_name();
        if name.to_string_lossy().starts_with('.') {
            continue;
        }
        let from = entry.path();
        let to = target.join(&name);
        let earlier = previous.map(|previous| previous.join(&name));
        let metadata = entry.metadata()?;
        if metadata.is_dir() {
            mirror(&from, earlier.as_deref(), &to)?;
            continue;
        }
        let appended = from.extension().is_some_and(|extension| extension == APPENDED);
        match earlier {
            Some(earlier) if !appended && unchanged(&metadata, &earlier) => fs::hard_link(earlier, &to)?,
            _ => {
                fs::copy(&from, &to)?;
                let file = fs::File::options().write(true).open(&to)?;
                file.set_modified(metadata.modified()?)?;
            }
        }
    }
    Ok(())
}
