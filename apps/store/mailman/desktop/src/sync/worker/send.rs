use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde::Serialize;
use specta::Type;

use super::Worker;
use crate::events::OUTBOX;
use crate::mail::envelope;
use crate::store::{Delivery, Mailbox, Outgoing, Role};
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
        let delivered = self.with_remote(|remote, context| remote.send(context, outgoing));
        let settled = self.settle(outgoing, delivered);
        self.shared.sending.lock().remove(&id);
        if let Err(error) = settled {
            self.fail(error);
        }
    }

    fn settle(
        &mut self,
        outgoing: &Outgoing,
        delivered: Result<Delivery, String>,
    ) -> Result<(), String> {
        match delivered {
            Ok(Delivery::Sent) => self.sent(outgoing),
            Ok(Delivery::Refused(reason)) => self.refused(outgoing, reason),
            Err(reason) => self.retry_later(outgoing.id, reason),
        }
    }

    fn sent(&mut self, outgoing: &Outgoing) -> Result<(), String> {
        let id = outgoing.id;
        self.shared.store.finish_outgoing(id)?;
        self.shared.events.emit(OUTBOX, OutboxEvent::Sent { id });
        self.shared.notifier.sent();
        if let Some(at) = outgoing.remind_at {
            let sent = envelope::parse(&outgoing.raw);
            if let Some(message_id) = sent.message_id {
                self.shared
                    .store
                    .add_reminder(&message_id, self.account.id, &sent.subject, at)?;
            }
        }
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
        let shelved = Operation::Append {
            mailbox: drafts.id,
            raw: STANDARD.encode(&outgoing.raw),
            draft: true,
        };
        let shelved = serde_json::to_string(&shelved).map_err(|error| error.to_string())?;
        self.shared
            .store
            .shelve_outgoing(outgoing.id, self.account.id, &shelved)?;
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
