use std::collections::BTreeMap;
use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::{Result, bail};
use luft_accounts::types::DriveState;
use serde_json::json;

use super::{attach, conflicts, filters, locate, remote, union, upkeep};
use crate::hub::Hub;
use crate::providers::trouble::{self, Trouble};
use crate::store::Record;

const CONFLICT_SUFFIXES: &str = "luft-device,luft-cloud";
const MAX_DELETE: u8 = 50;
const UNSYNCED: &str = "Some changes haven't synced yet. Luft keeps trying.";

#[derive(Clone, Copy)]
enum Run {
    Normal,
    Resync,
    Forced,
}

pub async fn keep(hub: &Arc<Hub>, paths: Vec<PathBuf>) -> Result<()> {
    for (account, relatives) in group(hub, &paths)? {
        hub.records().edit(&account, |record| {
            for relative in &relatives {
                filters::add(&mut record.kept, &mut record.skipped, relative);
            }
        })?;
        hub.drives_changed().await;
        let hub = hub.clone();
        tokio::spawn(
            async move { report(&hub, &account, sync(&hub, &account, false).await).await },
        );
    }
    Ok(())
}

pub async fn free(hub: &Arc<Hub>, paths: Vec<PathBuf>) -> Result<()> {
    for (account, relatives) in group(hub, &paths)? {
        if !hub.conditions().online {
            bail!(
                "Connect to the internet first, so changes made on this computer reach the cloud before the space is freed"
            );
        }
        sync(hub, &account, true).await?;
        let lock = hub.drives.lock(&account);
        let _freeing = lock.lock().await;
        let kept = hub.paths.kept(&account);
        hub.records().edit(&account, |record| {
            for relative in &relatives {
                filters::remove(&mut record.kept, &mut record.skipped, relative);
            }
        })?;
        for relative in &relatives {
            remove_local(&kept.join(relative))?;
            let _ = hub.rclone.forget(&union(&account), parent(relative)).await;
        }
        hub.drives_changed().await;
        drop(_freeing);
        let hub = hub.clone();
        tokio::spawn(
            async move { report(&hub, &account, sync(&hub, &account, false).await).await },
        );
    }
    Ok(())
}

pub async fn sync(hub: &Arc<Hub>, account: &str, force: bool) -> Result<()> {
    let lock = hub.drives.lock(account);
    let _syncing = lock.lock().await;
    let Some(record) = hub.records().get(account).cloned() else {
        return Ok(());
    };
    if record.kept.is_empty() {
        forget_history(hub, account);
        return Ok(());
    }
    let conditions = hub.conditions();
    let live = hub.drives.get(account);
    if !conditions.online
        || conditions.pause.is_some() && !force
        || live.state != DriveState::Ready
        || live.fallback
    {
        return Ok(());
    }
    hub.drives.update(account, |live| {
        live.syncing = true;
        live.dirty = None;
    });
    hub.drives_changed().await;
    let outcome = exchange(hub, &record).await;
    upkeep::keep_secret(hub, account).await;
    hub.drives.update(account, |live| live.syncing = false);
    hub.drives_changed().await;
    outcome
}

async fn exchange(hub: &Hub, record: &Record) -> Result<()> {
    let account = record.id.as_str();
    let filters_path = hub.paths.filters(account);
    let rules = filters::render(&record.kept, &record.skipped);
    let workdir = hub.paths.bisync(account);
    let reshaped = fs::read_to_string(&filters_path).ok().as_deref() != Some(rules.as_str())
        || !workdir.exists();
    if let Some(folder) = filters_path.parent() {
        fs::create_dir_all(folder)?;
    }
    fs::write(&filters_path, &rules)?;
    fs::create_dir_all(&workdir)?;
    let mut outcome = bisync(
        hub,
        account,
        if reshaped { Run::Resync } else { Run::Normal },
    )
    .await;
    let failure = outcome
        .as_ref()
        .err()
        .map(ToString::to_string)
        .unwrap_or_default();
    if failure.contains("resync") {
        outcome = bisync(hub, account, Run::Resync).await;
    } else if failure.contains("too many deletes") && holds_files(&hub.paths.kept(account)) {
        outcome = bisync(hub, account, Run::Forced).await;
    }
    if outcome.is_ok() && conflicts::settle(hub, record).await? {
        outcome = bisync(hub, account, Run::Normal).await;
    }
    for root in &record.kept {
        let _ = hub.rclone.forget(&union(account), parent(root)).await;
    }
    hub.drives.watcher.follow(account, &hub.paths.kept(account));
    outcome
}

async fn bisync(hub: &Hub, account: &str, how: Run) -> Result<()> {
    let mut input = json!({
        "path1": hub.paths.kept(account),
        "path2": remote(account),
        "workdir": hub.paths.bisync(account),
        "filtersFile": hub.paths.filters(account),
        "conflictResolve": "newer",
        "conflictLoser": "num",
        "conflictSuffix": CONFLICT_SUFFIXES,
        "compare": "size,modtime",
        "createEmptySrcDirs": true,
        "maxDelete": MAX_DELETE,
        "resilient": true,
        "recover": true,
        "maxLock": "2m",
        "_config": {"SuffixKeepExtension": true},
    });
    match how {
        Run::Resync => {
            input["resync"] = true.into();
            input["resyncMode"] = "newer".into();
        }
        Run::Forced => input["force"] = true.into(),
        Run::Normal => {}
    }
    hub.rclone.bisync(input).await
}

pub async fn report(hub: &Hub, account: &str, outcome: Result<()>) {
    let Err(error) = outcome else { return };
    let Some(record) = hub.records().get(account).cloned() else {
        return;
    };
    eprintln!("Syncing {} failed: {error:#}", record.name);
    let message = format!("{error:#}");
    match trouble::classify(record.provider, &message) {
        Trouble::SignInAgain(reason) => {
            attach::ask_to_sign_in(hub, &record, &reason).await;
            hub.drives
                .update(account, |live| live.state = DriveState::SignInAgain);
        }
        Trouble::Offline => hub.drives.update(account, |live| {
            live.state = DriveState::Offline;
            live.problem = Some(trouble::explain(record.provider, &message));
        }),
        Trouble::Other(_) => {
            upkeep::check(hub, account).await;
            hub.drives.update(account, |live| {
                if live.state == DriveState::Ready {
                    live.problem = Some(UNSYNCED.to_owned());
                }
            });
        }
    }
    hub.drives_changed().await;
}

fn forget_history(hub: &Hub, account: &str) {
    let _ = fs::remove_file(hub.paths.filters(account));
    let _ = fs::remove_dir_all(hub.paths.bisync(account));
}

fn holds_files(folder: &Path) -> bool {
    fs::read_dir(folder)
        .into_iter()
        .flatten()
        .flatten()
        .any(|entry| {
            entry.file_type().is_ok_and(|kind| !kind.is_dir()) || holds_files(&entry.path())
        })
}

fn remove_local(path: &Path) -> Result<()> {
    let removed = match fs::symlink_metadata(path) {
        Ok(metadata) if metadata.is_dir() => fs::remove_dir_all(path),
        Ok(_) => fs::remove_file(path),
        Err(error) => Err(error),
    };
    match removed {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}

pub fn parent(relative: &str) -> &str {
    relative.rsplit_once('/').map_or("", |(parent, _)| parent)
}

fn group(hub: &Hub, paths: &[PathBuf]) -> Result<BTreeMap<String, Vec<String>>> {
    let mut grouped: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for path in paths {
        let located = locate(hub, path)?;
        grouped
            .entry(located.record.id)
            .or_default()
            .push(located.relative);
    }
    Ok(grouped)
}
