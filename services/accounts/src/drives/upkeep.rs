use std::collections::HashSet;
use std::sync::Arc;
use std::time::Duration;

use luft_accounts::types::{DriveState, Usage};
use tokio::sync::broadcast::error::RecvError;
use tokio::time::{Instant, sleep_until};

use super::attach::{self, is_stale};
use super::keep::{self, sync};
use super::{conflicts, filters, remote, union};
use crate::hub::Hub;
use crate::providers::trouble::{self, Trouble};

const BUSY: Duration = Duration::from_secs(2);
const HELD: Duration = Duration::from_secs(15);
const SETTLE: Duration = Duration::from_secs(3);
const SYNC_EVERY: Duration = Duration::from_secs(5 * 60);
const CHECK_EVERY: Duration = Duration::from_secs(10 * 60);
const RETRY_EVERY: Duration = Duration::from_secs(30);
const HOLD: f64 = 120.0;
const HOLD_WHEN_BELOW: f64 = 30.0;
const RELEASE: f64 = -1_000_000_000.0;
const QUEUED_FOR_UPLOAD: &str = "vfs cache: queuing for upload";

struct Rounds {
    synced: Instant,
    checked: Instant,
    retried: Instant,
}

impl Rounds {
    fn new() -> Self {
        let now = Instant::now();
        Self {
            synced: now,
            checked: now,
            retried: now,
        }
    }

    fn next(&self, hub: &Hub) -> Instant {
        let mut next = (self.synced + SYNC_EVERY).min(self.checked + CHECK_EVERY);
        if hub.conditions().online && unready(hub) {
            next = next.min(self.retried + RETRY_EVERY);
        }
        if busy(hub) {
            let every = if hub.conditions().pause.is_some() {
                HELD
            } else {
                BUSY
            };
            next = next.min(Instant::now() + every);
        }
        next
    }

    async fn run(&mut self, hub: &Arc<Hub>) {
        if busy(hub) {
            follow_uploads(hub, false).await;
            sync_settled(hub);
        }
        if self.synced.elapsed() >= SYNC_EVERY {
            self.synced = Instant::now();
            sync_all(hub);
        }
        if self.checked.elapsed() >= CHECK_EVERY {
            self.checked = Instant::now();
            for account in accounts(hub) {
                check(hub, &account).await;
            }
        } else if self.retried.elapsed() >= RETRY_EVERY && hub.conditions().online {
            self.retried = Instant::now();
            retry_unready(hub).await;
        }
    }
}

pub async fn run(hub: Arc<Hub>) {
    let mut starts = hub.rclone.starts.clone();
    let mut conditions = hub.conditions.clone();
    let mut woke = hub.woke.subscribe();
    let mut logs = hub.rclone.logs();
    let mut was = hub.conditions();
    let mut rounds = Rounds::new();
    for account in accounts(&hub) {
        spawn_attach(&hub, account);
    }
    loop {
        tokio::select! {
            started = starts.changed() => {
                if started.is_err() {
                    return;
                }
                if *starts.borrow_and_update() > 1 {
                    for account in accounts(&hub) {
                        spawn_attach(&hub, account);
                    }
                }
            }
            changed = conditions.changed() => {
                if changed.is_err() {
                    return;
                }
                let now = hub.conditions();
                if now.online && !was.online {
                    recover(&hub);
                }
                if now.pause != was.pause {
                    follow_uploads(&hub, was.pause.is_some()).await;
                    hub.drives_changed().await;
                    if now.pause.is_none() {
                        sync_all(&hub);
                    }
                }
                was = now;
            }
            _ = woke.recv() => recover(&hub),
            line = logs.recv() => match line {
                Ok(line) if !line.contains(QUEUED_FOR_UPLOAD) => {}
                Err(RecvError::Closed) => return,
                _ => follow_uploads(&hub, false).await,
            },
            () = hub.drives.changed.notified() => {}
            () = sleep_until(rounds.next(&hub)) => rounds.run(&hub).await,
        }
    }
}

fn busy(hub: &Hub) -> bool {
    hub.drives
        .live()
        .values()
        .any(|live| !live.uploads.is_empty() || live.dirty.is_some())
}

fn unready(hub: &Hub) -> bool {
    hub.records().all().iter().any(|record| {
        record.sign_in_again.is_none()
            && matches!(
                hub.drives.get(&record.id).state,
                DriveState::Offline | DriveState::Problem
            )
    })
}

fn accounts(hub: &Hub) -> Vec<String> {
    hub.records()
        .all()
        .iter()
        .map(|record| record.id.clone())
        .collect()
}

fn spawn_attach(hub: &Arc<Hub>, account: String) {
    let hub = hub.clone();
    tokio::spawn(async move {
        if attach::attach(&hub, &account).await.is_ok() {
            keep::report(&hub, &account, sync(&hub, &account, false).await).await;
        }
    });
}

fn spawn_sync(hub: &Arc<Hub>, account: String) {
    let hub = hub.clone();
    tokio::spawn(
        async move { keep::report(&hub, &account, sync(&hub, &account, false).await).await },
    );
}

fn sync_all(hub: &Arc<Hub>) {
    for account in accounts(hub) {
        spawn_sync(hub, account);
    }
}

