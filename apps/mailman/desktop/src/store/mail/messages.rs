use rusqlite::{OptionalExtension, Transaction, params};

use crate::mail::classify;
use crate::mail::envelope::Envelope;
use crate::store::{Mailbox, Role, Store, now};

pub struct NewMessage {
    pub remote: String,
    pub envelope: Envelope,
    pub flags: Flags,
    pub size: i64,
    pub received: i64,
}

#[derive(Clone, Copy, Default)]
pub struct Flags {
    pub seen: bool,
    pub flagged: bool,
    pub answered: bool,
    pub draft: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Flag {
    Seen,
    Flagged,
    Answered,
}

impl Flag {
    pub fn column(self) -> &'static str {
        match self {
            Flag::Seen => "seen",
            Flag::Flagged => "flagged",
            Flag::Answered => "answered",
        }
    }
}

impl Flags {
    pub fn from_imap(flags: &[String]) -> Self {
        let has = |name: &str| flags.iter().any(|flag| flag.eq_ignore_ascii_case(name));
        Self {
            seen: has("\\Seen"),
            flagged: has("\\Flagged"),
            answered: has("\\Answered"),
            draft: has("\\Draft"),
        }
    }
}

pub struct Inserted {
    pub id: i64,
}

impl Store {
    pub fn insert_messages(
        &self,
        mailbox: &Mailbox,
        account_added: i64,
        messages: &[NewMessage],
    ) -> Result<Vec<Inserted>, String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            let mut inserted = Vec::new();
            for message in messages {
                if let Some(id) = insert(&transaction, mailbox, message)? {
                    let thread = thread_for(&transaction, id, &message.envelope)?;
                    transaction.execute(
                        "UPDATE messages SET thread = ?2 WHERE id = ?1",
                        params![id, thread],
                    )?;
                    index(&transaction, id, message)?;
                    screen(&transaction, mailbox.role, account_added, message)?;
                    inserted.push(Inserted { id });
                }
            }
            transaction.commit()?;
            Ok(inserted)
        })
    }

    pub fn update_flags(&self, mailbox: i64, changes: &[(String, Flags)]) -> Result<usize, String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            let mut changed = 0;
            {
                let mut update = transaction.prepare_cached(
                    "UPDATE messages SET seen = ?3, flagged = ?4, answered = ?5, draft = ?6
                     WHERE mailbox = ?1 AND remote = ?2 AND NOT (seen = ?3 AND flagged = ?4 AND answered = ?5 AND draft = ?6)",
                )?;
                for (remote, flags) in changes {
                    changed += update.execute(params![mailbox, remote, flags.seen, flags.flagged, flags.answered, flags.draft])?;
                }
            }
            transaction.commit()?;
            Ok(changed)
        })
    }

    pub fn remove_remotes(&self, mailbox: i64, remotes: &[String]) -> Result<usize, String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            let mut removed = 0;
            {
                let mut delete = transaction
                    .prepare_cached("DELETE FROM messages WHERE mailbox = ?1 AND remote = ?2")?;
                for remote in remotes {
                    removed += delete.execute(params![mailbox, remote])?;
                }
            }
            transaction.commit()?;
            Ok(removed)
        })
    }

    pub fn remotes(&self, mailbox: i64) -> Result<Vec<String>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT remote FROM messages WHERE mailbox = ?1 AND remote NOT LIKE '~%'",
                )?
                .query_map([mailbox], |row| row.get(0))?
                .collect()
        })
    }

    pub fn set_flag(&self, ids: &[i64], flag: Flag, value: bool) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut update = transaction.prepare_cached(&format!(
                    "UPDATE messages SET {} = ?2 WHERE id = ?1",
                    flag.column()
                ))?;
                for id in ids {
                    update.execute(params![id, value])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn relocate(&self, ids: &[i64], target: i64) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut update = transaction.prepare_cached(
                    "UPDATE OR IGNORE messages SET mailbox = ?2, remote = '~' || id, snoozed_until = NULL WHERE id = ?1 AND mailbox != ?2",
                )?;
                for id in ids {
                    update.execute(params![id, target])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn settle_remote(&self, id: i64, remote: Option<&str>) -> Result<(), String> {
        self.writing(|connection| {
            let settled = match remote {
                Some(remote) => connection.execute(
                    "UPDATE OR IGNORE messages SET remote = ?2 WHERE id = ?1",
                    params![id, remote],
                )?,
                None => 0,
            };
            if settled == 0 {
                connection.execute(
                    "DELETE FROM messages WHERE id = ?1 AND remote LIKE '~%'",
                    [id],
                )?;
            }
            Ok(())
        })
    }

    pub fn current_remote(&self, id: i64) -> Result<Option<String>, String> {
        self.reading(|connection| {
            connection
                .query_row("SELECT remote FROM messages WHERE id = ?1", [id], |row| {
                    row.get(0)
                })
                .optional()
        })
    }

    pub fn forget(&self, ids: &[i64]) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut delete =
                    transaction.prepare_cached("DELETE FROM messages WHERE id = ?1")?;
                for id in ids {
                    delete.execute([id])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn snooze(&self, ids: &[i64], until: Option<i64>) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut update = transaction
                    .prepare_cached("UPDATE messages SET snoozed_until = ?2 WHERE id = ?1")?;
                for id in ids {
                    update.execute(params![id, until])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn wake_snoozed(&self) -> Result<Vec<i64>, String> {
        self.writing(|connection| {
            connection
                .prepare_cached("UPDATE messages SET snoozed_until = NULL, seen = 0 WHERE snoozed_until <= ?1 RETURNING id")?
                .query_map([now()], |row| row.get(0))?
                .collect()
        })
    }
}

fn insert(
    transaction: &Transaction,
    mailbox: &Mailbox,
    message: &NewMessage,
) -> rusqlite::Result<Option<i64>> {
    let envelope = &message.envelope;
    let recipients = serde_json::to_string(&envelope.recipients).unwrap_or_else(|_| "{}".into());
    let unsubscribe = envelope
        .unsubscribe
        .as_ref()
        .and_then(|unsubscribe| serde_json::to_string(unsubscribe).ok());
    let mut statement = transaction.prepare_cached(
        "INSERT INTO messages (account, mailbox, remote, message_id, in_reply_to, refs, subject, sender_name, sender, recipients, date,
            seen, flagged, answered, draft, attachments, size, category, unsubscribe)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
         ON CONFLICT (mailbox, remote) DO NOTHING",
    )?;
    let changed = statement.execute(params![
        mailbox.account,
        mailbox.id,
        message.remote,
        envelope.message_id,
        envelope.in_reply_to,
        envelope.references.join(" "),
        envelope.subject,
        envelope.from.name,
        envelope.from.address,
        recipients,
        envelope.date.unwrap_or(message.received),
        message.flags.seen,
        message.flags.flagged,
        message.flags.answered,
        message.flags.draft,
        envelope.attachments,
        message.size,
        envelope.category.as_str(),
        unsubscribe,
    ])?;
    Ok((changed > 0).then(|| transaction.last_insert_rowid()))
}

fn thread_for(transaction: &Transaction, id: i64, envelope: &Envelope) -> rusqlite::Result<i64> {
    let mut related: Vec<&str> = envelope.references.iter().map(String::as_str).collect();
    related.extend(envelope.in_reply_to.as_deref());
    related.extend(envelope.message_id.as_deref());
    let mut find = transaction.prepare_cached(
        "SELECT thread FROM messages WHERE message_id = ?1 AND id != ?2 AND thread != 0 LIMIT 1",
    )?;
    for message_id in related {
        if let Some(thread) = find
            .query_row(params![message_id, id], |row| row.get(0))
            .optional()?
        {
            return Ok(thread);
        }
    }
    if let Some(own) = envelope.message_id.as_deref() {
        let replies = transaction
            .prepare_cached("SELECT thread FROM messages WHERE (in_reply_to = ?1 OR instr(refs, ?1) > 0) AND thread != 0 LIMIT 1")?
            .query_row([own], |row| row.get(0))
            .optional()?;
        if let Some(thread) = replies {
            return Ok(thread);
        }
    }
    Ok(id)
}

fn index(transaction: &Transaction, id: i64, message: &NewMessage) -> rusqlite::Result<()> {
    let envelope = &message.envelope;
    let recipients = &envelope.recipients;
    let people = std::iter::once(&envelope.from)
        .chain(&recipients.to)
        .chain(&recipients.cc)
        .map(|address| format!("{} {}", address.name, address.address))
        .collect::<Vec<_>>()
        .join(" ");
    transaction
        .prepare_cached(
            "INSERT OR REPLACE INTO search (rowid, subject, people, body) VALUES (?1, ?2, ?3, '')",
        )?
        .execute(params![id, envelope.subject, people])
        .map(drop)
}

fn screen(
    transaction: &Transaction,
    role: Option<Role>,
    account_added: i64,
    message: &NewMessage,
) -> rusqlite::Result<()> {
    let envelope = &message.envelope;
    match role {
        Some(Role::Sent) => {
            let mut approve = transaction.prepare_cached(
                "INSERT INTO senders (address, verdict) VALUES (?1, 'approved') ON CONFLICT (address) DO UPDATE SET verdict = 'approved' WHERE verdict = 'pending'",
            )?;
            for address in envelope.recipients.to.iter().chain(&envelope.recipients.cc) {
                approve.execute([&address.address])?;
            }
        }
        Some(Role::Inbox) if !envelope.from.address.is_empty() => {
            let date = envelope.date.unwrap_or(message.received);
            let trusted = date < account_added
                || message.flags.seen
                || classify::is_delivery_report(&envelope.from);
            let verdict = if trusted { "approved" } else { "pending" };
            transaction
                .prepare_cached("INSERT OR IGNORE INTO senders (address, verdict) VALUES (?1, ?2)")?
                .execute(params![envelope.from.address, verdict])?;
        }
        _ => {}
    }
    Ok(())
}
