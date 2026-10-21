use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

use anyhow::{Result, bail};
use luft_accounts::types::{DriveState, Provider};
use serde_json::{Map, Value, json};

use super::{remote, union, union_name, upkeep};
use crate::hub::Hub;
use crate::notify::SETTINGS;
use crate::providers::{self, trouble};
use crate::store::{Record, Secret};

const NOT_CONNECTED: i32 = libc::ENOTCONN;

pub async fn attach(hub: &Hub, account: &str) -> Result<()> {
    let lock = hub.drives.lock(account);
    let _attaching = lock.lock().await;
    let Some(record) = hub.records().get(account).cloned() else {
        return Ok(());
    };
    hub.drives.update(account, |live| {
        live.state = DriveState::Connecting;
        live.problem = None;
    });
    hub.drives_changed().await;
    let outcome = connect(hub, &record).await;
    if let Err(error) = &outcome {
        settle_failure(hub, &record, &error.to_string()).await;
    }
    hub.drives_changed().await;
    outcome
}

async fn connect(hub: &Hub, record: &Record) -> Result<()> {
    let Some(secret) = hub.keyring.load(&record.id).await? else {
        bail!("unauthorized: the saved sign-in is missing");
    };
    install(hub, record, &secret).await?;
    let target = hub.paths.cloud.join(&record.name);
    release(hub, &record.id).await;
    prepare(&target).await?;
    hub.rclone
        .mount(&union(&record.id), &target, &record.name)
        .await?;
    hub.drives.update(&record.id, |live| {
        live.mounted = Some(target);
        live.fallback = false;
        live.state = DriveState::Ready;
    });
    if record.sign_in_again.is_some() {
        hub.records()
            .edit(&record.id, |record| record.sign_in_again = None)?;
        hub.accounts_changed().await;
    }
    upkeep::check(hub, &record.id).await;
    Ok(())
}

async fn install(hub: &Hub, record: &Record, secret: &Secret) -> Result<()> {
    let mut parameters = providers::parameters(record, secret);
    let kind = providers::backend(record.provider);
    if record.provider == Provider::Icloud {
        install_signed_in_apple_account(hub, record, kind, &mut parameters).await?;
    } else {
        hub.rclone
            .configure(
                &record.id,
                kind,
                parameters,
                json!({"obscure": true, "nonInteractive": true}),
            )
            .await?;
    }
    let kept = hub.paths.kept(&record.id);
    fs::create_dir_all(&kept)?;
    let upstreams = format!("\"{}:nc\" {}", kept.display(), remote(&record.id));
    let mut union_parameters = Map::new();
    union_parameters.insert("upstreams".into(), Value::String(upstreams));
    union_parameters.insert("action_policy".into(), "epff".into());
    union_parameters.insert("create_policy".into(), "epff".into());
    union_parameters.insert("search_policy".into(), "ff".into());
    hub.rclone
        .configure(
            &union_name(&record.id),
            "union",
            union_parameters,
            json!({"nonInteractive": true}),
        )
        .await?;
    Ok(())
}

async fn install_signed_in_apple_account(
    hub: &Hub,
    record: &Record,
    kind: &str,
    parameters: &mut Map<String, Value>,
) -> Result<()> {
    let apple_id = parameters.remove("apple_id").unwrap_or_default();
    match hub
        .rclone
        .configure(
            &record.id,
            kind,
            parameters.clone(),
            json!({"obscure": true, "nonInteractive": true}),
        )
        .await
    {
        Err(error) if error.to_string().contains("Apple ID is required") => {}
        Err(error) => return Err(error),
        Ok(_) => {}
    }
    let mut identity = Map::new();
    identity.insert("apple_id".into(), apple_id);
    hub.rclone
        .update_configuring(&record.id, identity, "2fa_do", "")
        .await?;
    Ok(())
}

