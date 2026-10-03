mod mail;
pub mod push;

use std::collections::HashMap;
use std::time::{Duration, Instant};

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde_json::{Map, Value, json};

use super::ops::{self, Operation};
use super::remote::{Context, Remote};
use crate::accounts::Login;
use crate::protocols::jmap::{CORE, Client, MAIL, SUBMISSION};
use crate::store::{Flag, Inserted, Mailbox, Outgoing, RemoteFolder, Role};
use mail::Changes;

const STATE_LIFETIME: Duration = Duration::from_secs(5);

pub struct JmapRemote {
    client: Client,
    state: Option<(String, Instant)>,
    changes: HashMap<String, Option<Changes>>,
}

fn role(role: Option<&str>) -> Option<Role> {
    Role::parse(role?)
}

impl JmapRemote {
    pub fn connect(session: &str, login: &Login) -> Result<Self, String> {
        Ok(Self {
            client: Client::connect(session, login)?,
            state: None,
            changes: HashMap::new(),
        })
    }

    fn current_state(&mut self) -> Result<String, String> {
        if let Some((state, at)) = &self.state
            && at.elapsed() < STATE_LIFETIME
        {
            return Ok(state.clone());
        }
        let responses = self.client.call(
            &[CORE, MAIL],
            vec![(
                "Email/get",
                json!({ "accountId": self.client.account, "ids": [] }),
            )],
        )?;
        let state = responses[0]["state"]
            .as_str()
            .ok_or("The server didn't say what changed")?
            .to_owned();
        self.remember(state.clone());
        Ok(state)
    }

    fn remember(&mut self, state: String) {
        if self.state.as_ref().is_none_or(|(known, _)| *known != state) {
            self.changes.clear();
        }
        self.state = Some((state, Instant::now()));
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
        if let Some(state) = responses[1]["state"].as_str() {
            self.remember(state.to_owned());
        }
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
        let current = self.current_state()?;
        if mailbox.state.as_deref() == Some(current.as_str()) {
            return Ok(Vec::new());
        }
        self.sync_mailbox(context, mailbox, &current)
    }

    fn backfill(&mut self, context: &Context, mailbox: &Mailbox) -> Result<(), String> {
        self.backfill_mailbox(context, mailbox)
    }

    fn bodies(
        &mut self,
        _mailbox: &Mailbox,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String> {
        self.fetch_bodies(wanted)
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
