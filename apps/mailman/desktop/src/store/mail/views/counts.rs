use rusqlite::Connection;
use serde::Serialize;

use super::{FROM, Filter, Scope, View, filter};
use crate::store::{Settings, Store, now};

const SEARCH_CAP: i64 = 1000;

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Counts {
    pub inbox: i64,
    pub screener: i64,
    pub later: i64,
    pub drafts: i64,
    pub newsletter: i64,
    pub receipt: i64,
    pub notification: i64,
    pub mailboxes: Vec<(i64, i64)>,
}

pub(super) fn threads(
    connection: &Connection,
    filter: &Filter,
    extra: &str,
) -> rusqlite::Result<i64> {
    let rows = format!("{} AND {extra}", filter.rows);
    let sql = match (&filter.scope, filter.mailboxes()) {
        (Scope::Matches(_), _) => format!(
            "SELECT count(*) FROM (SELECT DISTINCT m.thread FROM search JOIN messages m ON m.id = search.message
             JOIN mailboxes b ON b.id = m.mailbox WHERE search MATCH :terms AND {rows} LIMIT {SEARCH_CAP})"
        ),
        (_, Some(mailboxes)) => {
            let mut parts: Vec<String> = connection
                .prepare_cached(&mailboxes)?
                .query_map([], |row| row.get::<_, i64>(0))?
                .map(|mailbox| {
                    mailbox.map(|mailbox| {
                        format!("SELECT m.thread FROM messages m WHERE m.mailbox = {mailbox} AND {rows}")
                    })
                })
                .collect::<rusqlite::Result<_>>()?;
            if filter.reminders {
                parts.push(format!(
                    "SELECT m.thread FROM messages m WHERE m.remind_at IS NOT NULL AND {extra}"
                ));
            }
            if parts.is_empty() {
                return Ok(0);
            }
            format!("SELECT count(*) FROM ({})", parts.join(" UNION "))
        }
        (_, None) => format!(
            "SELECT count(DISTINCT m.thread) {FROM} WHERE {} AND {extra}",
            filter.condition()
        ),
    };
    let mut statement = connection.prepare_cached(&sql)?;
    let named = filter.bind(&statement, &[]);
    statement.query_row(named.as_slice(), |row| row.get(0))
}

impl Store {
    pub fn counts(&self, settings: &Settings) -> Result<Counts, String> {
        self.reading(|connection| {
            let count =
                |view: View, extra: &str| threads(connection, &filter(&view, settings), extra);
            let unread = "m.seen = 0";
            let bundle = |name: &str| count(View::Bundle(name.to_owned()), unread);
            Ok(Counts {
                inbox: count(View::Inbox, unread)?,
                screener: if settings.screener {
                    count(View::Screener, "1")?
                } else {
                    0
                },
                later: connection
                    .prepare_cached(
                        "SELECT count(DISTINCT thread) FROM messages WHERE snoozed_until > ?1",
                    )?
                    .query_row([now()], |row| row.get(0))?,
                drafts: count(View::Role("drafts"), "1")?,
                newsletter: bundle("newsletter")?,
                receipt: bundle("receipt")?,
                notification: bundle("notification")?,
                mailboxes: connection
                    .prepare_cached(
                        "SELECT mailbox, count(*) FROM messages WHERE seen = 0 GROUP BY mailbox",
                    )?
                    .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
                    .collect::<rusqlite::Result<_>>()?,
            })
        })
    }
}
