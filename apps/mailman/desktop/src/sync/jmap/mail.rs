use std::collections::{HashMap, HashSet};

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde_json::{Value, json};

use super::JmapRemote;
use crate::mail::envelope::{self, HEADERS};
use crate::protocols::jmap::{BLOB, CORE, MAIL};
use crate::store::{Flags, Inserted, Mailbox, NewMessage, now};
use crate::sync::remote::Context;

const WINDOW: usize = 1000;
const MAX_CHANGES: usize = 5000;
const ID_PAGE: usize = 5000;

struct Page {
    ids: Vec<String>,
    emails: Vec<Value>,
}

pub struct Changes {
    emails: HashMap<String, Changed>,
    destroyed: Vec<String>,
}

struct Changed {
    mailboxes: HashSet<String>,
    flags: Flags,
}

impl Changes {
    fn of(&self, mailbox: &Mailbox) -> (Vec<String>, Vec<(String, Flags)>) {
        let mut gone = self.destroyed.clone();
        let mut present = Vec::new();
        for (id, changed) in &self.emails {
            if changed.mailboxes.contains(&mailbox.remote) {
                present.push((id.clone(), changed.flags));
            } else {
                gone.push(id.clone());
            }
        }
        (gone, present)
    }
}

pub fn keywords(value: &Value) -> Flags {
    let has = |name: &str| value.get(name).and_then(Value::as_bool).unwrap_or(false);
    Flags {
        seen: has("$seen"),
        flagged: has("$flagged"),
        answered: has("$answered"),
        draft: has("$draft"),
    }
}

fn header_properties() -> Vec<String> {
    ["id", "keywords", "size", "receivedAt"]
        .into_iter()
        .map(str::to_owned)
        .chain(HEADERS.iter().map(|name| format!("header:{name}")))
        .collect()
}

fn raw_headers(email: &Value) -> Vec<u8> {
    let mut raw = String::new();
    for name in HEADERS {
        if let Some(value) = email[format!("header:{name}")].as_str() {
            raw.push_str(name);
            raw.push(':');
            raw.push_str(value);
            raw.push_str("\r\n");
        }
    }
    raw.push_str("\r\n");
    raw.into_bytes()
}

fn new_message(email: &Value) -> Option<NewMessage> {
    Some(NewMessage {
        remote: email["id"].as_str()?.to_owned(),
        envelope: envelope::parse(&raw_headers(email)),
        flags: keywords(&email["keywords"]),
        size: email["size"].as_i64().unwrap_or(0),
        received: email["receivedAt"]
            .as_str()
            .and_then(mail_parser::DateTime::parse_rfc3339)
            .map(|date| date.to_timestamp())
            .unwrap_or_else(now),
    })
}

fn ids(value: &Value) -> Vec<String> {
    value
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|id| id.as_str().map(str::to_owned))
        .collect()
}

impl JmapRemote {
    pub(super) fn get_many(
        &self,
        ids: &[String],
        properties: &[String],
    ) -> Result<Vec<Value>, String> {
        let mut emails = Vec::with_capacity(ids.len());
        let batches: Vec<&[String]> = ids.chunks(self.client.max_objects).collect();
        for request in batches.chunks(self.client.max_calls) {
            let calls = request
                .iter()
                .map(|batch| {
                    (
                        "Email/get",
                        json!({ "accountId": self.client.account, "ids": batch, "properties": properties }),
                    )
                })
                .collect();
            for response in self.client.call(&[CORE, MAIL], calls)? {
                emails.extend(response["list"].as_array().cloned().unwrap_or_default());
            }
        }
        Ok(emails)
    }

