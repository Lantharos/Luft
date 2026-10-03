mod client;
mod parse;
mod response;
mod utf7;

pub use client::Client;
use parse::quote;
pub use parse::{parse_uid_set, uid_set};
use response::Untagged;

use crate::mail::envelope::HEADERS;
use crate::store::Role;

pub struct RemoteMailbox {
    pub path: String,
    pub name: String,
    pub role: Option<Role>,
    pub selectable: bool,
}

#[derive(Default)]
pub struct Selected {
    pub uidvalidity: u32,
    pub uidnext: u32,
    pub highest_modseq: Option<u64>,
    pub exists: u32,
    pub vanished: Vec<u32>,
    pub changed: Vec<Flags>,
}

pub struct Flags {
    pub uid: u32,
    pub flags: Vec<String>,
}

pub struct Header {
    pub uid: u32,
    pub flags: Vec<String>,
    pub size: u64,
    pub raw: Vec<u8>,
}

impl Client {
    pub fn enable_sync_extensions(&mut self) -> Result<bool, String> {
        if self.has("QRESYNC") {
            self.run("ENABLE QRESYNC CONDSTORE")?;
            return Ok(true);
        }
        if self.has("CONDSTORE") {
            self.run("ENABLE CONDSTORE")?;
        }
        Ok(false)
    }

    pub fn mailboxes(&mut self) -> Result<Vec<RemoteMailbox>, String> {
        let command = if self.has("SPECIAL-USE") {
            r#"LIST "" "*" RETURN (SPECIAL-USE)"#
        } else {
            r#"LIST "" "*""#
        };
        let reply = self.run(command)?;
        Ok(reply
            .untagged
            .into_iter()
            .filter_map(|untagged| match untagged {
                Untagged::List {
                    attributes,
                    delimiter,
                    name,
                } => Some(remote_mailbox(attributes, delimiter, name)),
                _ => None,
            })
            .collect())
    }

    pub fn create_archive(&mut self) -> Result<(), String> {
        let command = if self.has("CREATE-SPECIAL-USE") {
            r#"CREATE "Archive" (USE (\Archive))"#
        } else {
            r#"CREATE "Archive""#
        };
        self.run(command).map(drop)
    }

    pub fn select(
        &mut self,
        path: &str,
        known: Option<(u32, u64)>,
        qresync: bool,
    ) -> Result<Selected, String> {
        let modifier = match known {
            Some((uidvalidity, modseq)) if qresync => {
                format!(" (QRESYNC ({uidvalidity} {modseq}))")
            }
            _ if self.has("CONDSTORE") => " (CONDSTORE)".into(),
            _ => String::new(),
        };
        let reply = self.run(&format!("SELECT {}{modifier}", quote(path)))?;
        let mut selected = Selected::default();
        for untagged in reply.untagged {
            match untagged {
                Untagged::Exists(count) => selected.exists = count,
                Untagged::Status {
                    code: Some(code), ..
                } => {
                    let mut words = code.split_whitespace();
                    let (key, value) = (
                        words.next().unwrap_or_default(),
                        words.next().and_then(|value| value.parse::<u64>().ok()),
                    );
                    match (key.to_ascii_uppercase().as_str(), value) {
                        ("UIDVALIDITY", Some(value)) => selected.uidvalidity = value as u32,
                        ("UIDNEXT", Some(value)) => selected.uidnext = value as u32,
                        ("HIGHESTMODSEQ", Some(value)) => selected.highest_modseq = Some(value),
                        _ => {}
                    }
                }
                Untagged::Vanished(set) => selected.vanished.extend(parse_uid_set(&set)),
                Untagged::Fetch(fetch) => {
                    if let (Some(uid), Some(flags)) = (fetch.uid(), fetch.flags()) {
                        selected.changed.push(Flags { uid, flags });
                    }
                }
                _ => {}
            }
        }
        Ok(selected)
    }

    pub fn search_uids(&mut self, criteria: &str) -> Result<Vec<u32>, String> {
        let reply = self.run(&format!("UID SEARCH {criteria}"))?;
        Ok(reply
            .untagged
            .into_iter()
            .flat_map(|untagged| match untagged {
                Untagged::Search(uids) => uids,
                _ => Vec::new(),
            })
            .collect())
    }

    pub fn fetch_headers(&mut self, set: &str) -> Result<Vec<Header>, String> {
        let fields = HEADERS.join(" ");
        let reply = self.run(&format!(
            "UID FETCH {set} (UID FLAGS RFC822.SIZE BODY.PEEK[HEADER.FIELDS ({fields})])"
        ))?;
        Ok(fetches(reply.untagged)
            .filter_map(|fetch| {
                Some(Header {
                    uid: fetch.uid()?,
                    flags: fetch.flags().unwrap_or_default(),
                    size: fetch.number("RFC822.SIZE").unwrap_or(0),
                    raw: fetch.section("BODY[")?.to_vec(),
                })
            })
            .collect())
    }

