use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde::Serialize;
use specta::Type;

use super::Worker;
use crate::events::OUTBOX;
use crate::mail::envelope;
use crate::store::{Delivery, Mailbox, Outgoing, Role, Store};
use crate::sync::ops::Operation;

#[derive(Serialize, Type)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum OutboxEvent {
    Sending {
        id: i64,
    },
    Sent {
        id: i64,
    },
    Failed {
        id: i64,
        reason: String,
    },
    Refused {
        id: i64,
        reason: String,
        draft: Option<i64>,
    },
}

impl Worker {
    pub(super) fn send(&mut self, outgoing: &Outgoing) {
        let id = outgoing.id;
        self.shared.events.emit(OUTBOX, OutboxEvent::Sending { id });
        let attempt = self.with_remote(|remote, context| {
            Ok((remote.send(context, outgoing)?, remote.saves_sent_itself()))
        });
        let settled = match attempt {
            Ok((Delivery::Sent, saves_itself)) => return self.accepted(outgoing, saves_itself),
            Ok((Delivery::Refused(reason), _)) => self.refused(outgoing, reason),
            Err(reason) => self.retry_later(id, reason),
        };
        self.shared.sending.lock().remove(&id);
        if let Err(error) = settled {
            self.fail(error);
        }
    }

    fn accepted(&mut self, outgoing: &Outgoing, saves_itself: bool) {
        let id = outgoing.id;
        let recorded = record_accepted(&self.shared.store, self.account.id, outgoing, saves_itself);
        if let Err(error) = recorded {
            return self.fail(error);
        }
        self.shared.sending.lock().remove(&id);
        self.shared.events.emit(OUTBOX, OutboxEvent::Sent { id });
        self.shared.notifier.sent();
        if let Err(error) = self.after_sending(outgoing) {
            self.fail(error);
        }
    }

    fn after_sending(&mut self, outgoing: &Outgoing) -> Result<(), String> {
        if let Some(at) = outgoing.remind_at {
            let sent = envelope::parse(&outgoing.raw);
            if let Some(message_id) = sent.message_id {
                self.shared
                    .store
                    .add_reminder(&message_id, self.account.id, &sent.subject, at)?;
            }
        }
        self.flush()?;
        if let Some(sent) = self
            .shared
            .store
            .mailbox_with_role(self.account.id, Role::Sent)?
        {
            self.sync_mailbox(&sent)?;
        }
        Ok(())
    }

    fn retry_later(&mut self, id: i64, reason: String) -> Result<(), String> {
        self.shared.store.retry_outgoing(id, &reason)?;
        self.shared
            .events
            .emit(OUTBOX, OutboxEvent::Failed { id, reason });
        Ok(())
    }

    fn refused(&mut self, outgoing: &Outgoing, reason: String) -> Result<(), String> {
        let Some(drafts) = self
            .shared
            .store
            .mailbox_with_role(self.account.id, Role::Drafts)?
        else {
            return self.retry_later(outgoing.id, reason);
        };
        let shelved = append(&drafts, outgoing, true)?;
        self.shared
            .store
            .settle_outgoing(outgoing.id, self.account.id, Some(&shelved))?;
        let draft = self.find_draft(&drafts, outgoing);
        self.shared.events.emit(
            OUTBOX,
            OutboxEvent::Refused {
                id: outgoing.id,
                reason,
                draft: draft.as_ref().ok().copied().flatten(),
            },
        );
        draft.map(drop)
    }

    fn find_draft(&mut self, drafts: &Mailbox, outgoing: &Outgoing) -> Result<Option<i64>, String> {
        self.flush()?;
        self.sync_mailbox(drafts)?;
        match envelope::parse(&outgoing.raw).message_id {
            Some(message_id) => self.shared.store.find_message(drafts.id, &message_id),
            None => Ok(None),
        }
    }
}

fn record_accepted(
    store: &Store,
    account: i64,
    outgoing: &Outgoing,
    saves_itself: bool,
) -> Result<(), String> {
    let copy = match store.mailbox_with_role(account, Role::Sent)? {
        Some(sent) if !saves_itself => Some(append(&sent, outgoing, false)?),
        _ => None,
    };
    store.settle_outgoing(outgoing.id, account, copy.as_deref())
}

fn append(mailbox: &Mailbox, outgoing: &Outgoing, draft: bool) -> Result<String, String> {
    serde_json::to_string(&Operation::Append {
        mailbox: mailbox.id,
        raw: STANDARD.encode(&outgoing.raw),
        draft,
    })
    .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::record_accepted;
    use crate::mail::compose::Draft;
    use crate::store::fixture::Account;
    use crate::store::{Outgoing, now};
    use crate::sync::ops::{self, Operation};

    fn due(account: &Account) -> Outgoing {
        let outgoing = Outgoing {
            id: 0,
            account: account.id,
            raw: b"Subject: Harbour photos\r\n\r\nSee you there.\r\n".to_vec(),
            sender: "mara@example.test".into(),
            recipients: vec!["theo@example.test".into()],
            remind_at: None,
            placed: None,
        };
        let draft = Draft {
            account: account.id,
            identity: 0,
            from: None,
            to: Vec::new(),
            cc: Vec::new(),
            bcc: Vec::new(),
            subject: "Harbour photos".into(),
            html: String::new(),
            text: "See you there.".into(),
            attachments: Vec::new(),
            in_reply_to: None,
            references: Vec::new(),
            send_at: None,
            remind_after: None,
        };
        account
            .store
            .queue_outgoing(&outgoing, &draft, now() - 1)
            .unwrap();
        account.store.due_outgoing().unwrap().remove(0)
    }

    #[test]
    fn accepted_mail_never_comes_due_again_even_when_its_sent_copy_cant_be_saved() {
        let account = Account::new();
        let outgoing = due(&account);

        record_accepted(&account.store, account.id, &outgoing, false).unwrap();
        assert!(account.store.due_outgoing().unwrap().is_empty());
        let queued = account.store.queued(account.id).unwrap();
        let copy: Operation = serde_json::from_str(&queued[0].operation).unwrap();
        assert!(matches!(
            copy,
            Operation::Append { mailbox, draft: false, .. } if mailbox == account.sent.id
        ));
        let gave_up = ops::give_up(&account.store, &copy, "NO [TRYCREATE] No such folder");
        assert!(gave_up.unwrap().is_some());
    }

    #[test]
    fn mail_a_server_files_itself_gets_no_second_copy() {
        let account = Account::new();
        let outgoing = due(&account);

        record_accepted(&account.store, account.id, &outgoing, true).unwrap();
        assert!(account.store.due_outgoing().unwrap().is_empty());
        assert!(account.store.queued(account.id).unwrap().is_empty());
    }
}
