use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::state::MailmanState;
use crate::store::{Flag, Located, Role};
use crate::sync::{Operation, Target};

#[derive(Deserialize)]
#[serde(tag = "action", rename_all = "camelCase")]
pub enum Action {
    Archive,
    Trash,
    Spam,
    Inbox,
    DeleteForever,
    Read,
    Unread,
    Star,
    Unstar,
    Snooze { until: i64 },
    Unsnooze,
    Move { mailbox: i64 },
    Restore { moves: Vec<Placement> },
}

#[derive(Deserialize)]
pub struct Request {
    #[serde(flatten)]
    action: Action,
    #[serde(default)]
    threads: Vec<i64>,
    #[serde(default)]
    ids: Vec<i64>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Placement {
    id: i64,
    mailbox: i64,
}

#[derive(Serialize, Default)]
pub struct Undo {
    moves: Vec<Placement>,
}

fn targets(state: &MailmanState, request: &Request) -> Result<Vec<Located>, String> {
    let mut found = state.store.locate(&request.ids)?;
    found.extend(state.store.thread_messages(&request.threads)?);
    found.sort_by_key(|located| located.id);
    found.dedup_by_key(|located| located.id);
    Ok(found)
}

fn target(located: &Located) -> Target {
    Target {
        id: located.id,
        remote: located.remote.clone(),
    }
}

fn flag(state: &MailmanState, messages: &[Located], flag: Flag, value: bool) -> Result<(), String> {
    let ids: Vec<i64> = messages.iter().map(|located| located.id).collect();
    state.store.set_flag(&ids, flag, value)?;
    let mut grouped: BTreeMap<(i64, i64), Vec<Target>> = BTreeMap::new();
    for located in messages {
        grouped
            .entry((located.account, located.mailbox))
            .or_default()
            .push(target(located));
    }
    for ((account, mailbox), messages) in grouped {
        state.engine.queue(
            account,
            &Operation::Flag {
                mailbox,
                messages,
                flag,
                value,
            },
        )?;
    }
    Ok(())
}

fn destination(state: &MailmanState, account: i64, roles: &[Role]) -> Result<i64, String> {
    for role in roles {
        if let Some(mailbox) = state.store.mailbox_with_role(account, *role)? {
            return Ok(mailbox.id);
        }
    }
    Err(format!("This account has no {} folder", roles[0].as_str()))
}

fn relocate(state: &MailmanState, moves: Vec<(Located, i64)>) -> Result<Undo, String> {
    let mut undo = Undo::default();
    let mut grouped: BTreeMap<(i64, i64, i64), Vec<Target>> = BTreeMap::new();
    for (located, to) in moves {
        if located.mailbox == to {
            continue;
        }
        undo.moves.push(Placement {
            id: located.id,
            mailbox: located.mailbox,
        });
        grouped
            .entry((located.account, located.mailbox, to))
            .or_default()
            .push(target(&located));
    }
    for ((account, from, to), messages) in grouped {
        let ids: Vec<i64> = messages.iter().map(|target| target.id).collect();
        state.store.relocate(&ids, to)?;
        state.store.clear_nudges(&ids)?;
        state
            .engine
            .queue(account, &Operation::Move { from, to, messages })?;
    }
    Ok(undo)
}

fn move_to(state: &MailmanState, messages: Vec<Located>, roles: &[Role]) -> Result<Undo, String> {
    let mut moves = Vec::new();
    for located in messages {
        let to = destination(state, located.account, roles)?;
        moves.push((located, to));
    }
    relocate(state, moves)
}

pub fn act(state: &MailmanState, request: Request) -> Result<Undo, String> {
    let messages = targets(state, &request)?;
    let ids: Vec<i64> = messages.iter().map(|located| located.id).collect();
    let in_inbox = |messages: Vec<Located>| {
        messages
            .into_iter()
            .filter(|located| located.role == Some(Role::Inbox))
            .collect::<Vec<_>>()
    };
    let outside_trash = |messages: Vec<Located>| {
        messages
            .into_iter()
            .filter(|located| located.role != Some(Role::Trash))
            .collect::<Vec<_>>()
    };
    match request.action {
        Action::Archive => {
            state.store.clear_nudges(&ids)?;
            state.store.snooze(&ids, None)?;
            move_to(state, in_inbox(messages), &[Role::Archive, Role::All])
        }
        Action::Trash => {
            let (trashed, others): (Vec<_>, Vec<_>) = messages
                .into_iter()
                .partition(|located| located.role == Some(Role::Trash));
            if others.is_empty() {
                return destroy(state, trashed);
            }
            move_to(state, outside_trash(others), &[Role::Trash])
        }
        Action::Spam => move_to(state, outside_trash(messages), &[Role::Junk]),
        Action::Inbox => move_to(
            state,
            messages
                .into_iter()
                .filter(|located| located.role != Some(Role::Sent))
                .collect(),
            &[Role::Inbox],
        ),
        Action::DeleteForever => destroy(state, messages),
        Action::Read => flag(state, &messages, Flag::Seen, true).map(|_| Undo::default()),
        Action::Unread => flag(state, &messages, Flag::Seen, false).map(|_| Undo::default()),
        Action::Star | Action::Unstar => {
            let value = matches!(request.action, Action::Star);
            let latest = messages
                .into_iter()
                .max_by_key(|located| located.id)
                .into_iter()
                .collect::<Vec<_>>();
            flag(state, &latest, Flag::Flagged, value).map(|_| Undo::default())
        }
        Action::Snooze { until } => state
            .store
            .snooze(&ids, Some(until))
            .map(|_| Undo::default()),
        Action::Unsnooze => state.store.snooze(&ids, None).map(|_| Undo::default()),
        Action::Move { mailbox } => {
            let moves = messages
                .into_iter()
                .map(|located| (located, mailbox))
                .collect();
            relocate(state, moves)
        }
        Action::Restore { moves } => {
            let targets: BTreeMap<i64, i64> = moves
                .into_iter()
                .map(|placement| (placement.id, placement.mailbox))
                .collect();
            let moves = messages
                .into_iter()
                .filter_map(|located| {
                    Some((targets.get(&located.id).copied()?, located))
                        .map(|(to, located)| (located, to))
                })
                .collect();
            relocate(state, moves)
        }
    }
}

fn destroy(state: &MailmanState, messages: Vec<Located>) -> Result<Undo, String> {
    let mut grouped: BTreeMap<(i64, i64), Vec<Target>> = BTreeMap::new();
    for located in &messages {
        grouped
            .entry((located.account, located.mailbox))
            .or_default()
            .push(target(located));
    }
    let ids: Vec<i64> = messages.iter().map(|located| located.id).collect();
    state.store.forget(&ids)?;
    for ((account, mailbox), messages) in grouped {
        state
            .engine
            .queue(account, &Operation::Destroy { mailbox, messages })?;
    }
    Ok(Undo::default())
}
