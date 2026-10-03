use std::collections::HashSet;

use rusqlite::{CachedStatement, Connection, Row, Rows, ToSql};
use serde::{Deserialize, Serialize};

use super::{FROM, Filter, RECENCY, Scope, View, counts, filter};
use crate::store::{Settings, Store};

const AFTER: &str = "(m.date < :date OR (m.date = :date AND m.thread < :thread))";
const COLUMNS: &str = "m.thread, max(m.date) AS date, m.id, m.account, m.subject, m.sender_name, m.sender, m.snippet,
    count(DISTINCT coalesce(m.message_id, m.id)), count(DISTINCT CASE WHEN m.seen = 0 THEN coalesce(m.message_id, m.id) END),
    sum(m.flagged) > 0, sum(m.attachments) > 0, sum(m.draft) > 0, m.category, m.unsubscribe,
    group_concat(DISTINCT CASE WHEN m.sender_name != '' THEN m.sender_name ELSE m.sender END), m.snoozed_until";
const BATCH: usize = 24;

#[derive(Clone, Copy, Debug, Deserialize)]
pub struct Cursor {
    pub date: i64,
    pub thread: i64,
}

impl Cursor {
    const START: Cursor = Cursor {
        date: i64::MAX / 16_777_216 - 1,
        thread: i64::MAX,
    };

    fn before(self, row: &ThreadRow) -> bool {
        (row.date, row.thread) < (self.date, self.thread)
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThreadRow {
    pub thread: i64,
    pub id: i64,
    pub account: i64,
    pub date: i64,
    pub subject: String,
    pub sender_name: String,
    pub sender: String,
    pub participants: String,
    pub snippet: String,
    pub count: i64,
    pub unread: i64,
    pub flagged: bool,
    pub attachments: bool,
    pub draft: bool,
    pub category: String,
    pub unsubscribe: bool,
    pub snoozed_until: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThreadPage {
    pub total: Option<i64>,
    pub rows: Vec<ThreadRow>,
}

fn thread_row(row: &Row) -> rusqlite::Result<Option<ThreadRow>> {
    let Some(date) = row.get::<_, Option<i64>>(1)? else {
        return Ok(None);
    };
    let unsubscribe: Option<String> = row.get(14)?;
    Ok(Some(ThreadRow {
        thread: row.get(0)?,
        date,
        id: row.get(2)?,
        account: row.get(3)?,
        subject: row.get(4)?,
        sender_name: row.get(5)?,
        sender: row.get(6)?,
        snippet: row.get(7)?,
        count: row.get(8)?,
        unread: row.get(9)?,
        flagged: row.get(10)?,
        attachments: row.get(11)?,
        draft: row.get(12)?,
        category: row.get(13)?,
        unsubscribe: unsubscribe.is_some(),
        participants: row.get::<_, Option<String>>(15)?.unwrap_or_default(),
        snoozed_until: row.get(16)?,
    }))
}

struct Stream<'s> {
    rows: Rows<'s>,
    found: usize,
    done: bool,
}

struct Paging<'a> {
    connection: &'a Connection,
    filter: &'a Filter,
    cursor: Cursor,
    limit: usize,
}

impl Paging<'_> {
    fn sources(&self) -> rusqlite::Result<Vec<String>> {
        let rows = &self.filter.rows;
        if let Scope::Matches(_) = self.filter.scope {
            return Ok(vec![format!(
                "SELECT m.thread, m.date FROM search JOIN messages m ON m.id = search.message JOIN mailboxes b ON b.id = m.mailbox
                 WHERE search MATCH :terms AND search.rowid < (:date + 1) * {RECENCY} AND {rows} AND {AFTER}
                 ORDER BY search.rowid DESC"
            )]);
        }
        let mut sources: Vec<String> = match self.filter.mailboxes() {
            Some(mailboxes) => self
                .connection
                .prepare_cached(&mailboxes)?
                .query_map([], |row| row.get::<_, i64>(0))?
                .map(|mailbox| {
                    mailbox.map(|mailbox| {
                        format!(
                            "SELECT m.thread, NULL FROM messages m WHERE m.mailbox = {mailbox} AND {rows} AND {AFTER}
                             ORDER BY m.date DESC, m.thread DESC"
                        )
                    })
                })
                .collect::<rusqlite::Result<_>>()?,
            None => Vec::new(),
        };
        if self.filter.reminders {
            sources.push(format!(
                "SELECT m.thread, NULL FROM messages m WHERE m.remind_at IS NOT NULL AND {AFTER} ORDER BY m.date DESC, m.thread DESC"
            ));
        }
        Ok(sources)
    }

