mod counts;
mod page;
mod search;

use rusqlite::{Statement, ToSql};

use crate::store::Settings;

pub use page::Cursor;

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

pub(super) const FROM: &str = "FROM messages m JOIN mailboxes b ON b.id = m.mailbox";
pub(super) use super::index::RECENCY;
const AWAKE: &str = "m.snoozed_until IS NULL";

pub(super) enum Scope {
    Roles(String),
    Mailbox(i64),
    Matches(String),
    Everywhere,
}

pub(super) struct Filter {
    pub scope: Scope,
    pub rows: String,
    pub reminders: bool,
    pub category: Option<String>,
}

impl Filter {
    pub fn condition(&self) -> String {
        let scoped = match &self.scope {
            Scope::Roles(roles) => format!("b.role IN ({roles}) AND {}", self.rows),
            Scope::Mailbox(id) => format!("m.mailbox = {id} AND {}", self.rows),
            Scope::Matches(_) | Scope::Everywhere => self.rows.clone(),
        };
        if self.reminders {
            format!("(({scoped}) OR m.remind_at IS NOT NULL)")
        } else {
            scoped
        }
    }

    pub fn mailboxes(&self) -> Option<String> {
        match &self.scope {
            Scope::Roles(roles) => {
                Some(format!("SELECT id FROM mailboxes WHERE role IN ({roles})"))
            }
            Scope::Mailbox(id) => Some(format!("SELECT {id}")),
            Scope::Matches(_) | Scope::Everywhere => None,
        }
    }

    pub fn bind<'a>(
        &'a self,
        statement: &Statement,
        extra: &[(&'a str, &'a dyn ToSql)],
    ) -> Vec<(&'a str, &'a dyn ToSql)> {
        let terms = match &self.scope {
            Scope::Matches(terms) => Some(terms),
            _ => None,
        };
        let own = [
            self.category
                .as_ref()
                .map(|value| (":category", value as &dyn ToSql)),
            terms.map(|value| (":terms", value as &dyn ToSql)),
        ];
        own.into_iter()
            .flatten()
            .chain(extra.iter().copied())
            .filter(|(name, _)| statement.parameter_index(name).ok().flatten().is_some())
            .collect()
    }
}

pub(super) fn approved(settings: &Settings) -> &'static str {
    if settings.screener {
        "coalesce(m.verdict, 'approved') = 'approved'"
    } else {
        "coalesce(m.verdict, 'approved') != 'denied'"
    }
}

fn roles(roles: &str, rows: impl Into<String>) -> Filter {
    Filter {
        scope: Scope::Roles(roles.to_owned()),
        rows: rows.into(),
        reminders: false,
        category: None,
    }
}

fn everywhere(rows: &str) -> Filter {
    Filter {
        scope: Scope::Everywhere,
        rows: rows.into(),
        reminders: false,
        category: None,
    }
}

pub(super) fn filter(view: &View, settings: &Settings) -> Filter {
    match view {
        View::Inbox => {
            let category = if settings.bundles {
                "m.category = 'primary' AND "
            } else {
                ""
            };
            Filter {
                reminders: true,
                ..roles(
                    "'inbox'",
                    format!("{category}{AWAKE} AND {}", approved(settings)),
                )
            }
        }
        View::Bundle(category) => Filter {
            category: Some(category.clone()),
            ..roles(
                "'inbox'",
                format!(
                    "m.category = :category AND {AWAKE} AND {}",
                    approved(settings)
                ),
            )
        },
        View::Screener => roles("'inbox'", format!("m.verdict = 'pending' AND {AWAKE}")),
        View::Screened => roles("'inbox'", "m.verdict = 'denied'"),
        View::Role("archive") => roles("'archive', 'all'", "1"),
        View::Role(role) => roles(&format!("'{role}'"), "1"),
        View::Mailbox(id) => Filter {
            scope: Scope::Mailbox(*id),
            ..everywhere("1")
        },
        View::Later => everywhere("m.snoozed_until IS NOT NULL"),
        View::Starred => {
            everywhere("m.flagged = 1 AND coalesce(b.role, '') NOT IN ('trash', 'junk')")
        }
        View::Search(query) => search::filter(query),
    }
}
