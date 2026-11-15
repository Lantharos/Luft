use luft_i18n::t;
use serde::{Deserialize, Serialize};

use crate::l10n::L10N;
use crate::store::{Flag, Store};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Operation {
    Flag {
        mailbox: i64,
        messages: Vec<Target>,
        flag: Flag,
        value: bool,
    },
    Move {
        from: i64,
        to: i64,
        messages: Vec<Target>,
    },
    Destroy {
        mailbox: i64,
        messages: Vec<Target>,
    },
    Append {
        mailbox: i64,
        raw: String,
        draft: bool,
    },
    Identity {
        id: i64,
        remote: Option<String>,
    },
    DiscardPlaced {
        remote: String,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Target {
    pub id: i64,
    pub remote: String,
}

pub fn resolve(store: &Store, mailbox: i64, messages: &[Target]) -> Result<Vec<Target>, String> {
    let mut resolved = Vec::new();
    for moved in messages {
        let remote = if moved.remote.starts_with('~') {
            match store.current_remote(moved.id)? {
                Some(remote) => Some(remote),
                None => store.departed_remote(mailbox, moved.id)?,
            }
        } else {
            Some(moved.remote.clone())
        };
        if let Some(remote) = remote.filter(|remote| !remote.starts_with('~')) {
            resolved.push(Target {
                id: moved.id,
                remote,
            });
        }
    }
    Ok(resolved)
}

pub struct GaveUp {
    pub message: String,
    pub resync: Option<i64>,
}

pub fn give_up(
    store: &Store,
    operation: &Operation,
    error: &str,
) -> Result<Option<GaveUp>, String> {
    let (failure, messages, resync) = match operation {
        Operation::Move { from, to, messages } => {
            let moved: Vec<(i64, String)> = messages
                .iter()
                .map(|target| (target.id, target.remote.clone()))
                .collect();
            store.return_moved(*from, *to, &moved)?;
            ("mailman-error-move-failed", messages, None)
        }
        Operation::Destroy { mailbox, messages } => {
            let ids: Vec<i64> = messages.iter().map(|target| target.id).collect();
            store.return_destroyed(*mailbox, &ids)?;
            ("mailman-error-delete-failed", messages, Some(*mailbox))
        }
        Operation::Append { draft: false, .. } => {
            return Ok(Some(GaveUp {
                message: t!(L10N, "mailman-error-copy-not-saved", error = error),
                resync: None,
            }));
        }
        _ => return Ok(None),
    };
    Ok(Some(GaveUp {
        message: t!(L10N, failure, count = messages.len(), error = error),
        resync,
    }))
}
