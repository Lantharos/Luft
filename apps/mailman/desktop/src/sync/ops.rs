use serde::{Deserialize, Serialize};

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
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Target {
    pub id: i64,
    pub remote: String,
}

pub fn resolve(store: &Store, messages: &[Target]) -> Result<Vec<Target>, String> {
    let mut resolved = Vec::new();
    for moved in messages {
        let remote = if moved.remote.starts_with('~') {
            store.current_remote(moved.id)?
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
