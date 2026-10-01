mod client_pin;
mod credential_management;
mod get_assertion;
mod hmac_secret;
mod info;
mod make_credential;
mod presence;
#[cfg(test)]
mod tests;

use std::time::Instant;

use ciborium::Value;

use crate::cbor;
use crate::model::Credential;
use crate::pin::protocol::KeyAgreement;
use crate::pin::token::Token;
use crate::platform::{Platform, Prompt, Purpose};
use crate::status::{Result, Status};

const MAKE_CREDENTIAL: u8 = 0x01;
const GET_ASSERTION: u8 = 0x02;
const GET_INFO: u8 = 0x04;
const CLIENT_PIN: u8 = 0x06;
const RESET: u8 = 0x07;
const GET_NEXT_ASSERTION: u8 = 0x08;
const CREDENTIAL_MANAGEMENT: u8 = 0x0A;
const SELECTION: u8 = 0x0B;

struct PendingAssertions {
    rp_id: String,
    client_data_hash: Vec<u8>,
    flags: u8,
    hmac_secret: Option<hmac_secret::Request>,
    remaining: Vec<Credential>,
    started: Instant,
}

enum Listing {
    RelyingParties(Vec<Credential>),
    Credentials(Vec<Credential>),
}

pub struct Authenticator<P> {
    platform: P,
    key_agreement: KeyAgreement,
    token: Option<Token>,
    pending: Option<PendingAssertions>,
    listing: Option<Listing>,
}

impl<P: Platform> Authenticator<P> {
    pub fn new(platform: P) -> Self {
        Self {
            platform,
            key_agreement: KeyAgreement::generate(),
            token: None,
            pending: None,
            listing: None,
        }
    }

    pub fn platform(&self) -> &P {
        &self.platform
    }

    pub async fn handle(&mut self, request: &[u8]) -> Vec<u8> {
        let Some((&command, body)) = request.split_first() else {
            return vec![Status::InvalidLength.code()];
        };
        if command != GET_NEXT_ASSERTION {
            self.pending = None;
        }
        if command != CREDENTIAL_MANAGEMENT {
            self.listing = None;
        }
        let result = match command {
            MAKE_CREDENTIAL => self.make_credential(body).await.map(Some),
            GET_ASSERTION => self.get_assertion(body).await.map(Some),
            GET_INFO => Ok(Some(info::get_info())),
            CLIENT_PIN => self.client_pin(body).await.map(Some),
            RESET => Err(Status::OperationDenied),
            GET_NEXT_ASSERTION => self.get_next_assertion().await.map(Some),
            CREDENTIAL_MANAGEMENT => self.credential_management(body).await,
            SELECTION => self.choose().await.map(|()| None),
            _ => Err(Status::InvalidCommand),
        };
        match result {
            Ok(Some(value)) => [vec![0], cbor::encode(&value)].concat(),
            Ok(None) => vec![0],
            Err(status) => vec![status.code()],
        }
    }

    async fn choose(&self) -> Result<()> {
        let prompt = Prompt {
            purpose: Purpose::Choose,
            rp_id: None,
            rp_name: None,
            accounts: &[],
        };
        self.platform.ask(prompt).await.map(drop)
    }
}

fn response(entries: impl IntoIterator<Item = (i64, Value)>) -> Value {
    cbor::map(entries)
}
