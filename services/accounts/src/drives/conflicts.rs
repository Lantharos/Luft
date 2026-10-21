use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::Result;
use luft_accounts::types::{Conflict, Side};

use crate::hub::Hub;
use crate::store::Record;

const MARKS: [(&str, Side); 2] = [
    (".luft-device", Side::ThisDevice),
    (".luft-cloud", Side::Cloud),
];

struct Found {
    original: String,
    side: Side,
    extension: String,
    stem: String,
}

fn parse(name: &str) -> Option<Found> {
    MARKS.iter().find_map(|(mark, side)| {
        let at = name.rfind(mark)?;
        let rest = &name[at + mark.len()..];
        let digits = rest.chars().take_while(char::is_ascii_digit).count();
        if digits == 0 {
            return None;
        }
        let extension = &rest[digits..];
        if !(extension.is_empty() || extension.starts_with('.') && !extension[1..].contains('.')) {
            return None;
        }
        let stem = &name[..at];
        Some(Found {
            original: format!("{stem}{extension}"),
            side: *side,
            extension: extension.to_owned(),
            stem: stem.to_owned(),
        })
    })
}

fn copy_name(found: &Found, cloud: &str, number: u32) -> String {
    let from = match found.side {
        Side::ThisDevice => "this device",
        Side::Cloud => cloud,
    };
    let number = if number > 1 {
        format!(" {number}")
    } else {
        String::new()
    };
    format!(
        "{} (copy from {from}{number}){}",
        found.stem, found.extension
    )
}

pub async fn settle(hub: &Hub, record: &Record) -> Result<bool> {
    let kept = hub.paths.kept(&record.id);
    let mut found = Vec::new();
    walk(&kept, "", &mut found)?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_secs());
    let cloud = record.provider.name();
    let mut settled = Vec::new();
    for (folder, name) in found {
        let Some(conflict) = parse(&name) else {
            continue;
        };
        let directory = kept.join(&folder);
        let free = (1..)
            .map(|number| copy_name(&conflict, cloud, number))
            .find(|candidate| !directory.join(candidate).exists())
            .expect("some number is free");
        fs::rename(directory.join(&name), directory.join(&free))?;
        let join = |name: &str| {
            if folder.is_empty() {
                name.to_owned()
            } else {
                format!("{folder}/{name}")
            }
        };
        settled.push(Conflict {
            path: join(&conflict.original),
            copy: join(&free),
            copy_from: conflict.side,
            at: now,
        });
    }
    if settled.is_empty() {
        return Ok(false);
    }
    for conflict in &settled {
        let name = conflict.path.rsplit('/').next().unwrap_or(&conflict.path);
        let copy = conflict.copy.rsplit('/').next().unwrap_or(&conflict.copy);
        let folder = hub
            .paths
            .cloud
            .join(&record.name)
            .join(super::keep::parent(&conflict.path));
        hub.notifier
            .send(
                &format!("Both versions of {name} were kept"),
                &format!("It changed on this computer and in {cloud} at the same time. The newer version kept the name, and the other one is now “{copy}”."),
                &folder.to_string_lossy(),
            )
            .await;
    }
    hub.records()
        .edit(&record.id, |record| record.conflicts.extend(settled))?;
    hub.drives_changed().await;
    Ok(true)
}

fn walk(root: &Path, folder: &str, found: &mut Vec<(String, String)>) -> Result<()> {
    let Ok(entries) = fs::read_dir(root.join(folder)) else {
        return Ok(());
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        let relative = if folder.is_empty() {
            name.clone()
        } else {
            format!("{folder}/{name}")
        };
        if entry.file_type()?.is_dir() {
            walk(root, &relative, found)?;
        } else if name.contains(".luft-") {
            found.push((folder.to_owned(), name));
        }
    }
    Ok(())
}

pub async fn prune(hub: &Hub, record: &Record) -> bool {
    if record.conflicts.is_empty() {
        return false;
    }
    let drive = hub.paths.cloud.join(&record.name);
    let copies: Vec<String> = record
        .conflicts
        .iter()
        .map(|conflict| conflict.copy.clone())
        .collect();
    let Ok(gone) = tokio::task::spawn_blocking(move || {
        copies
            .into_iter()
            .filter(|copy| !drive.join(copy).exists())
            .collect::<Vec<_>>()
    })
    .await
    else {
        return false;
    };
    if gone.is_empty() {
        return false;
    }
    hub.records()
        .edit(&record.id, |record| {
            record
                .conflicts
                .retain(|conflict| !gone.contains(&conflict.copy))
        })
        .is_ok()
}

#[cfg(test)]
mod tests {
    use luft_accounts::types::Side;

    use super::{copy_name, parse};

    #[test]
    fn conflict_copies_get_readable_names() {
        let found = parse("report.luft-cloud1.docx").unwrap();
        assert_eq!(found.original, "report.docx");
        assert_eq!(found.side, Side::Cloud);
        assert_eq!(
            copy_name(&found, "OneDrive", 1),
            "report (copy from OneDrive).docx"
        );
        let found = parse("notes.luft-device2").unwrap();
        assert_eq!(
            copy_name(&found, "Dropbox", 2),
            "notes (copy from this device 2)"
        );
        assert!(parse("report.luft-cloud.docx").is_none());
        assert!(parse("plain.txt").is_none());
    }
}
