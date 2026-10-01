use ciborium::Value;

use super::{Authenticator, Listing, response};
use crate::auth_data::rp_id_hash;
use crate::cbor::{self, Fields};
use crate::model::{Credential, ES256, User, descriptor, descriptor_ids};
use crate::pin::protocol::Protocol;
use crate::pin::token::CREDENTIAL_MANAGEMENT;
use crate::platform::Platform;
use crate::status::{Result, Status};

const GET_METADATA: u8 = 0x01;
const ENUMERATE_RPS: u8 = 0x02;
const NEXT_RP: u8 = 0x03;
const ENUMERATE_CREDENTIALS: u8 = 0x04;
const NEXT_CREDENTIAL: u8 = 0x05;
const DELETE: u8 = 0x06;
const UPDATE_USER: u8 = 0x07;
const REMAINING_CAPACITY: i64 = 10_000;

fn rp_entry(credential: &Credential, total: Option<usize>) -> Value {
    let mut entries = vec![
        (0x03, credential.rp.to_cbor()),
        (0x04, Value::Bytes(rp_id_hash(&credential.rp.id))),
    ];
    entries.extend(total.map(|total| (0x05, cbor::count(total))));
    response(entries)
}

fn credential_entry(credential: &Credential, total: Option<usize>) -> Value {
    let mut entries = vec![
        (0x06, credential.user.to_cbor(true)),
        (0x07, descriptor(&credential.id)),
        (0x08, credential.public_key.to_cose(ES256)),
    ];
    entries.extend(total.map(|total| (0x09, cbor::count(total))));
    entries.push((0x0A, Value::from(credential.protection.level())));
    response(entries)
}

fn credential_id(parameters: &Fields<'_>) -> Result<Vec<u8>> {
    let descriptor = parameters.required(0x02)?;
    descriptor_ids(&Value::Array(vec![descriptor.clone()]))?
        .pop()
        .ok_or(Status::InvalidParameter)
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn credential_management(&mut self, body: &[u8]) -> Result<Option<Value>> {
        let value = cbor::decode(body)?;
        let fields = Fields::new(&value)?;
        let subcommand = u8::try_from(cbor::integer(fields.required(0x01)?)?)
            .map_err(|_| Status::InvalidSubcommand)?;
        let parameters = fields.get(0x02);
        if !matches!(subcommand, NEXT_RP | NEXT_CREDENTIAL) {
            self.listing = None;
            let protocol = Protocol::from_number(cbor::integer(fields.required(0x03)?)?)?;
            let param = cbor::bytes(fields.required(0x04)?)?;
            let mut message = vec![subcommand];
            if let Some(parameters) = parameters {
                message.extend_from_slice(&cbor::encode(parameters));
            }
            let token = self.token.as_mut().ok_or(Status::PinAuthInvalid)?;
            token.authorize(protocol, &message, param, CREDENTIAL_MANAGEMENT, None)?;
        }
        let parameters = parameters.map(Fields::new).transpose()?;
        match subcommand {
            GET_METADATA => {
                let count = self.discoverable().await?.len();
                Ok(Some(response([
                    (0x01, cbor::count(count)),
                    (0x02, Value::from(REMAINING_CAPACITY)),
                ])))
            }
            ENUMERATE_RPS => {
                let mut relying_parties = self.discoverable().await?;
                relying_parties.dedup_by(|a, b| a.rp.id == b.rp.id);
                let first = relying_parties.first().ok_or(Status::NoCredentials)?;
                let reply = rp_entry(first, Some(relying_parties.len()));
                self.listing = Some(Listing::RelyingParties(relying_parties.split_off(1)));
                Ok(Some(reply))
            }
            ENUMERATE_CREDENTIALS => {
                let hash =
                    cbor::bytes(parameters.ok_or(Status::MissingParameter)?.required(0x01)?)?
                        .to_vec();
                let mut credentials = self.discoverable().await?;
                credentials.retain(|credential| rp_id_hash(&credential.rp.id) == hash);
                let first = credentials.first().ok_or(Status::NoCredentials)?;
                let reply = credential_entry(first, Some(credentials.len()));
                self.listing = Some(Listing::Credentials(credentials.split_off(1)));
                Ok(Some(reply))
            }
            NEXT_RP | NEXT_CREDENTIAL => self.next_listed(subcommand).map(Some),
            DELETE => {
                let id = credential_id(&parameters.ok_or(Status::MissingParameter)?)?;
                self.find(&id).await?;
                self.platform.delete(&id).await.map(|()| None)
            }
            UPDATE_USER => {
                let parameters = parameters.ok_or(Status::MissingParameter)?;
                let id = credential_id(&parameters)?;
                let user = User::parse(parameters.required(0x03)?)?;
                if self.find(&id).await?.user.id != user.id {
                    return Err(Status::InvalidParameter);
                }
                self.platform.update_user(&id, user).await.map(|()| None)
            }
            _ => Err(Status::InvalidSubcommand),
        }
    }

    fn next_listed(&mut self, subcommand: u8) -> Result<Value> {
        match (subcommand, self.listing.as_mut()) {
            (NEXT_RP, Some(Listing::RelyingParties(remaining))) if !remaining.is_empty() => {
                Ok(rp_entry(&remaining.remove(0), None))
            }
            (NEXT_CREDENTIAL, Some(Listing::Credentials(remaining))) if !remaining.is_empty() => {
                Ok(credential_entry(&remaining.remove(0), None))
            }
            _ => Err(Status::NotAllowed),
        }
    }

    async fn discoverable(&self) -> Result<Vec<Credential>> {
        let mut credentials = self.platform.all_credentials().await?;
        credentials.retain(|credential| credential.discoverable);
        credentials.sort_by(|a, b| a.rp.id.cmp(&b.rp.id));
        Ok(credentials)
    }

    async fn find(&self, id: &[u8]) -> Result<Credential> {
        self.discoverable()
            .await?
            .into_iter()
            .find(|credential| credential.id == id)
            .ok_or(Status::NoCredentials)
    }
}