    fn streamed(&self) -> rusqlite::Result<Vec<ThreadRow>> {
        let mut aggregate = self.connection.prepare_cached(&format!(
            "SELECT {COLUMNS} {FROM} WHERE m.thread = :thread AND {}",
            self.filter.condition()
        ))?;
        let mut statements: Vec<CachedStatement> = self
            .sources()?
            .iter()
            .map(|sql| self.connection.prepare_cached(sql))
            .collect::<rusqlite::Result<_>>()?;
        let bounds: [(&str, &dyn ToSql); 2] = [
            (":date", &self.cursor.date),
            (":thread", &self.cursor.thread),
        ];
        let mut streams: Vec<Stream> = statements
            .iter_mut()
            .map(|statement| {
                let named = self.filter.bind(statement, &bounds);
                statement.query(named.as_slice()).map(|rows| Stream {
                    rows,
                    found: 0,
                    done: false,
                })
            })
            .collect::<rusqlite::Result<_>>()?;
        let mut seen = HashSet::new();
        let mut found = Vec::new();
        while let Some(stream) = streams
            .iter_mut()
            .find(|stream| !stream.done && stream.found < self.limit)
        {
            let mut fresh = Vec::with_capacity(BATCH);
            while fresh.len() < BATCH {
                let Some(row) = stream.rows.next()? else {
                    stream.done = true;
                    break;
                };
                let thread: i64 = row.get(0)?;
                if seen.insert(thread) {
                    fresh.push((thread, row.get::<_, Option<i64>>(1)?));
                }
            }
            for (thread, matched) in fresh {
                let named = self.filter.bind(&aggregate, &[(":thread", &thread)]);
                let Some(mut row) = aggregate.query_row(named.as_slice(), thread_row)? else {
                    continue;
                };
                if let Some(date) = matched {
                    row.date = date;
                }
                if self.cursor.before(&row) {
                    stream.found += 1;
                    found.push(row);
                }
            }
        }
        found.sort_unstable_by_key(|row| std::cmp::Reverse((row.date, row.thread)));
        found.truncate(self.limit);
        Ok(found)
    }

    fn grouped(&self, view: &View) -> rusqlite::Result<Vec<ThreadRow>> {
        if matches!(view, View::Later) && self.cursor.date != Cursor::START.date {
            return Ok(Vec::new());
        }
        let (having, order, limit) = if matches!(view, View::Later) {
            ("1", "m.snoozed_until ASC", i64::MAX)
        } else {
            (
                "max(m.date) < :date OR (max(m.date) = :date AND m.thread < :thread)",
                "date DESC, m.thread DESC",
                self.limit as i64,
            )
        };
        let mut statement = self.connection.prepare_cached(&format!(
            "SELECT {COLUMNS} {FROM} WHERE {} GROUP BY m.thread HAVING {having} ORDER BY {order} LIMIT {limit}",
            self.filter.condition()
        ))?;
        let named = self.filter.bind(
            &statement,
            &[
                (":date", &self.cursor.date),
                (":thread", &self.cursor.thread),
            ],
        );
        statement
            .query_map(named.as_slice(), thread_row)?
            .filter_map(Result::transpose)
            .collect()
    }
}

impl Store {
    pub fn threads(
        &self,
        view: &View,
        settings: &Settings,
        after: Option<Cursor>,
        limit: i64,
    ) -> Result<ThreadPage, String> {
        let filter = filter(view, settings);
        self.reading(|connection| {
            let paging = Paging {
                connection,
                filter: &filter,
                cursor: after.unwrap_or(Cursor::START),
                limit: limit.max(1) as usize,
            };
            let rows = match filter.scope {
                Scope::Everywhere => paging.grouped(view)?,
                Scope::Roles(_) | Scope::Mailbox(_) | Scope::Matches(_) => paging.streamed()?,
            };
            let total = match after {
                None => Some(counts::threads(connection, &filter, "1")?),
                Some(_) => None,
            };
            Ok(ThreadPage { total, rows })
        })
    }
}
