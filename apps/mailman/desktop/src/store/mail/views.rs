use rusqlite::{Row, ToSql, params_from_iter};
use serde::Serialize;

use crate::store::{Settings, Store, now};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum View {
    Inbox,
    Screener,
    Screened,
    Later,
    Starred,
    Role(&'static str),
    Bundle(String),
    Mailbox(i64),
    Search(String),
}

impl View {
    pub fn parse(view: &str, query: Option<String>) -> Option<Self> {
        if let Some(query) = query.filter(|query| !query.trim().is_empty()) {
            return Some(View::Search(query));
        }
        Some(match view {
            "inbox" => View::Inbox,
            "screener" => View::Screener,
            "screened" => View::Screened,
            "later" => View::Later,
            "starred" => View::Starred,
            "sent" => View::Role("sent"),
            "drafts" => View::Role("drafts"),
            "archive" => View::Role("archive"),
            "trash" => View::Role("trash"),
            "junk" => View::Role("junk"),
            _ => {
                let (kind, value) = view.split_once(':')?;
                match kind {
                    "bundle" => View::Bundle(value.to_owned()),
                    "mailbox" => View::Mailbox(value.parse().ok()?),
                    _ => return None,
                }
            }
        })
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
    pub total: i64,
    pub offset: i64,
    pub rows: Vec<ThreadRow>,
}

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

struct Filter {
    sql: String,
    values: Vec<Box<dyn ToSql>>,
}

const FROM: &str = "FROM messages m JOIN mailboxes b ON b.id = m.mailbox LEFT JOIN senders s ON s.address = m.sender";
const AWAKE: &str = "m.snoozed_until IS NULL";

fn approved(settings: &Settings) -> &'static str {
    if settings.screener {
        "coalesce(s.verdict, 'approved') = 'approved'"
    } else {
        "coalesce(s.verdict, 'approved') != 'denied'"
    }
}

fn filter(view: &View, settings: &Settings) -> Filter {
    let mut values: Vec<Box<dyn ToSql>> = Vec::new();
    let condition = match view {
        View::Inbox => {
            let category = if settings.bundles {
                "AND m.category = 'primary'"
            } else {
                ""
            };
            format!(
                "((b.role = 'inbox' {category} AND {AWAKE} AND {}) OR m.remind_at IS NOT NULL)",
                approved(settings)
            )
        }
        View::Bundle(category) => {
            values.push(Box::new(category.clone()));
            format!(
                "b.role = 'inbox' AND m.category = ?1 AND {AWAKE} AND {}",
                approved(settings)
            )
        }
        View::Screener => format!("b.role = 'inbox' AND s.verdict = 'pending' AND {AWAKE}"),
        View::Screened => "b.role = 'inbox' AND s.verdict = 'denied'".into(),
        View::Later => "m.snoozed_until IS NOT NULL".into(),
        View::Starred => "m.flagged = 1 AND coalesce(b.role, '') NOT IN ('trash', 'junk')".into(),
        View::Role("archive") => "b.role IN ('archive', 'all')".into(),
        View::Role(role) => format!("b.role = '{role}'"),
        View::Mailbox(id) => {
            values.push(Box::new(*id));
            "m.mailbox = ?1".into()
        }
        View::Search(query) => return search(query),
    };
    Filter {
        sql: condition,
        values,
    }
}

fn search(query: &str) -> Filter {
    let mut conditions = vec!["coalesce(b.role, '') NOT IN ('trash', 'junk')".to_owned()];
    let mut terms = Vec::new();
    for word in query.split_whitespace() {
        match word.to_lowercase().as_str() {
            "is:unread" => conditions.push("m.seen = 0".into()),
            "is:starred" => conditions.push("m.flagged = 1".into()),
            "has:attachment" | "has:attachments" => conditions.push("m.attachments = 1".into()),
            "in:anywhere" => conditions.retain(|condition| !condition.contains("trash")),
            _ => {
                let (column, term) = match word.split_once(':') {
                    Some(("from" | "to", term)) => (Some("people"), term),
                    Some(("subject", term)) => (Some("subject"), term),
                    _ => (None, word),
                };
                let term = term.replace('"', "");
                if term.is_empty() {
                    continue;
                }
                let phrase = format!("\"{term}\"*");
                terms.push(
                    column
                        .map(|column| format!("{column}:{phrase}"))
                        .unwrap_or(phrase),
                );
            }
        }
    }
    let mut values: Vec<Box<dyn ToSql>> = Vec::new();
    if !terms.is_empty() {
        values.push(Box::new(terms.join(" AND ")));
        conditions.push("m.id IN (SELECT rowid FROM search WHERE search MATCH ?1)".into());
    }
    Filter {
        sql: conditions.join(" AND "),
        values,
    }
}

fn thread_row(row: &Row) -> rusqlite::Result<ThreadRow> {
    let unsubscribe: Option<String> = row.get(14)?;
    Ok(ThreadRow {
        thread: row.get(0)?,
        date: row.get(1)?,
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
    })
}

impl Store {
    pub fn threads(
        &self,
        view: &View,
        settings: &Settings,
        offset: i64,
        limit: i64,
    ) -> Result<ThreadPage, String> {
        let Filter { sql, values } = filter(view, settings);
        let order = if matches!(view, View::Later) {
            "m.snoozed_until ASC"
        } else {
            "date DESC"
        };
        let total_sql = format!("SELECT count(DISTINCT m.thread) {FROM} WHERE {sql}");
        let page_sql = format!(
            "SELECT m.thread, max(m.date) AS date, m.id, m.account, m.subject, m.sender_name, m.sender, m.snippet,
                count(DISTINCT coalesce(m.message_id, m.id)), count(DISTINCT CASE WHEN m.seen = 0 THEN coalesce(m.message_id, m.id) END), sum(m.flagged) > 0, sum(m.attachments) > 0,
                sum(m.draft) > 0, m.category, m.unsubscribe,
                group_concat(DISTINCT CASE WHEN m.sender_name != '' THEN m.sender_name ELSE m.sender END), m.snoozed_until
             {FROM} WHERE {sql} GROUP BY m.thread ORDER BY {order} LIMIT {limit} OFFSET {offset}"
        );
        self.reading(|connection| {
            let total = connection
                .prepare_cached(&total_sql)?
                .query_row(params_from_iter(values.iter()), |row| row.get(0))?;
            let rows = connection
                .prepare_cached(&page_sql)?
                .query_map(params_from_iter(values.iter()), thread_row)?
                .collect::<rusqlite::Result<_>>()?;
            Ok(ThreadPage {
                total,
                offset,
                rows,
            })
        })
    }

    pub fn counts(&self, settings: &Settings) -> Result<Counts, String> {
        let unread = |view: View| {
            format!(
                "SELECT count(DISTINCT m.thread) {FROM} WHERE {} AND m.seen = 0",
                filter(&view, settings).sql
            )
        };
        let total = |view: View| {
            format!(
                "SELECT count(DISTINCT m.thread) {FROM} WHERE {}",
                filter(&view, settings).sql
            )
        };
        self.reading(|connection| {
            let count = |sql: String, values: &[&dyn ToSql]| -> rusqlite::Result<i64> {
                connection
                    .prepare_cached(&sql)?
                    .query_row(values, |row| row.get(0))
            };
            let bundle = |name: &str| count(unread(View::Bundle(String::new())), &[&name]);
            Ok(Counts {
                inbox: count(unread(View::Inbox), &[])?,
                screener: count(total(View::Screener), &[])?,
                later: count(
                    format!(
                        "SELECT count(DISTINCT thread) FROM messages WHERE snoozed_until > {}",
                        now()
                    ),
                    &[],
                )?,
                drafts: count(total(View::Role("drafts")), &[])?,
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