fn sync_settled(hub: &Arc<Hub>) {
    let settled: Vec<String> = hub
        .drives
        .live()
        .iter()
        .filter(|(_, live)| {
            live.dirty.is_some_and(|since| since.elapsed() >= SETTLE) && !live.syncing
        })
        .map(|(account, _)| account.clone())
        .collect();
    for account in settled {
        spawn_sync(hub, account);
    }
}

async fn retry_unready(hub: &Arc<Hub>) {
    let records = hub.records().all().to_vec();
    for record in records {
        let live = hub.drives.get(&record.id);
        if record.sign_in_again.is_some()
            || !matches!(live.state, DriveState::Offline | DriveState::Problem)
        {
            continue;
        }
        if live.mounted.is_some() && !live.fallback {
            check(hub, &record.id).await;
            if hub.drives.get(&record.id).state == DriveState::Ready {
                spawn_sync(hub, record.id);
            }
        } else {
            spawn_attach(hub, record.id);
        }
    }
}

fn recover(hub: &Arc<Hub>) {
    for record in hub.records().all().to_vec() {
        let live = hub.drives.get(&record.id);
        let broken = live.state != DriveState::Ready
            || live.fallback
            || live.mounted.as_deref().is_none_or(is_stale);
        if broken {
            spawn_attach(hub, record.id);
            continue;
        }
        let hub = hub.clone();
        tokio::spawn(async move {
            let _ = hub.rclone.refresh(&union(&record.id)).await;
            check(&hub, &record.id).await;
            keep::report(&hub, &record.id, sync(&hub, &record.id, false).await).await;
        });
    }
}

pub async fn check(hub: &Hub, account: &str) {
    let Some(record) = hub.records().get(account).cloned() else {
        return;
    };
    let live = hub.drives.get(account);
    if live.mounted.is_none() || live.fallback {
        return;
    }
    let fs = remote(account);
    let usage = match hub.rclone.about(&fs).await {
        Ok(about) => Ok(about["total"]
            .as_u64()
            .zip(about["used"].as_u64())
            .map(|(total, used)| Usage { used, total })),
        Err(error) if error.to_string().contains("doesn't support about") => {
            hub.rclone.list_top(&fs).await.map(|_| None)
        }
        Err(error) => Err(error),
    };
    match usage {
        Ok(usage) => {
            hub.drives.update(account, |live| {
                live.state = DriveState::Ready;
                live.problem = None;
                live.usage = usage.or(live.usage);
            });
            keep_secret(hub, account).await;
        }
        Err(error) => {
            let message = error.to_string();
            let (state, problem) = match trouble::classify(record.provider, &message) {
                Trouble::SignInAgain(reason) => {
                    attach::ask_to_sign_in(hub, &record, &reason).await;
                    (DriveState::SignInAgain, reason)
                }
                Trouble::Offline => (
                    DriveState::Offline,
                    trouble::explain(record.provider, &message),
                ),
                Trouble::Other(problem) => (DriveState::Problem, problem),
            };
            hub.drives.update(account, |live| {
                live.state = state;
                live.problem = Some(problem);
            });
        }
    }
    conflicts::prune(hub, &record).await;
    hub.drives_changed().await;
}

pub async fn keep_secret(hub: &Hub, account: &str) {
    let refreshed = async {
        let live = hub.rclone.remote(account).await?;
        let Some(mut secret) = hub.keyring.load(account).await? else {
            return anyhow::Ok(());
        };
        if secret.absorb(&live) {
            hub.keyring.store(account, &secret).await?;
        }
        Ok(())
    };
    if let Err(error) = refreshed.await {
        eprintln!("Couldn't keep the refreshed sign-in: {error:#}");
    }
}

async fn follow_uploads(hub: &Hub, release: bool) {
    let paused = hub.conditions().pause.is_some();
    let mounted: Vec<String> = hub
        .drives
        .live()
        .iter()
        .filter(|(_, live)| live.mounted.is_some() && !live.fallback)
        .map(|(account, _)| account.clone())
        .collect();
    let mut changed = false;
    for account in mounted {
        let fs = union(&account);
        let Ok(queue) = hub.rclone.queue(&fs).await else {
            continue;
        };
        for item in queue.iter().filter(|item| !item.uploading) {
            let expiry = if paused && item.expiry < HOLD_WHEN_BELOW {
                Some(HOLD)
            } else if release && !paused {
                Some(RELEASE)
            } else {
                None
            };
            if let Some(expiry) = expiry {
                let _ = hub.rclone.hold_upload(&fs, item.id, expiry).await;
            }
        }
        let uploads: HashSet<String> = queue.into_iter().map(|item| item.name).collect();
        let Some(record) = hub.records().get(&account).cloned() else {
            continue;
        };
        changed |= hub.drives.update(&account, |live| {
            let landed_in_kept = live
                .uploads
                .difference(&uploads)
                .any(|upload| filters::keeps(&record.kept, &record.skipped, upload));
            if landed_in_kept {
                live.dirty = Some(std::time::Instant::now());
            }
            std::mem::replace(&mut live.uploads, uploads.clone()) != uploads
        });
    }
    if changed {
        hub.drives_changed().await;
    }
}
