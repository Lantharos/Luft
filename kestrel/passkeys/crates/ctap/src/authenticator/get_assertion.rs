use std::time::{Duration, Instant};

use ciborium::Value;

use super::{Authenticator, PendingAssertions, hmac_secret, response};
use crate::auth_data::{AuthData, USER_PRESENT, USER_VERIFIED};
use crate::cbor::{self, Fields};
use crate::model::{Credential, User, descriptor, descriptor_ids};
use crate::pin::token::GET_ASSERTION;
use crate::platform::{Platform, Prompt, Purpose};
use crate::status::{Result, Status};

const NEXT_ASSERTION_WINDOW: Duration = Duration::from_secs(30);

struct Options {
    presence: bool,
    verification: bool,
}

fn options(value: Option<&Value>) -> Result<Options> {
    let Some(value) = value else {
        return Ok(Options {
            presence: true,
            verification: false,
        });
    };
    let fields = Fields::new(value)?;
    if fields.get("rk").is_some() {
        return Err(Status::UnsupportedOption);
    }
    Ok(Options {
        presence: fields
            .get("up")
            .map(cbor::boolean)
            .transpose()?
            .unwrap_or(true),
        verification: fields
            .get("uv")
            .map(cbor::boolean)
            .transpose()?
            .unwrap_or(false),
    })
}

struct Assertion<'a> {
    credential: &'a Credential,
    rp_id: &'a str,
    client_data_hash: &'a [u8],
    flags: u8,
    hmac_secret: Option<&'a hmac_secret::Request>,
    discoverable: bool,
    total: Option<usize>,
    selected: bool,
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn get_assertion(&mut self, body: &[u8]) -> Result<Value> {
        let value = cbor::decode(body)?;
        let fields = Fields::new(&value)?;
        let rp_id = cbor::text(fields.required(0x01)?)?;
        let client_data_hash = cbor::bytes(fields.required(0x02)?)?;
        let allowed = fields
            .get(0x03)
            .map(descriptor_ids)
            .transpose()?
            .unwrap_or_default();
        let hmac_secret = hmac_secret::requested(fields.get(0x04))?;
        let options = options(fields.get(0x05))?;
        let by_token = self
            .authorize_with_token(
                fields.get(0x06),
                fields.get(0x07),
                client_data_hash,
                GET_ASSERTION,
                rp_id,
            )
            .await?;

        let listed = !allowed.is_empty();
        let verifying = by_token || options.presence || options.verification;
        let mut candidates = self.platform.credentials(rp_id).await?;
        candidates.retain(|credential| {
            let eligible = if listed {
                allowed.contains(&credential.id)
            } else {
                credential.discoverable
            };
            eligible && credential.protection.allows(verifying, listed)
        });
        if candidates.is_empty() {
            return Err(Status::NoCredentials);
        }

        let (flags, account) = if options.presence || options.verification || by_token {
            let accounts: Vec<User> = candidates
                .iter()
                .map(|credential| credential.user.clone())
                .collect();
            let rp_name = candidates[0].rp.name.as_deref();
            let prompt = Prompt {
                purpose: Purpose::SignIn,
                rp_id: Some(rp_id),
                rp_name,
                accounts: &accounts,
            };
            let approval = self.approve(by_token, options.presence, prompt).await?;
            (approval.flags, approval.account)
        } else {
            (0, None)
        };
        self.spend_token(by_token);

        if let Some(account) = account {
            let credential = candidates.get(account).ok_or(Status::Other)?;
            let selected = !listed && candidates.len() > 1;
            let assertion = Assertion {
                credential,
                rp_id,
                client_data_hash,
                flags,
                hmac_secret: hmac_secret.as_ref(),
                discoverable: !listed,
                total: None,
                selected,
            };
            return self.assert(assertion).await;
        }

        let total = (!listed && candidates.len() > 1).then_some(candidates.len());
        let first = candidates.remove(0);
        let assertion = Assertion {
            credential: &first,
            rp_id,
            client_data_hash,
            flags,
            hmac_secret: hmac_secret.as_ref(),
            discoverable: !listed,
            total,
            selected: false,
        };
        let reply = self.assert(assertion).await?;
        if total.is_some() {
            self.pending = Some(PendingAssertions {
                rp_id: rp_id.to_owned(),
                client_data_hash: client_data_hash.to_vec(),
                flags,
                hmac_secret,
                remaining: candidates,
                started: Instant::now(),
            });
        }
        Ok(reply)
    }

    pub(super) async fn get_next_assertion(&mut self) -> Result<Value> {
        let mut pending = self.pending.take().ok_or(Status::NotAllowed)?;
        if pending.started.elapsed() > NEXT_ASSERTION_WINDOW || pending.remaining.is_empty() {
            return Err(Status::NotAllowed);
        }
        let credential = pending.remaining.remove(0);
        let assertion = Assertion {
            credential: &credential,
            rp_id: &pending.rp_id,
            client_data_hash: &pending.client_data_hash,
            flags: pending.flags,
            hmac_secret: pending.hmac_secret.as_ref(),
            discoverable: true,
            total: None,
            selected: false,
        };
        let reply = self.assert(assertion).await?;
        self.pending = Some(pending);
        Ok(reply)
    }

    async fn assert(&self, assertion: Assertion<'_>) -> Result<Value> {
        let credential = assertion.credential;
        let extensions = match assertion.hmac_secret {
            Some(request) if assertion.flags & USER_PRESENT != 0 => {
                let verified = assertion.flags & USER_VERIFIED != 0;
                let output = self.hmac_secret(request, &credential.id, verified).await?;
                Some(cbor::map([(hmac_secret::NAME, output)]))
            }
            _ => None,
        };
        let counter = self.platform.next_count(&credential.id).await?;
        let auth_data = AuthData {
            rp_id: assertion.rp_id,
            flags: assertion.flags,
            counter,
            attested: None,
            extensions,
        }
        .encode();
        let signature = self
            .platform
            .sign(
                &credential.id,
                &[auth_data.as_slice(), assertion.client_data_hash].concat(),
            )
            .await?;
        let mut entries = vec![
            (0x01, descriptor(&credential.id)),
            (0x02, Value::Bytes(auth_data)),
            (0x03, Value::Bytes(signature)),
        ];
        if assertion.discoverable {
            entries.push((
                0x04,
                credential
                    .user
                    .to_cbor(assertion.flags & USER_VERIFIED != 0),
            ));
        }
        entries.extend(assertion.total.map(|total| (0x05, cbor::count(total))));
        if assertion.selected {
            entries.push((0x06, Value::from(true)));
        }
        Ok(response(entries))
    }
}
