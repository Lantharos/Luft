use std::collections::{HashMap, HashSet};

use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use super::ops::{self, Operation};
use super::remote::{Context, Remote};
use crate::accounts::{Account, Login};
use crate::mail::envelope;
use crate::protocols::imap::{Client, Header, Selected, uid_set};
use crate::protocols::net::Server;
use crate::protocols::smtp;
use crate::store::{Flags, Inserted, Mailbox, NewMessage, Outgoing, RemoteFolder, Role, now};

const WINDOW: usize = 2000;
const HEADER_BATCH: usize = 200;
const SAVES_SENT_ITSELF: [&str; 4] = [
    "gmail.com",
    "googlemail.com",
    "office365.com",
    "outlook.com",
];

pub struct ImapRemote {
    client: Client,
    qresync: bool,
    selected: Option<String>,
    smtp: Server,
    login: Login,
}

fn uids(context: &Context, messages: &[ops::Target]) -> Result<Vec<u32>, String> {
    Ok(ops::resolve(context.store, messages)?
        .iter()
        .filter_map(|target| target.remote.parse().ok())
        .collect())
}

impl ImapRemote {
    pub fn connect(imap: &Server, smtp: &Server, login: Login) -> Result<Self, String> {
        let mut client = Client::connect(imap)?;
        client.login(&login)?;
        let qresync = client.enable_sync_extensions()?;
        Ok(Self {
            client,
            qresync,
            selected: None,
            smtp: smtp.clone(),
            login,
        })
    }

    fn select(&mut self, path: &str) -> Result<(), String> {
        if self.selected.as_deref() != Some(path) {
            self.client.select(path, None, false)?;
            self.selected = Some(path.to_owned());
        }
        Ok(())
    }

    fn fetch_new(
        &mut self,
        context: &Context,
        mailbox: &Mailbox,
        mut wanted: Vec<u32>,
    ) -> Result<Vec<Inserted>, String> {
        wanted.sort_unstable_by(|a, b| b.cmp(a));
        wanted.truncate(WINDOW);
        let mut inserted = Vec::new();
        for batch in wanted.chunks(HEADER_BATCH) {
            let headers = self.client.fetch_headers(&uid_set(batch))?;
            let messages: Vec<NewMessage> = headers.into_iter().map(new_message).collect();
            inserted.extend(context.store.insert_messages(
                mailbox,
                context.account.added,
                &messages,
            )?);
            (context.changed)();
        }
        Ok(inserted)
    }

    fn reconcile(
        &mut self,
        context: &Context,
        mailbox: &Mailbox,
        selected: &Selected,
        resumed: bool,
    ) -> Result<Vec<u32>, String> {
        let local: HashSet<u32> = context
            .store
            .remotes(mailbox.id)?
            .iter()
            .filter_map(|remote| remote.parse().ok())
            .collect();
        let highest = local.iter().copied().max().unwrap_or(0);
        if resumed {
            let gone: Vec<String> = selected
                .vanished
                .iter()
                .filter(|uid| local.contains(uid))
                .map(u32::to_string)
                .collect();
            context.store.remove_remotes(mailbox.id, &gone)?;
            let changes: Vec<(String, Flags)> = selected
                .changed
                .iter()
                .map(|change| (change.uid.to_string(), Flags::from_imap(&change.flags)))
                .collect();
            context.store.update_flags(mailbox.id, &changes)?;
            let newer = if selected.uidnext > highest + 1 {
                self.client.search_uids(&format!("UID {}:*", highest + 1))?
            } else {
                Vec::new()
            };
            return Ok(newer.into_iter().filter(|uid| *uid > highest).collect());
        }
        let server: HashSet<u32> = if selected.exists > 0 {
            self.client.search_uids("ALL")?.into_iter().collect()
        } else {
            HashSet::new()
        };
        let gone: Vec<String> = local.difference(&server).map(u32::to_string).collect();
        context.store.remove_remotes(mailbox.id, &gone)?;
        let kept: Vec<u32> = local.intersection(&server).copied().collect();
        if !kept.is_empty() {
            let changed_since = mailbox
                .modseq
                .filter(|_| self.client.has("CONDSTORE"))
                .map(|modseq| modseq as u64);
            let flags = self.client.fetch_flags(&uid_set(&kept), changed_since)?;
            let changes: Vec<(String, Flags)> = flags
                .iter()
                .map(|change| (change.uid.to_string(), Flags::from_imap(&change.flags)))
                .collect();
            context.store.update_flags(mailbox.id, &changes)?;
        }
        Ok(server.difference(&local).copied().collect())
    }

    fn path_of(&self, context: &Context, mailbox: i64) -> Result<String, String> {
        context
            .store
            .mailbox(mailbox)?
            .map(|mailbox| mailbox.remote)
            .ok_or_else(|| "That folder no longer exists".into())
    }

    fn saves_sent_itself(&self) -> bool {
        SAVES_SENT_ITSELF
            .iter()
            .any(|host| self.smtp.host.ends_with(host))
    }
}

fn new_message(header: Header) -> NewMessage {
    NewMessage {
        remote: header.uid.to_string(),
        envelope: envelope::parse(&header.raw),
        flags: Flags::from_imap(&header.flags),
        size: header.size as i64,
        received: now(),
    }
}