    fn insert(
        &self,
        context: &Context,
        mailbox: &Mailbox,
        emails: &[Value],
    ) -> Result<Vec<Inserted>, String> {
        let mut messages: Vec<NewMessage> = emails.iter().filter_map(new_message).collect();
        messages.sort_unstable_by_key(|message| std::cmp::Reverse(message.received));
        let mut inserted = Vec::with_capacity(messages.len());
        for batch in messages.chunks(250) {
            inserted.extend(context.store.insert_messages(
                mailbox,
                context.account.added,
                batch,
            )?);
            (context.changed)();
        }
        Ok(inserted)
    }

    fn fetch_and_insert(
        &self,
        context: &Context,
        mailbox: &Mailbox,
        wanted: &[String],
    ) -> Result<Vec<Inserted>, String> {
        let emails = self.get_many(wanted, &header_properties())?;
        self.insert(context, mailbox, &emails)
    }

    fn query_page(
        &self,
        mailbox: &str,
        start: Value,
        limit: usize,
        headers: bool,
    ) -> Result<Option<Page>, String> {
        let mut query = json!({
            "accountId": self.client.account,
            "filter": { "inMailbox": mailbox },
            "sort": [{ "property": "receivedAt", "isAscending": false }],
            "limit": limit,
        });
        for (key, value) in start.as_object().into_iter().flatten() {
            query[key] = value.clone();
        }
        let mut calls = vec![("Email/query", query)];
        if headers {
            calls.push((
                "Email/get",
                json!({ "accountId": self.client.account, "#ids": { "resultOf": "0", "name": "Email/query", "path": "/ids" }, "properties": header_properties() }),
            ));
        }
        let mut responses = self.client.calls(&[CORE, MAIL], calls)?.into_iter();
        let query = match responses.next() {
            Some(Ok(query)) => query,
            Some(Err(_)) => return Ok(None),
            None => return Err("The server didn't answer".into()),
        };
        let emails = match responses.next() {
            Some(Ok(got)) => got["list"].as_array().cloned().unwrap_or_default(),
            Some(Err(error)) => return Err(error),
            None => Vec::new(),
        };
        Ok(Some(Page {
            ids: ids(&query["ids"]),
            emails,
        }))
    }

    fn listed(
        &self,
        mailbox: &str,
        start: Value,
        limit: usize,
        headers: bool,
    ) -> Result<Page, String> {
        self.query_page(mailbox, start, limit, headers)?
            .ok_or_else(|| "The server wouldn't list this folder".into())
    }

    pub fn changes(&mut self, since: &str) -> Result<Option<&Changes>, String> {
        if !self.changes.contains_key(since) {
            let computed = self.compute_changes(since)?;
            self.changes.insert(since.to_owned(), computed);
        }
        Ok(self.changes[since].as_ref())
    }

    fn compute_changes(&self, since: &str) -> Result<Option<Changes>, String> {
        let mut state = since.to_owned();
        let mut changed = HashSet::new();
        let mut destroyed = Vec::new();
        loop {
            let response = self.client.calls(
                &[CORE, MAIL],
                vec![("Email/changes", json!({ "accountId": self.client.account, "sinceState": state, "maxChanges": MAX_CHANGES }))],
            )?;
            let Some(Ok(response)) = response.into_iter().next() else {
                return Ok(None);
            };
            changed.extend(ids(&response["created"]));
            changed.extend(ids(&response["updated"]));
            destroyed.extend(ids(&response["destroyed"]));
            state = response["newState"].as_str().unwrap_or_default().to_owned();
            if response["hasMoreChanges"].as_bool() != Some(true) {
                break;
            }
        }
        let changed: Vec<String> = changed
            .into_iter()
            .filter(|id| !destroyed.contains(id))
            .collect();
        let properties = [
            "id".to_owned(),
            "mailboxIds".to_owned(),
            "keywords".to_owned(),
        ];
        let emails: HashMap<String, Changed> = self
            .get_many(&changed, &properties)?
            .iter()
            .filter_map(|email| {
                let mailboxes = email["mailboxIds"].as_object()?.keys().cloned().collect();
                Some((
                    email["id"].as_str()?.to_owned(),
                    Changed {
                        mailboxes,
                        flags: keywords(&email["keywords"]),
                    },
                ))
            })
            .collect();
        destroyed.extend(changed.into_iter().filter(|id| !emails.contains_key(id)));
        Ok(Some(Changes { emails, destroyed }))
    }

