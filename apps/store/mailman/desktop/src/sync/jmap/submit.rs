use serde_json::{Value, json};

use super::JmapRemote;
use crate::protocols::jmap::{CORE, MAIL, SUBMISSION};
use crate::store::{Delivery, Outgoing, Role};
use crate::sync::remote::Context;

enum Copy {
    Unsent(String),
    Submitted,
    Missing,
}

impl JmapRemote {
    pub(super) fn submit(
        &mut self,
        context: &Context,
        outgoing: &Outgoing,
    ) -> Result<Delivery, String> {
        let identity = self.sending_identity(&outgoing.sender, &context.account.name)?;
        let email = match self.placed_copy(outgoing)? {
            Copy::Submitted => return Ok(Delivery::Sent),
            Copy::Unsent(email) => email,
            Copy::Missing => self.place(context, outgoing)?,
        };
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
                } }, "onSuccessUpdateEmail": { "#send": { "keywords/$draft": null } } }),
            )],
        )?;
        let failure = &responses[0]["notCreated"]["send"];
        if !failure.is_object() {
            return Ok(Delivery::Sent);
        }
        self.destroy(&[email])?;
        let reason = failure["description"]
            .as_str()
            .or(failure["type"].as_str())
            .unwrap_or("The server refused it")
            .to_owned();
        match failure["type"].as_str() {
            Some("serverFail" | "serverUnavailable" | "forbiddenToSend") => Err(reason),
            _ => Ok(Delivery::Refused(reason)),
        }
    }

    fn place(&self, context: &Context, outgoing: &Outgoing) -> Result<String, String> {
        let sent = context
            .store
            .mailbox_with_role(context.account.id, Role::Sent)?
            .ok_or("This account has no Sent folder")?;
        let email = self.import(
            &outgoing.raw,
            &sent.remote,
            json!({ "$seen": true, "$draft": true }),
        )?;
        context.store.place_outgoing(outgoing.id, &email)?;
        Ok(email)
    }

    fn placed_copy(&self, outgoing: &Outgoing) -> Result<Copy, String> {
        let Some(email) = &outgoing.placed else {
            return Ok(Copy::Missing);
        };
        let responses = self.client.call(
            &[CORE, MAIL],
            vec![(
                "Email/get",
                json!({ "accountId": self.client.account, "ids": [email], "properties": ["keywords"] }),
            )],
        )?;
        Ok(match responses[0]["list"].get(0) {
            None => Copy::Missing,
            Some(found) if found["keywords"]["$draft"] == true => Copy::Unsent(email.clone()),
            Some(_) => Copy::Submitted,
        })
    }
}
