use std::collections::{HashMap, HashSet};
use std::io::BufRead;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde_json::{Map, Value, json};

use super::idle::Push;
use super::ops::{self, Operation};
use super::remote::{Context, Remote};
use crate::accounts::Login;
use crate::mail::envelope;
use crate::protocols::jmap::{self, CORE, Client, MAIL, SUBMISSION};
use crate::store::{Flag, Flags, Inserted, Mailbox, NewMessage, Outgoing, RemoteFolder, Role, now};

const WINDOW: usize = 2000;
const BATCH: usize = 200;
const RECONNECT_AFTER: Duration = Duration::from_secs(30);

pub struct JmapRemote {
    client: Client,
    state: Option<String>,
}

fn role(role: Option<&str>) -> Option<Role> {
    Role::parse(role?)
}

fn keywords(value: &Value) -> Flags {
    let has = |name: &str| value.get(name).and_then(Value::as_bool).unwrap_or(false);
    Flags {
        seen: has("$seen"),
        flagged: has("$flagged"),
        answered: has("$answered"),
        draft: has("$draft"),
    }
}

fn raw_headers(email: &Value) -> Vec<u8> {
    let mut raw = String::new();
    for header in email["headers"].as_array().into_iter().flatten() {
        if let (Some(name), Some(value)) = (header["name"].as_str(), header["value"].as_str()) {
            raw.push_str(name);
            raw.push(':');
            raw.push_str(value);
            raw.push_str("\r\n");
        }
    }
    raw.push_str("\r\n");
    raw.into_bytes()
}

fn received(email: &Value) -> i64 {
    email["receivedAt"]
        .as_str()
        .and_then(mail_parser::DateTime::parse_rfc3339)
        .map(|date| date.to_timestamp())
        .unwrap_or_else(now)
}

impl JmapRemote {
    pub fn connect(session: &str, login: Login) -> Result<Self, String> {
        Ok(Self {
            client: Client::connect(session, &login)?,
            state: None,
        })
    }

    fn ids_in(&self, mailbox: &str) -> Result<(Vec<String>, bool), String> {
        let responses = self.client.call(
            &[CORE, MAIL],
            vec![(
                "Email/query",
                json!({ "accountId": self.client.account, "filter": { "inMailbox": mailbox }, "sort": [{ "property": "receivedAt", "isAscending": false }], "limit": WINDOW, "calculateTotal": true }),
            )],
        )?;
        let ids = responses[0]["ids"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|id| id.as_str().map(str::to_owned))
            .collect::<Vec<_>>();
        let complete = responses[0]["total"]
            .as_u64()
            .is_some_and(|total| total as usize <= ids.len());
        Ok((ids, complete))
    }

    fn emails(&self, ids: &[String], properties: &[&str]) -> Result<Vec<Value>, String> {
        let mut emails = Vec::new();
        for batch in ids.chunks(BATCH) {
            let responses = self.client.call(&[CORE, MAIL], vec![("Email/get", json!({ "accountId": self.client.account, "ids": batch, "properties": properties }))])?;
            emails.extend(responses[0]["list"].as_array().cloned().unwrap_or_default());
        }
        Ok(emails)
    }

    fn set_email(&self, update: Map<String, Value>) -> Result<(), String> {
        let responses = self.client.call(
            &[CORE, MAIL],
            vec![(
                "Email/set",
                json!({ "accountId": self.client.account, "update": update }),
            )],
        )?;
        match responses[0]["notUpdated"]
            .as_object()
            .and_then(|failed| failed.values().next())
        {
            Some(failure) => Err(failure["description"]
                .as_str()
                .unwrap_or("The server refused the change")
                .to_owned()),
            None => Ok(()),
        }
    }

    fn import(&self, raw: &[u8], mailbox: &str, keywords: Value) -> Result<String, String> {
        let blob = self.client.upload(raw)?;
        let responses = self.client.call(
            &[CORE, MAIL],
            vec![("Email/import", json!({ "accountId": self.client.account, "emails": { "new": { "blobId": blob, "mailboxIds": { mailbox: true }, "keywords": keywords } } }))],
        )?;
        responses[0]["created"]["new"]["id"]
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| "The server didn't keep the message".into())
    }

    fn mailboxes(&self) -> Result<Vec<Value>, String> {
        self.client.call(
            &[CORE, MAIL],
            vec![
                ("Mailbox/get", json!({ "accountId": self.client.account, "properties": ["id", "name", "parentId", "role"] })),
                ("Email/get", json!({ "accountId": self.client.account, "ids": [] })),
            ],
        )
    }

    fn identity(&self, email: &str, name: &str) -> Result<String, String> {
        let responses = self.client.call(
            &[CORE, MAIL, SUBMISSION],
            vec![("Identity/get", json!({ "accountId": self.client.account }))],
        )?;
        let identities = responses[0]["list"].as_array().cloned().unwrap_or_default();
        let found = identities
            .iter()
            .find(|identity| {
                identity["email"]
                    .as_str()
                    .is_some_and(|address| address.eq_ignore_ascii_case(email))
            })
            .or(identities.first())
            .and_then(|identity| identity["id"].as_str().map(str::to_owned));
        if let Some(found) = found {
            return Ok(found);
        }
        let responses = self.client.call(
            &[CORE, MAIL, SUBMISSION],
            vec![("Identity/set", json!({ "accountId": self.client.account, "create": { "own": { "email": email, "name": name } } }))],
        )?;
        responses[0]["created"]["own"]["id"]
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| "This account can't send mail".into())
    }

    fn destroy(&self, ids: &[String]) -> Result<(), String> {
        self.client
            .call(
                &[CORE, MAIL],
                vec![(
                    "Email/set",
                    json!({ "accountId": self.client.account, "destroy": ids }),
                )],
            )
            .map(drop)
    }
}

