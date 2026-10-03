use serde_json::{Value, json};

use super::JmapRemote;
use crate::protocols::jmap::{CORE, MAIL, SUBMISSION};
use crate::store::Identity;
use crate::sync::remote::Context;

fn from_server(account: i64, identity: &Value) -> Option<Identity> {
    Some(Identity {
        id: 0,
        account,
        name: identity["name"].as_str().unwrap_or_default().to_owned(),
        address: identity["email"].as_str()?.to_lowercase(),
        reply_to: identity["replyTo"][0]["email"]
            .as_str()
            .unwrap_or_default()
            .to_owned(),
        signature: identity["textSignature"]
            .as_str()
            .unwrap_or_default()
            .to_owned(),
        preferred: false,
        remote: Some(identity["id"].as_str()?.to_owned()),
    })
}

fn covers(identity: &Value, address: &str) -> bool {
    let Some(email) = identity["email"].as_str() else {
        return false;
    };
    match email.strip_prefix("*@") {
        Some(domain) => address
            .rsplit_once('@')
            .is_some_and(|(_, at)| at.eq_ignore_ascii_case(domain)),
        None => email.eq_ignore_ascii_case(address),
    }
}

fn settings(identity: &Identity) -> Value {
    let reply_to = (!identity.reply_to.is_empty())
        .then(|| json!([{ "name": null, "email": identity.reply_to }]));
    json!({ "name": identity.name, "replyTo": reply_to, "textSignature": identity.signature })
}

impl JmapRemote {
    fn listed_identities(&self) -> Result<Vec<Value>, String> {
        let responses = self.client.call(
            &[CORE, MAIL, SUBMISSION],
            vec![("Identity/get", json!({ "accountId": self.client.account }))],
        )?;
        Ok(responses[0]["list"].as_array().cloned().unwrap_or_default())
    }

    fn set_identity(&self, change: Value) -> Result<Value, String> {
        let mut arguments = json!({ "accountId": self.client.account });
        for (key, value) in change.as_object().into_iter().flatten() {
            arguments[key] = value.clone();
        }
        let responses = self
            .client
            .call(&[CORE, MAIL, SUBMISSION], vec![("Identity/set", arguments)])?;
        let refused = ["notCreated", "notUpdated", "notDestroyed"]
            .iter()
            .find_map(|key| responses[0][key].as_object()?.values().next().cloned());
        match refused {
            Some(failure) => Err(failure["description"]
                .as_str()
                .unwrap_or("The server refused this address")
                .to_owned()),
            None => Ok(responses[0].clone()),
        }
    }

    pub(super) fn load_identities(&self, context: &Context) -> Result<bool, String> {
        let found: Vec<Identity> = self
            .listed_identities()?
            .iter()
            .filter_map(|identity| from_server(context.account.id, identity))
            .collect();
        context
            .store
            .merge_identities(context.account.id, &found, true)
    }

    pub(super) fn push_identity(
        &self,
        context: &Context,
        id: i64,
        remote: Option<&str>,
    ) -> Result<(), String> {
        match (context.store.identity(id)?, remote) {
            (Some(identity), None) => {
                let mut created = settings(&identity);
                created["email"] = json!(identity.address);
                let response = self.set_identity(json!({ "create": { "new": created } }))?;
                let remote = response["created"]["new"]["id"]
                    .as_str()
                    .ok_or("The server didn't keep this address")?;
                context.store.set_identity_remote(id, remote)
            }
            (Some(identity), Some(remote)) => self
                .set_identity(json!({ "update": { remote: settings(&identity) } }))
                .map(drop),
            (None, Some(remote)) => self.set_identity(json!({ "destroy": [remote] })).map(drop),
            (None, None) => Ok(()),
        }
    }

    pub(super) fn sending_identity(&self, address: &str, name: &str) -> Result<String, String> {
        let listed = self.listed_identities()?;
        let found = listed
            .iter()
            .find(|identity| {
                identity["email"]
                    .as_str()
                    .is_some_and(|email| email.eq_ignore_ascii_case(address))
            })
            .or_else(|| listed.iter().find(|identity| covers(identity, address)))
            .and_then(|identity| identity["id"].as_str().map(str::to_owned));
        if let Some(found) = found {
            return Ok(found);
        }
        let response =
            self.set_identity(json!({ "create": { "own": { "email": address, "name": name } } }))?;
        response["created"]["own"]["id"]
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| format!("{address} can't send from this account"))
    }
}
