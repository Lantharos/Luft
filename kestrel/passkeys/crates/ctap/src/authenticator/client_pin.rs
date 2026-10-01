use ciborium::Value;

use super::{Authenticator, response};
use crate::cbor::{self, Fields};
use crate::model::{ECDH_ES_HKDF_256, PublicKey};
use crate::pin::protocol::Protocol;
use crate::pin::token::{GET_ASSERTION, MAKE_CREDENTIAL, SUPPORTED, Token};
use crate::platform::{Consent, Platform, Prompt, Purpose};
use crate::status::{Result, Status};

const GET_KEY_AGREEMENT: i64 = 0x02;
const GET_TOKEN_USING_UV: i64 = 0x06;
const GET_UV_RETRIES: i64 = 0x07;
const UV_RETRIES: i64 = 8;

fn purpose(permissions: u8) -> Purpose {
    if permissions & MAKE_CREDENTIAL != 0 {
        Purpose::Register
    } else if permissions & GET_ASSERTION != 0 {
        Purpose::SignIn
    } else {
        Purpose::Manage
    }
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn client_pin(&mut self, body: &[u8]) -> Result<Value> {
        let value = cbor::decode(body)?;
        let fields = Fields::new(&value)?;
        match cbor::integer(fields.required(0x02)?)? {
            GET_KEY_AGREEMENT => {
                Protocol::from_number(cbor::integer(fields.required(0x01)?)?)?;
                Ok(response([(
                    0x01,
                    self.key_agreement.public_key().to_cose(ECDH_ES_HKDF_256),
                )]))
            }
            GET_TOKEN_USING_UV => self.token_using_uv(&fields).await,
            GET_UV_RETRIES => Ok(response([(0x05, Value::from(UV_RETRIES))])),
            _ => Err(Status::InvalidSubcommand),
        }
    }

    async fn token_using_uv(&mut self, fields: &Fields<'_>) -> Result<Value> {
        let protocol = Protocol::from_number(cbor::integer(fields.required(0x01)?)?)?;
        let peer = PublicKey::from_cose(fields.required(0x03)?)?;
        let permissions = u8::try_from(cbor::integer(fields.required(0x09)?)?)
            .map_err(|_| Status::UnauthorizedPermission)?;
        let rp_id = fields.get(0x0A).map(cbor::text).transpose()?;
        if permissions == 0 {
            return Err(Status::InvalidParameter);
        }
        if permissions & !SUPPORTED != 0 {
            return Err(Status::UnauthorizedPermission);
        }
        if permissions & (MAKE_CREDENTIAL | GET_ASSERTION) != 0 && rp_id.is_none() {
            return Err(Status::MissingParameter);
        }
        let shared = self.key_agreement.shared_secret(protocol, &peer)?;
        self.token = None;
        let prompt = Prompt {
            purpose: purpose(permissions),
            rp_id,
            rp_name: None,
            accounts: &[],
        };
        let Consent::Verified { .. } = self.platform.ask(prompt).await? else {
            return Err(Status::OperationDenied);
        };
        let token = Token::issue(protocol, permissions, rp_id.map(str::to_owned));
        let encrypted = shared.encrypt(token.key());
        self.token = Some(token);
        Ok(response([(0x02, Value::Bytes(encrypted))]))
    }
}