    pub fn fetch_flags(
        &mut self,
        set: &str,
        changed_since: Option<u64>,
    ) -> Result<Vec<Flags>, String> {
        let modifier = changed_since
            .map(|modseq| format!(" (CHANGEDSINCE {modseq})"))
            .unwrap_or_default();
        let reply = self.run(&format!("UID FETCH {set} (UID FLAGS){modifier}"))?;
        Ok(fetches(reply.untagged)
            .filter_map(|fetch| {
                Some(Flags {
                    uid: fetch.uid()?,
                    flags: fetch.flags()?,
                })
            })
            .collect())
    }

    pub fn fetch_bodies(&mut self, set: &str) -> Result<Vec<(u32, Vec<u8>)>, String> {
        let reply = self.run(&format!("UID FETCH {set} (UID BODY.PEEK[])"))?;
        Ok(fetches(reply.untagged)
            .filter_map(|fetch| Some((fetch.uid()?, fetch.section("BODY[")?.to_vec())))
            .collect())
    }

    pub fn store_flag(&mut self, uids: &[u32], flag: &str, add: bool) -> Result<(), String> {
        let sign = if add { '+' } else { '-' };
        self.run(&format!(
            "UID STORE {} {sign}FLAGS.SILENT ({flag})",
            uid_set(uids)
        ))
        .map(drop)
    }

    pub fn move_messages(&mut self, uids: &[u32], target: &str) -> Result<Vec<(u32, u32)>, String> {
        let set = uid_set(uids);
        if self.has("MOVE") {
            let reply = self.run(&format!("UID MOVE {set} {}", quote(target)))?;
            return Ok(copied(&reply));
        }
        let reply = self.run(&format!("UID COPY {set} {}", quote(target)))?;
        self.expunge(uids)?;
        Ok(copied(&reply))
    }

    pub fn expunge(&mut self, uids: &[u32]) -> Result<(), String> {
        let set = uid_set(uids);
        self.run(&format!("UID STORE {set} +FLAGS.SILENT (\\Deleted)"))?;
        let command = if self.has("UIDPLUS") {
            format!("UID EXPUNGE {set}")
        } else {
            "EXPUNGE".into()
        };
        self.run(&command).map(drop)
    }

    pub fn append(&mut self, path: &str, flags: &str, raw: &[u8]) -> Result<(), String> {
        self.run_with_literal(&format!("APPEND {} ({flags})", quote(path)), raw)
            .map(drop)
    }
}

fn copied(reply: &client::Reply) -> Vec<(u32, u32)> {
    let untagged = reply.untagged.iter().filter_map(|untagged| match untagged {
        Untagged::Status {
            code: Some(code), ..
        } => Some(code.as_str()),
        _ => None,
    });
    let Some(code) = reply
        .code
        .as_deref()
        .into_iter()
        .chain(untagged)
        .find(|code| code.to_ascii_uppercase().starts_with("COPYUID "))
    else {
        return Vec::new();
    };
    let mut words = code.split_whitespace().skip(2);
    let (Some(source), Some(target)) = (words.next(), words.next()) else {
        return Vec::new();
    };
    parse_uid_set(source)
        .into_iter()
        .zip(parse_uid_set(target))
        .collect()
}

fn fetches(untagged: Vec<Untagged>) -> impl Iterator<Item = response::Fetch> {
    untagged.into_iter().filter_map(|untagged| match untagged {
        Untagged::Fetch(fetch) => Some(fetch),
        _ => None,
    })
}

fn remote_mailbox(
    attributes: Vec<String>,
    delimiter: Option<String>,
    path: String,
) -> RemoteMailbox {
    let has = |name: &str| {
        attributes
            .iter()
            .any(|attribute| attribute.eq_ignore_ascii_case(name))
    };
    let leaf = delimiter
        .as_deref()
        .and_then(|delimiter| path.rsplit(delimiter).next())
        .unwrap_or(&path)
        .to_owned();
    let role = if path.eq_ignore_ascii_case("INBOX") {
        Some(Role::Inbox)
    } else if has("\\Sent") {
        Some(Role::Sent)
    } else if has("\\Drafts") {
        Some(Role::Drafts)
    } else if has("\\Trash") {
        Some(Role::Trash)
    } else if has("\\Junk") {
        Some(Role::Junk)
    } else if has("\\Archive") {
        Some(Role::Archive)
    } else if has("\\All") {
        Some(Role::All)
    } else {
        Role::guess(&utf7::decode(&leaf))
    };
    RemoteMailbox {
        name: if role == Some(Role::Inbox) {
            "Inbox".into()
        } else {
            utf7::decode(&path)
        },
        selectable: !has("\\Noselect") && !has("\\NonExistent"),
        path,
        role,
    }
}