    pub fn sync_mailbox(
        &mut self,
        context: &Context,
        mailbox: &Mailbox,
        current: &str,
    ) -> Result<Vec<Inserted>, String> {
        let changes = match mailbox.state.as_deref() {
            Some(since) => self.changes(since)?.map(|changes| changes.of(mailbox)),
            None => None,
        };
        let inserted = match changes {
            Some((gone, present)) => self.apply_changes(context, mailbox, gone, present)?,
            None => self.full_sync(context, mailbox)?,
        };
        context
            .store
            .save_mailbox_state(mailbox.id, None, None, Some(current))?;
        Ok(inserted)
    }

    fn apply_changes(
        &self,
        context: &Context,
        mailbox: &Mailbox,
        gone: Vec<String>,
        present: Vec<(String, Flags)>,
    ) -> Result<Vec<Inserted>, String> {
        context.store.remove_remotes(mailbox.id, &gone)?;
        let ids: Vec<String> = present.iter().map(|(id, _)| id.clone()).collect();
        let known = context.store.known_remotes(mailbox.id, &ids)?;
        let (flags, fresh): (Vec<_>, Vec<_>) =
            present.into_iter().partition(|(id, _)| known.contains(id));
        context.store.update_flags(mailbox.id, &flags)?;
        let fresh: Vec<String> = fresh.into_iter().map(|(id, _)| id).collect();
        self.fetch_and_insert(context, mailbox, &fresh)
    }

    fn full_sync(&self, context: &Context, mailbox: &Mailbox) -> Result<Vec<Inserted>, String> {
        let local: HashSet<String> = context.store.remotes(mailbox.id)?.into_iter().collect();
        if local.is_empty() {
            let limit = WINDOW.min(self.client.max_objects);
            let Page { ids, emails } = self.listed(&mailbox.remote, json!({}), limit, true)?;
            let inserted = self.insert(context, mailbox, &emails)?;
            let more = ids.len() == limit;
            context
                .store
                .set_backfill(mailbox.id, ids.last().filter(|_| more).map(String::as_str))?;
            return Ok(inserted);
        }
        let mut server = Vec::new();
        loop {
            let page = self
                .listed(
                    &mailbox.remote,
                    json!({ "position": server.len() }),
                    ID_PAGE,
                    false,
                )?
                .ids;
            let end = page.len() < ID_PAGE;
            server.extend(page);
            if end {
                break;
            }
        }
        let on_server: HashSet<&String> = server.iter().collect();
        let gone: Vec<String> = local
            .iter()
            .filter(|id| !on_server.contains(id))
            .cloned()
            .collect();
        context.store.remove_remotes(mailbox.id, &gone)?;
        let known: Vec<String> = server
            .iter()
            .filter(|id| local.contains(*id))
            .cloned()
            .collect();
        let flags: Vec<(String, Flags)> = self
            .get_many(&known, &["id".to_owned(), "keywords".to_owned()])?
            .iter()
            .filter_map(|email| {
                Some((
                    email["id"].as_str()?.to_owned(),
                    keywords(&email["keywords"]),
                ))
            })
            .collect();
        context.store.update_flags(mailbox.id, &flags)?;
        let missing: Vec<String> = server
            .into_iter()
            .filter(|id| !local.contains(id))
            .collect();
        let newest = &missing[..missing.len().min(WINDOW)];
        context
            .store
            .set_backfill(mailbox.id, (missing.len() > WINDOW).then_some(""))?;
        self.fetch_and_insert(context, mailbox, newest)
    }

