use ciborium::Value;

use super::Authenticator;
use crate::auth_data::{USER_PRESENT, USER_VERIFIED};
use crate::cbor;
use crate::pin::protocol::Protocol;
use crate::platform::{Consent, Platform, Prompt};
use crate::status::{Result, Status};

pub struct Approval {
    pub flags: u8,
    pub account: Option<usize>,
}

impl<P: Platform> Authenticator<P> {
    pub(super) async fn authorize_with_token(
        &mut self,
        param: Option<&Value>,
        protocol: Option<&Value>,
        client_data_hash: &[u8],
        permission: u8,
        rp_id: &str,
    ) -> Result<bool> {
        let Some(param) = param else {
            return Ok(false);
        };
        let param = cbor::bytes(param)?;
        if param.is_empty() {
            self.choose().await?;
            return Err(Status::PinNotSet);
        }
        let protocol =
            Protocol::from_number(cbor::integer(protocol.ok_or(Status::MissingParameter)?)?)?;
        let token = self.token.as_mut().ok_or(Status::PinAuthInvalid)?;
        token.authorize(protocol, client_data_hash, param, permission, Some(rp_id))?;
        Ok(true)
    }

    pub(super) async fn approve(
        &mut self,
        by_token: bool,
        presence: bool,
        prompt: Prompt<'_>,
    ) -> Result<Approval> {
        let presence_flag = if presence { USER_PRESENT } else { 0 };
        if by_token {
            let token = self
                .token
                .as_mut()
                .expect("a token authorized this request");
            if !presence || token.take_presence() {
                return Ok(Approval {
                    flags: USER_VERIFIED | presence_flag,
                    account: None,
                });
            }
        }
        Ok(match self.platform.ask(prompt).await? {
            Consent::Verified { account } => Approval {
                flags: USER_VERIFIED | presence_flag,
                account: Some(account),
            },
            Consent::Confirmed => Approval {
                flags: USER_PRESENT,
                account: None,
            },
        })
    }

    pub(super) fn spend_token(&mut self, by_token: bool) {
        if by_token {
            self.token
                .as_mut()
                .expect("a token authorized this request")
                .spend();
        }
    }
}
