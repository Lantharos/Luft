use rusqlite::{OptionalExtension, Row};
use serde::Serialize;
use serde_json::Value;

use super::views::approved;
use crate::store::{Role, Settings, Store};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationMessage {
    pub id: i64,
    pub account: i64,
    pub mailbox: i64,
    pub role: Option<Role>,
    pub message_id: Option<String>,
    pub subject: String,
    pub sender_name: String,
    pub sender: String,
    pub recipients: Value,
    pub date: i64,
    pub snippet: String,
    pub seen: bool,
    pub flagged: bool,
    pub answered: bool,
    pub draft: bool,
    pub attachments: bool,
    pub category: String,
    pub unsubscribe: Option<Value>,
    pub references: String,
}

pub struct Notable {
    pub thread: i64,
    pub sender: String,
    pub subject: String,
}

#[derive(Clone, Debug)]
pub struct Located {
    pub id: i64,
    pub account: i64,
    pub mailbox: i64,
    pub remote: String,
    pub role: Option<Role>,
}

const CONVERSATION: &str = "SELECT m.id, m.account, m.mailbox, b.role, m.message_id, m.subject, m.sender_name, m.sender, m.recipients, m.date,
    m.snippet, m.seen, m.flagged, m.answered, m.draft, m.attachments, m.category, m.unsubscribe, m.refs
    FROM messages m JOIN mailboxes b ON b.id = m.mailbox";

fn conversation_message(row: &Row) -> rusqlite::Result<ConversationMessage> {
    let role: Option<String> = row.get(3)?;
    let recipients: String = row.get(8)?;
    let unsubscribe: Option<String> = row.get(17)?;
    Ok(ConversationMessage {
        id: row.get(0)?,
        account: row.get(1)?,
        mailbox: row.get(2)?,
        role: role.as_deref().and_then(Role::parse),
        message_id: row.get(4)?,
        subject: row.get(5)?,
        sender_name: row.get(6)?,
        sender: row.get(7)?,
        recipients: serde_json::from_str(&recipients).unwrap_or(Value::Null),
        date: row.get(9)?,
        snippet: row.get(10)?,
        seen: row.get(11)?,
        flagged: row.get(12)?,
        answered: row.get(13)?,
        draft: row.get(14)?,
        attachments: row.get(15)?,
        category: row.get(16)?,
        unsubscribe: unsubscribe.and_then(|unsubscribe| serde_json::from_str(&unsubscribe).ok()),
        references: row.get(18)?,
    })
}

fn located(row: &Row) -> rusqlite::Result<Located> {
    let role: Option<String> = row.get(4)?;
    Ok(Located {
        id: row.get(0)?,
        account: row.get(1)?,
        mailbox: row.get(2)?,
        remote: row.get(3)?,
        role: role.as_deref().and_then(Role::parse),
    })
}

const LOCATED: &str = "SELECT m.id, m.account, m.mailbox, m.remote, b.role FROM messages m JOIN mailboxes b ON b.id = m.mailbox";

impl Store {
    pub fn conversation(&self, thread: i64) -> Result<Vec<ConversationMessage>, String> {
        let mut messages: Vec<ConversationMessage> = self.reading(|connection| {
            connection
                .prepare_cached(&format!(
                    "{CONVERSATION} WHERE m.thread = ?1 ORDER BY m.date, CASE b.role WHEN 'all' THEN 1 WHEN 'trash' THEN 2 ELSE 0 END"
                ))?
                .query_map([thread], conversation_message)?
                .collect()
        })?;
        let mut seen = std::collections::HashSet::new();
        messages.retain(|message| {
            message
                .message_id
                .as_ref()
                .is_none_or(|message_id| seen.insert(message_id.clone()))
        });
        Ok(messages)
    }

    pub fn message(&self, id: i64) -> Result<Option<ConversationMessage>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!("{CONVERSATION} WHERE m.id = ?1"),
                    [id],
                    conversation_message,
                )
                .optional()
        })
    }

    pub fn locate(&self, ids: &[i64]) -> Result<Vec<Located>, String> {
        self.reading(|connection| {
            let mut statement = connection.prepare_cached(&format!("{LOCATED} WHERE m.id = ?1"))?;
            ids.iter()
                .filter_map(|id| statement.query_row([id], located).optional().transpose())
                .collect()
        })
    }

    pub fn thread_messages(&self, threads: &[i64]) -> Result<Vec<Located>, String> {
        self.reading(|connection| {
            let mut statement =
                connection.prepare_cached(&format!("{LOCATED} WHERE m.thread = ?1"))?;
            let mut found = Vec::new();
            for thread in threads {
                found.extend(
                    statement
                        .query_map([thread], located)?
                        .collect::<rusqlite::Result<Vec<_>>>()?,
                );
            }
            Ok(found)
        })
    }

    pub fn notable(
        &self,
        ids: &[i64],
        since: i64,
        settings: &Settings,
    ) -> Result<Vec<Notable>, String> {
        self.reading(|connection| {
            let mut statement = connection.prepare_cached(&format!(
                "SELECT m.id, m.thread, CASE WHEN m.sender_name != '' THEN m.sender_name ELSE m.sender END, m.subject
                 FROM messages m JOIN mailboxes b ON b.id = m.mailbox
                 WHERE m.id = ?1 AND b.role = 'inbox' AND m.seen = 0 AND m.category = 'primary' AND m.date >= ?2
                 AND {}",
                approved(settings)
            ))?;
            ids.iter()
                .filter_map(|id| {
                    statement
                        .query_row(rusqlite::params![id, since], |row| Ok(Notable { thread: row.get(1)?, sender: row.get(2)?, subject: row.get(3)? }))
                        .optional()
                        .transpose()
                })
                .collect()
        })
    }
}
