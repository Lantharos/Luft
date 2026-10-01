use ciborium::Value;

use super::{Authenticator, hmac_secret, response};
use crate::auth_data::AuthData;
use crate::cbor::{self, Fields};
use crate::model::{ES256, NewCredential, Protection, RelyingParty, User, descriptor_ids};
use crate::pin::token::MAKE_CREDENTIAL;
use crate::platform::{Platform, Prompt, Purpose};
use crate::status::{Result, Status};

struct Options {
    discoverable: bool,
}

fn options(value: Option<&Value>) -> Result<Options> {
    let Some(value) = value else {
        return Ok(Options {
            discoverable: false,
        });
    };
    let fields = Fields::new(value)?;
    if fields.get("up").map(cbor::boolean).transpose()? == Some(false) {
        return Err(Status::InvalidOption);
    }
    fields.get("uv").map(cbor::boolean).transpose()?;
    Ok(Options {
        discoverable: fields
            .get("rk")
            .map(cbor::boolean)
            .transpose()?
            .unwrap_or(false),
    })
}

fn supports_es256(parameters: &Value) -> Result<bool> {
    let mut supported = false;
    for parameter in cbor::array(parameters)? {
        let fields = Fields::new(parameter)?;
        let algorithm = cbor::integer(fields.required("alg")?)?;
        let kind = cbor::text(fields.required("type")?)?;
        supported |= algorithm == ES256 && kind == "public-key";
    }
    Ok(supported)
}

struct Extensions {
    protection: Option<Protection>,
    hmac_secret: bool,
}

fn extensions(value: Option<&Value>) -> Result<Extensions> {
    let Some(value) = value else {
        return Ok(Extensions {
            protection: None,
            hmac_secret: false,
        });
    };
    let fields = Fields::new(value)?;
    Ok(Extensions {
        protection: fields
            .get("credProtect")
            .map(|level| Protection::from_level(cbor::integer(level)?))
            .transpose()?,
        hmac_secret: fields
            .get(hmac_secret::NAME)
            .map(cbor::boolean)
            .transpose()?
            .unwrap_or(false),
    })
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn make_credential(&mut self, body: &[u8]) -> Result<Value> {
        let value = cbor::decode(body)?;
        let fields = Fields::new(&value)?;
        let client_data_hash = cbor::bytes(fields.required(0x01)?)?;
        let rp = RelyingParty::parse(fields.required(0x02)?)?;
        let user = User::parse(fields.required(0x03)?)?;
        if !supports_es256(fields.required(0x04)?)? {
            return Err(Status::UnsupportedAlgorithm);
        }
        let excluded = fields
            .get(0x05)
            .map(descriptor_ids)
            .transpose()?
            .unwrap_or_default();
        let extensions = extensions(fields.get(0x06))?;
        let options = options(fields.get(0x07))?;
        if fields.get(0x0A).is_some() {
            return Err(Status::InvalidParameter);
        }
        let by_token = self
            .authorize_with_token(
                fields.get(0x08),
                fields.get(0x09),
                client_data_hash,
                MAKE_CREDENTIAL,
                &rp.id,
            )
            .await?;

        let existing = self.platform.credentials(&rp.id).await?;
        if existing
            .iter()
            .any(|credential| excluded.contains(&credential.id))
        {
            let prompt = Prompt {
                purpose: Purpose::AlreadyRegistered,
                rp_id: Some(&rp.id),
                rp_name: rp.name.as_deref(),
                accounts: &[],
            };
            self.platform.ask(prompt).await?;
            return Err(Status::CredentialExcluded);
        }

        let accounts = [user.clone()];
        let prompt = Prompt {
            purpose: Purpose::Register,
            rp_id: Some(&rp.id),
            rp_name: rp.name.as_deref(),
            accounts: &accounts,
        };
        let approval = self.approve(by_token, true, prompt).await?;
        let protection = extensions.protection.unwrap_or(Protection::UvOptional);
        let credential = self
            .platform
            .create(NewCredential {
                rp: rp.clone(),
                user: user.clone(),
                discoverable: options.discoverable,
                protection,
            })
            .await?;
        if options.discoverable {
            for replaced in existing
                .iter()
                .filter(|old| old.discoverable && old.user.id == user.id)
            {
                self.platform.delete(&replaced.id).await?;
            }
        }
        self.spend_token(by_token);

        let mut outputs = Vec::new();
        outputs.extend(
            extensions
                .protection
                .map(|level| ("credProtect", Value::from(level.level()))),
        );
        if extensions.hmac_secret {
            outputs.push((hmac_secret::NAME, Value::from(true)));
        }
        let auth_data = AuthData {
            rp_id: &rp.id,
            flags: approval.flags,
            counter: 0,
            attested: Some((&credential.id, credential.public_key)),
            extensions: (!outputs.is_empty()).then(|| cbor::map(outputs)),
        };
        Ok(response([
            (0x01, Value::from("none")),
            (0x02, Value::Bytes(auth_data.encode())),
            (0x03, cbor::map(Vec::<(Value, Value)>::new())),
        ]))
    }
}