impl Remote for JmapRemote {
    fn folders(&mut self, context: &Context) -> Result<Vec<Mailbox>, String> {
        let mut responses = self.mailboxes()?;
        let has_archive = responses[0]["list"]
            .as_array()
            .into_iter()
            .flatten()
            .any(|mailbox| matches!(mailbox["role"].as_str(), Some("archive" | "all")));
        if !has_archive {
            self.client.call(
                &[CORE, MAIL],
                vec![("Mailbox/set", json!({ "accountId": self.client.account, "create": { "archive": { "name": "Archive", "role": "archive" } } }))],
            )?;
            responses = self.mailboxes()?;
        }
        self.state = responses[1]["state"].as_str().map(str::to_owned);
        let list = responses[0]["list"].as_array().cloned().unwrap_or_default();
        let by_id: HashMap<&str, &Value> = list
            .iter()
            .filter_map(|mailbox| Some((mailbox["id"].as_str()?, mailbox)))
            .collect();
        let path = |mailbox: &Value| {
            let mut names = vec![mailbox["name"].as_str().unwrap_or_default().to_owned()];
            let mut parent = mailbox["parentId"].as_str();
            while let Some(found) = parent.and_then(|id| by_id.get(id)) {
                names.insert(0, found["name"].as_str().unwrap_or_default().to_owned());
                parent = found["parentId"].as_str();
            }
            names.join("/")
        };
        let folders: Vec<RemoteFolder> = list
            .iter()
            .filter_map(|mailbox| {
                let role = role(mailbox["role"].as_str());
                Some(RemoteFolder {
                    remote: mailbox["id"].as_str()?.to_owned(),
                    name: if role == Some(Role::Inbox) {
                        "Inbox".into()
                    } else {
                        path(mailbox)
                    },
                    role,
                    selectable: true,
                })
            })
            .collect();
        context
            .store
            .replace_mailboxes(context.account.id, &folders)
    }

    fn sync(&mut self, context: &Context, mailbox: &Mailbox) -> Result<Vec<Inserted>, String> {
        if self.state.is_some() && mailbox.state == self.state {
            return Ok(Vec::new());
        }
        let (ids, complete) = self.ids_in(&mailbox.remote)?;
        let local: HashSet<String> = context.store.remotes(mailbox.id)?.into_iter().collect();
        let server: HashSet<&String> = ids.iter().collect();
        if complete {
            let gone: Vec<String> = local
                .iter()
                .filter(|remote| !server.contains(remote))
                .cloned()
                .collect();
            context.store.remove_remotes(mailbox.id, &gone)?;
        }
        let known: Vec<String> = ids
            .iter()
            .filter(|id| local.contains(*id))
            .cloned()
            .collect();
        let changes: Vec<(String, Flags)> = self
            .emails(&known, &["id", "keywords"])?
            .iter()
            .filter_map(|email| {
                Some((
                    email["id"].as_str()?.to_owned(),
                    keywords(&email["keywords"]),
                ))
            })
            .collect();
        context.store.update_flags(mailbox.id, &changes)?;
        (context.changed)();
        let fresh: Vec<String> = ids.into_iter().filter(|id| !local.contains(id)).collect();
        let mut inserted = Vec::new();
        for batch in fresh.chunks(BATCH) {
            let messages: Vec<NewMessage> = self
                .emails(batch, &["id", "keywords", "size", "receivedAt", "headers"])?
                .iter()
                .filter_map(|email| {
                    Some(NewMessage {
                        remote: email["id"].as_str()?.to_owned(),
                        envelope: envelope::parse(&raw_headers(email)),
                        flags: keywords(&email["keywords"]),
                        size: email["size"].as_i64().unwrap_or(0),
                        received: received(email),
                    })
                })
                .collect();
            inserted.extend(context.store.insert_messages(
                mailbox,
                context.account.added,
                &messages,
            )?);
            (context.changed)();
        }
        context
            .store
            .save_mailbox_state(mailbox.id, None, None, self.state.as_deref())?;
        Ok(inserted)
    }

