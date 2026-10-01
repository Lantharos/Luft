use ciborium::Value;

use super::Authenticator;
use crate::cbor::{self, Fields};
use crate::model::PublicKey;
use crate::pin::protocol::Protocol;
use crate::platform::Platform;
use crate::status::{Result, Status};

pub const NAME: &str = "hmac-secret";

#[derive(Clone)]
pub struct Request {
    key_agreement: PublicKey,
    salt_enc: Vec<u8>,
    salt_auth: Vec<u8>,
    protocol: Protocol,
}

pub fn requested(extensions: Option<&Value>) -> Result<Option<Request>> {
    let Some(input) = extensions
        .map(Fields::new)
        .transpose()?
        .and_then(|fields| fields.get(NAME))
    else {
        return Ok(None);
    };
    let fields = Fields::new(input)?;
    Ok(Some(Request {
        key_agreement: PublicKey::from_cose(fields.required(0x01)?)?,
        salt_enc: cbor::bytes(fields.required(0x02)?)?.to_vec(),
        salt_auth: cbor::bytes(fields.required(0x03)?)?.to_vec(),
        protocol: fields
            .get(0x04)
            .map(|number| Protocol::from_number(cbor::integer(number)?))
            .transpose()?
            .unwrap_or(Protocol::One),
    }))
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn hmac_secret(
        &self,
        request: &Request,
        id: &[u8],
        verified: bool,
    ) -> Result<Value> {
        let shared = self
            .key_agreement
            .shared_secret(request.protocol, &request.key_agreement)?;
        if !shared.verify(&request.salt_enc, &request.salt_auth) {
            return Err(Status::PinAuthInvalid);
        }
        let salts = shared.decrypt(&request.salt_enc)?;
        if salts.len() != 32 && salts.len() != 64 {
            return Err(Status::InvalidLength);
        }
        let output = self.platform.hmac_secret(id, verified, &salts).await?;
        Ok(Value::Bytes(shared.encrypt(&output)))
    }
}
