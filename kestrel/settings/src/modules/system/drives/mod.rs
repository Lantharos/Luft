mod candidates;
mod linux;
mod udisks;
mod windows;

use std::collections::HashSet;
use std::path::PathBuf;

use futures_util::future::join_all;
use luft_dbus::objects::{Objects, settle, signals};
use zbus::Connection;

use crate::context::Context;
use crate::shared::notify;
use candidates::{Candidate, Family};
use linux::{Verdict, Verdicts};

const SCHEMA: &str = "com.lantharos.kestrel.drives";
const MOUNT_INTERNAL: &str = "mount-internal";
const READ_ONLY: &str = "ro";

pub async fn start(context: &Context) -> zbus::Result<()> {
    let mut settings = context.settings.watch(&[SCHEMA]).await;
    let mut changes = signals(&context.system, udisks::SERVICE, udisks::ROOT)
        .await
        .map_err(zbus::Error::Failure)?;
    let system = context.system.clone();
    let session = context.session.clone();
    tokio::spawn(async move {
        if let Err(error) = notify::server_ready(&session).await {
            eprintln!("Couldn't wait for the desktop before mounting drives: {error}");
        }
        let mut drives = Drives {
            system,
            session,
            tried: HashSet::new(),
            verdicts: Verdicts::load(),
        };
        loop {
            if settings.get::<bool>(SCHEMA, MOUNT_INTERNAL) {
                drives.mount_new().await;
            }
            tokio::select! {
                _ = settings.changed() => {}
                changed = settle(&mut changes) => if !changed { return },
            }
        }
    });
    Ok(())
}

struct Drives {
    system: Connection,
    session: Connection,
    tried: HashSet<String>,
    verdicts: Verdicts,
}

#[derive(Default)]
struct Outcome {
    learned: Option<Verdict>,
    windows_read_only: bool,
}

impl Drives {
    async fn mount_new(&mut self) {
        let objects = match Objects::fetch(&self.system, udisks::SERVICE, udisks::ROOT).await {
            Ok(objects) => objects,
            Err(error) => {
                eprintln!("Couldn't list drives: {error}");
                return;
            }
        };
        self.tried
            .retain(|block| objects.get(block, udisks::BLOCK).is_some());
        let fresh: Vec<Candidate> = candidates::find(&objects)
            .into_iter()
            .filter(|candidate| self.tried.insert(candidate.block.clone()))
            .collect();
        let hibernated = match fresh.iter().any(|candidate| candidate.family == Family::Windows) {
            true => windows::hibernated(&self.system)
                .await
                .inspect_err(|error| {
                    eprintln!("Couldn't tell whether Windows is hibernated, so its drives stay closed: {error}")
                })
                .ok(),
            false => None,
        };
        let placed: Vec<&Candidate> = fresh
            .iter()
            .filter(|candidate| candidate.family != Family::Windows || hibernated.is_some())
            .collect();
        let outcomes = join_all(
            placed
                .iter()
                .map(|candidate| self.place(candidate, hibernated == Some(true))),
        )
        .await;
        for (candidate, outcome) in placed.iter().zip(&outcomes) {
            if let Some(verdict) = outcome.learned {
                self.verdicts.remember(&candidate.uuid, verdict);
            }
        }
        match hibernated {
            Some(true) if outcomes.iter().any(|outcome| outcome.windows_read_only) => {
                windows::tell_read_only(&self.session).await;
            }
            Some(false) => windows::forget_read_only(),
            _ => {}
        }
    }

    async fn place(&self, candidate: &Candidate, windows_hibernated: bool) -> Outcome {
        match candidate.family {
            Family::Shared => {
                self.open(candidate, candidate.read_only).await;
                Outcome::default()
            }
            Family::Windows => {
                let read_only = candidate.read_only || windows_hibernated;
                let opened = self.open(candidate, read_only).await;
                Outcome {
                    learned: None,
                    windows_read_only: opened && windows_hibernated,
                }
            }
            Family::Linux => {
                let known = self.verdicts.get(&candidate.uuid);
                let learned = match known {
                    Some(_) => None,
                    None => self.look_into(candidate).await,
                };
                if known.or(learned) == Some(Verdict::Data) {
                    self.open(candidate, candidate.read_only).await;
                }
                Outcome {
                    learned,
                    windows_read_only: false,
                }
            }
        }
    }

    async fn open(&self, candidate: &Candidate, read_only: bool) -> bool {
        let options = if read_only { READ_ONLY } else { "" };
        udisks::mount(&self.system, &candidate.block, options)
            .await
            .inspect_err(|error| eprintln!("Couldn't mount {}: {error}", candidate.block))
            .is_ok()
    }

    async fn look_into(&self, candidate: &Candidate) -> Option<Verdict> {
        let options = linux::looking_options(&candidate.filesystem);
        let at = udisks::mount(&self.system, &candidate.block, options)
            .await
            .inspect_err(|error| eprintln!("Couldn't look into {}: {error}", candidate.block))
            .ok()?;
        let filesystem = candidate.filesystem.clone();
        let system = tokio::task::spawn_blocking(move || {
            linux::holds_system(&PathBuf::from(at), &filesystem)
        })
        .await
        .unwrap_or(true);
        let block = &candidate.block;
        udisks::unmount(&self.system, block)
            .await
            .inspect_err(|error| {
                eprintln!("Couldn't unmount {block} after looking into it: {error}")
            })
            .ok()?;
        Some(if system {
            Verdict::System
        } else {
            Verdict::Data
        })
    }
}