    pub fn backfill_mailbox(&self, context: &Context, mailbox: &Mailbox) -> Result<(), String> {
        let limit = WINDOW.min(self.client.max_objects);
        let anchored = match mailbox.backfill.as_deref() {
            Some(anchor) if !anchor.is_empty() => self.query_page(
                &mailbox.remote,
                json!({ "anchor": anchor, "anchorOffset": 1 }),
                limit,
                true,
            )?,
            _ => None,
        };
        let (next, end) = match anchored {
            Some(Page { ids, emails }) => {
                let known = context.store.known_remotes(mailbox.id, &ids)?;
                let fresh: Vec<Value> = emails
                    .into_iter()
                    .filter(|email| email["id"].as_str().is_some_and(|id| !known.contains(id)))
                    .collect();
                self.insert(context, mailbox, &fresh)?;
                (ids.last().cloned(), ids.len() < limit)
            }
            None => self.walk(context, mailbox, limit)?,
        };
        context
            .store
            .set_backfill(mailbox.id, next.as_deref().filter(|_| !end))
    }

    fn walk(
        &self,
        context: &Context,
        mailbox: &Mailbox,
        limit: usize,
    ) -> Result<(Option<String>, bool), String> {
        let mut position = 0;
        let mut wanted = Vec::new();
        let mut last = None;
        loop {
            let page = self
                .listed(
                    &mailbox.remote,
                    json!({ "position": position }),
                    ID_PAGE,
                    false,
                )?
                .ids;
            let end = page.len() < ID_PAGE;
            position += page.len();
            let known = context.store.known_remotes(mailbox.id, &page)?;
            let mut rest = page.into_iter();
            for id in rest.by_ref() {
                if !known.contains(&id) {
                    wanted.push(id.clone());
                }
                last = Some(id);
                if wanted.len() == limit {
                    break;
                }
            }
            let finished = end && rest.next().is_none();
            if wanted.len() == limit || end {
                self.fetch_and_insert(context, mailbox, &wanted)?;
                return Ok((last, finished));
            }
        }
    }

    pub(super) fn fetch_bodies(
        &self,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String> {
        let local: HashMap<&str, i64> = wanted
            .iter()
            .map(|(id, remote)| (remote.as_str(), *id))
            .collect();
        let remotes: Vec<String> = local.keys().map(|remote| remote.to_string()).collect();
        let properties = ["id".to_owned(), "blobId".to_owned()];
        if !self.client.supports(BLOB) {
            return self
                .get_many(&remotes, &properties)?
                .iter()
                .filter_map(|email| {
                    Some((
                        *local.get(email["id"].as_str()?)?,
                        email["blobId"].as_str()?.to_owned(),
                    ))
                })
                .map(|(id, blob)| self.client.download(&blob).map(|raw| (id, raw)))
                .collect();
        }
        let mut bodies = Vec::with_capacity(remotes.len());
        for batch in remotes.chunks(self.client.max_objects) {
            let responses = self.client.call(
                &[CORE, MAIL, BLOB],
                vec![
                    ("Email/get", json!({ "accountId": self.client.account, "ids": batch, "properties": properties })),
                    ("Blob/get", json!({ "accountId": self.client.account, "#ids": { "resultOf": "0", "name": "Email/get", "path": "/list/*/blobId" }, "properties": ["data:asBase64"] })),
                ],
            )?;
            let blobs: HashMap<&str, &str> = responses[1]["list"]
                .as_array()
                .into_iter()
                .flatten()
                .filter_map(|blob| Some((blob["id"].as_str()?, blob["data:asBase64"].as_str()?)))
                .collect();
            for email in responses[0]["list"].as_array().into_iter().flatten() {
                let (Some(id), Some(data)) = (
                    email["id"].as_str().and_then(|id| local.get(id)),
                    email["blobId"].as_str().and_then(|blob| blobs.get(blob)),
                ) else {
                    continue;
                };
                bodies.push((
                    *id,
                    STANDARD.decode(data).map_err(|error| error.to_string())?,
                ));
            }
        }
        Ok(bodies)
    }
}