async fn settle_failure(hub: &Hub, record: &Record, error: &str) {
    let (state, problem) = match trouble::classify(record.provider, error) {
        trouble::Trouble::SignInAgain(reason) => {
            ask_to_sign_in(hub, record, &reason).await;
            (DriveState::SignInAgain, reason)
        }
        trouble::Trouble::Offline => (
            DriveState::Offline,
            trouble::explain(record.provider, error),
        ),
        trouble::Trouble::Other(message) => (DriveState::Problem, message),
    };
    eprintln!("{} isn't connected: {error}", record.name);
    hub.drives.update(&record.id, |live| {
        live.state = state;
        live.problem = Some(problem);
    });
    if let Err(error) = mount_kept_copy(hub, record).await {
        eprintln!(
            "The kept files of {} aren't available: {error:#}",
            record.name
        );
    }
}

pub async fn ask_to_sign_in(hub: &Hub, record: &Record, reason: &str) {
    let first_time = record.sign_in_again.is_none();
    if hub
        .records()
        .edit(&record.id, |record| {
            record.sign_in_again = Some(reason.to_owned())
        })
        .is_err()
    {
        return;
    }
    hub.accounts_changed().await;
    if first_time {
        hub.notifier
            .send(
                &format!("Sign in to {} again", record.name),
                reason,
                SETTINGS,
            )
            .await;
    }
}

async fn mount_kept_copy(hub: &Hub, record: &Record) -> Result<()> {
    if record.kept.is_empty() || hub.drives.get(&record.id).mounted.is_some() {
        return Ok(());
    }
    let target = hub.paths.cloud.join(&record.name);
    prepare(&target).await?;
    let kept = hub.paths.kept(&record.id);
    hub.rclone
        .mount(&kept.to_string_lossy(), &target, &record.name)
        .await?;
    hub.drives.update(&record.id, |live| {
        live.mounted = Some(target);
        live.fallback = true;
    });
    Ok(())
}

async fn release(hub: &Hub, account: &str) {
    let mounted = hub.drives.update(account, |live| live.mounted.take());
    if let Some(mounted) = mounted
        && let Err(error) = hub.rclone.unmount(&mounted).await
    {
        eprintln!("Couldn't unmount {}: {error:#}", mounted.display());
        detach_stale(&mounted).await;
    }
}

async fn prepare(target: &Path) -> Result<()> {
    if fs::metadata(target).is_err_and(|error| error.raw_os_error() == Some(NOT_CONNECTED)) {
        detach_stale(target).await;
    }
    fs::create_dir_all(target)?;
    if fs::read_dir(target)?.next().is_some() {
        bail!(
            "{} already has files in it, so the drive can't open there",
            target.display()
        );
    }
    Ok(())
}

async fn detach_stale(target: &Path) {
    let detached = tokio::process::Command::new("fusermount3")
        .arg("-uz")
        .arg(target)
        .status()
        .await;
    if !detached.is_ok_and(|status| status.success()) {
        eprintln!("Couldn't detach {}", target.display());
    }
}

pub fn is_stale(target: &Path) -> bool {
    fs::metadata(target).is_err_and(|error| error.raw_os_error() == Some(NOT_CONNECTED))
}

pub async fn detach(hub: &Hub, record: &Record) {
    let lock = hub.drives.lock(&record.id);
    let _detaching = lock.lock().await;
    release(hub, &record.id).await;
    for name in [union_name(&record.id), record.id.clone()] {
        let _ = hub.rclone.forget_remote(&name).await;
    }
    remove_empty(&hub.paths.cloud.join(&record.name));
    hub.drives.forget(&record.id);
}

pub async fn rename(hub: &Hub, record: &Record, name: &str) -> Result<()> {
    {
        let lock = hub.drives.lock(&record.id);
        let _renaming = lock.lock().await;
        release(hub, &record.id).await;
        remove_empty(&hub.paths.cloud.join(&record.name));
        hub.records()
            .edit(&record.id, |record| record.name = name.to_owned())?;
    }
    attach(hub, &record.id).await
}

fn remove_empty(folder: &PathBuf) {
    match fs::remove_dir(folder) {
        Ok(()) => {}
        Err(error)
            if matches!(
                error.kind(),
                ErrorKind::NotFound | ErrorKind::DirectoryNotEmpty
            ) => {}
        Err(error) => eprintln!("Couldn't remove {}: {error}", folder.display()),
    }
}