    fn bodies(
        &mut self,
        _mailbox: &Mailbox,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String> {
        let ids: HashMap<&str, i64> = wanted
            .iter()
            .map(|(id, remote)| (remote.as_str(), *id))
            .collect();
        let remotes: Vec<String> = ids.keys().map(|remote| remote.to_string()).collect();
        self.emails(&remotes, &["id", "blobId"])?
            .iter()
            .filter_map(|email| {
                Some((
                    *ids.get(email["id"].as_str()?)?,
                    email["blobId"].as_str()?.to_owned(),
                ))
            })
            .map(|(id, blob)| self.client.download(&blob).map(|raw| (id, raw)))
            .collect()
    }

    fn apply(&mut self, context: &Context, operation: &Operation) -> Result<(), String> {
        match operation {
            Operation::Flag {
                messages,
                flag,
                value,
                ..
            } => {
                let keyword = match flag {
                    Flag::Seen => "$seen",
                    Flag::Flagged => "$flagged",
                    Flag::Answered => "$answered",
                };
                let patch = if *value {
                    Value::Bool(true)
                } else {
                    Value::Null
                };
                let targets = ops::resolve(context.store, messages)?;
                self.set_email(
                    targets
                        .iter()
                        .map(|target| {
                            (
                                target.remote.clone(),
                                json!({ format!("keywords/{keyword}"): patch }),
                            )
                        })
                        .collect(),
                )
            }
            Operation::Move { from, to, messages } => {
                let source = context
                    .store
                    .mailbox(*from)?
                    .ok_or("That folder no longer exists")?
                    .remote;
                let target = context
                    .store
                    .mailbox(*to)?
                    .ok_or("That folder no longer exists")?
                    .remote;
                let messages = ops::resolve(context.store, messages)?;
                let update = messages
                    .iter()
                    .map(|moved| (moved.remote.clone(), json!({ format!("mailboxIds/{source}"): null, format!("mailboxIds/{target}"): true })))
                    .collect();
                self.set_email(update)?;
                for moved in &messages {
                    context.store.settle_remote(moved.id, Some(&moved.remote))?;
                }
                Ok(())
            }
            Operation::Destroy { messages, .. } => {
                let remotes: Vec<String> = ops::resolve(context.store, messages)?
                    .into_iter()
                    .map(|target| target.remote)
                    .collect();
                self.destroy(&remotes)
            }
            Operation::Append {
                mailbox,
                raw,
                draft,
            } => {
                let target = context
                    .store
                    .mailbox(*mailbox)?
                    .ok_or("That folder no longer exists")?
                    .remote;
                let raw = STANDARD.decode(raw).map_err(|error| error.to_string())?;
                let keywords = if *draft {
                    json!({ "$seen": true, "$draft": true })
                } else {
                    json!({ "$seen": true })
                };
                self.import(&raw, &target, keywords).map(drop)
            }
        }
    }

    fn send(&mut self, context: &Context, outgoing: &Outgoing) -> Result<(), String> {
        let sent = context
            .store
            .mailbox_with_role(context.account.id, Role::Sent)?
            .ok_or("This account has no Sent folder")?;
        let identity = self.identity(&outgoing.sender, &context.account.name)?;
        let email = self.import(&outgoing.raw, &sent.remote, json!({ "$seen": true }))?;
        let recipients: Vec<Value> = outgoing
            .recipients
            .iter()
            .map(|address| json!({ "email": address }))
            .collect();
        let responses = self.client.call(
            &[CORE, MAIL, SUBMISSION],
            vec![(
                "EmailSubmission/set",
                json!({ "accountId": self.client.account, "create": { "send": {
                    "identityId": identity, "emailId": email,
                    "envelope": { "mailFrom": { "email": outgoing.sender }, "rcptTo": recipients }
                } } }),
            )],
        )?;
        let failure = &responses[0]["notCreated"]["send"];
        if failure.is_object() {
            self.destroy(&[email])?;
            return Err(format!(
                "Sending failed: {}",
                failure["description"]
                    .as_str()
                    .unwrap_or("the server refused it")
            ));
        }
        Ok(())
    }
}

fn listen(
    url: &str,
    authorization: &str,
    stop: &AtomicBool,
    changed: &dyn Fn(),
) -> Result<(), String> {
    let response = ureq::get(url)
        .header("Authorization", authorization)
        .header("Accept", "text/event-stream")
        .call()
        .map_err(|error| error.to_string())?;
    let reader = std::io::BufReader::new(response.into_body().into_reader());
    let mut event = String::new();
    for line in reader.lines() {
        if stop.load(Ordering::Relaxed) {
            return Ok(());
        }
        let line = line.map_err(|error| error.to_string())?;
        if let Some(name) = line.strip_prefix("event:") {
            event = name.trim().to_owned();
        } else if line.starts_with("data:") && event == "state" {
            changed();
        }
    }
    Ok(())
}

pub fn watch(session: String, login: Login, changed: impl Fn() + Send + 'static) -> Push {
    let stop = Arc::new(AtomicBool::new(false));
    let watching = stop.clone();
    std::thread::Builder::new()
        .name("jmap-push".into())
        .spawn(move || {
            while !watching.load(Ordering::Relaxed) {
                let source = Client::connect(&session, &login)
                    .ok()
                    .and_then(|client| client.event_source());
                let Some(url) = source else {
                    return;
                };
                let _ = listen(&url, &jmap::authorization(&login), &watching, &changed);
                std::thread::sleep(RECONNECT_AFTER);
            }
        })
        .ok();
    Push { stop }
}