impl Remote for ImapRemote {
    fn folders(&mut self, context: &Context) -> Result<Vec<Mailbox>, String> {
        let mut remote = self.client.mailboxes()?;
        if !remote
            .iter()
            .any(|mailbox| matches!(mailbox.role, Some(Role::Archive | Role::All)))
        {
            self.client.create_archive()?;
            remote = self.client.mailboxes()?;
        }
        let folders: Vec<RemoteFolder> = remote
            .into_iter()
            .map(|remote| RemoteFolder {
                remote: remote.path,
                name: remote.name,
                role: remote.role,
                selectable: remote.selectable,
            })
            .collect();
        context
            .store
            .replace_mailboxes(context.account.id, &folders)
    }

    fn sync(&mut self, context: &Context, mailbox: &Mailbox) -> Result<Vec<Inserted>, String> {
        let known = mailbox
            .validity
            .zip(mailbox.modseq)
            .map(|(validity, modseq)| (validity as u32, modseq as u64));
        let selected = self.client.select(&mailbox.remote, known, self.qresync)?;
        self.selected = Some(mailbox.remote.clone());
        let valid = mailbox
            .validity
            .is_none_or(|validity| validity as u32 == selected.uidvalidity);
        if !valid {
            context.store.clear_mailbox(mailbox.id)?;
        }
        let resumed = valid && known.is_some() && self.qresync;
        let wanted = self.reconcile(context, mailbox, &selected, resumed)?;
        (context.changed)();
        let inserted = self.fetch_new(context, mailbox, wanted)?;
        context.store.save_mailbox_state(
            mailbox.id,
            Some(selected.uidvalidity as i64),
            selected.highest_modseq.map(|modseq| modseq as i64),
            None,
        )?;
        Ok(inserted)
    }

    fn bodies(
        &mut self,
        mailbox: &Mailbox,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String> {
        self.select(&mailbox.remote)?;
        let ids: HashMap<u32, i64> = wanted
            .iter()
            .filter_map(|(id, remote)| Some((remote.parse().ok()?, *id)))
            .collect();
        if ids.is_empty() {
            return Ok(Vec::new());
        }
        let keys: Vec<u32> = ids.keys().copied().collect();
        Ok(self
            .client
            .fetch_bodies(&uid_set(&keys))?
            .into_iter()
            .filter_map(|(uid, raw)| Some((*ids.get(&uid)?, raw)))
            .collect())
    }

    fn apply(&mut self, context: &Context, operation: &Operation) -> Result<(), String> {
        match operation {
            Operation::Flag {
                mailbox,
                messages,
                flag,
                value,
            } => {
                let uids = uids(context, messages)?;
                if uids.is_empty() {
                    return Ok(());
                }
                let path = self.path_of(context, *mailbox)?;
                self.select(&path)?;
                let name = match flag {
                    crate::store::Flag::Seen => "\\Seen",
                    crate::store::Flag::Flagged => "\\Flagged",
                    crate::store::Flag::Answered => "\\Answered",
                };
                self.client.store_flag(&uids, name, *value)
            }
            Operation::Move { from, to, messages } => {
                let source = self.path_of(context, *from)?;
                let target = self.path_of(context, *to)?;
                let messages = ops::resolve(context.store, messages)?;
                let pairs: Vec<(i64, u32)> = messages
                    .iter()
                    .filter_map(|moved| Some((moved.id, moved.remote.parse().ok()?)))
                    .collect();
                if pairs.is_empty() {
                    return Ok(());
                }
                self.select(&source)?;
                let copied: HashMap<u32, u32> = self
                    .client
                    .move_messages(
                        &pairs.iter().map(|(_, uid)| *uid).collect::<Vec<_>>(),
                        &target,
                    )?
                    .into_iter()
                    .collect();
                for (id, uid) in pairs {
                    let settled = copied.get(&uid).map(u32::to_string);
                    context.store.settle_remote(id, settled.as_deref())?;
                }
                Ok(())
            }
            Operation::Destroy { mailbox, messages } => {
                let uids = uids(context, messages)?;
                if uids.is_empty() {
                    return Ok(());
                }
                let path = self.path_of(context, *mailbox)?;
                self.select(&path)?;
                self.client.expunge(&uids)
            }
            Operation::Append {
                mailbox,
                raw,
                draft,
            } => {
                let path = self.path_of(context, *mailbox)?;
                let raw = STANDARD.decode(raw).map_err(|error| error.to_string())?;
                self.client.append(
                    &path,
                    if *draft { "\\Seen \\Draft" } else { "\\Seen" },
                    &raw,
                )
            }
        }
    }

    fn send(&mut self, context: &Context, outgoing: &Outgoing) -> Result<(), String> {
        smtp::send(&self.smtp, &self.login, outgoing)?;
        if self.saves_sent_itself() {
            return Ok(());
        }
        if let Some(sent) = context
            .store
            .mailbox_with_role(context.account.id, Role::Sent)?
        {
            self.client.append(&sent.remote, "\\Seen", &outgoing.raw)?;
        }
        Ok(())
    }
}

pub fn connect(account: &Account, login: Login) -> Result<ImapRemote, String> {
    match &account.config.protocol {
        crate::accounts::Protocol::Imap { imap, smtp } => ImapRemote::connect(imap, smtp, login),
        crate::accounts::Protocol::Jmap { .. } => Err("This account doesn't use IMAP".into()),
    }
}
