use std::time::{Duration, Instant};

use zeroize::Zeroizing;

use super::protocol::Protocol;
use crate::status::{Result, Status};

pub const MAKE_CREDENTIAL: u8 = 0x01;
pub const GET_ASSERTION: u8 = 0x02;
pub const CREDENTIAL_MANAGEMENT: u8 = 0x04;
pub const SUPPORTED: u8 = MAKE_CREDENTIAL | GET_ASSERTION | CREDENTIAL_MANAGEMENT;

const IDLE_LIMIT: Duration = Duration::from_secs(30);

pub struct Token {
    key: Zeroizing<[u8; 32]>,
    protocol: Protocol,
    permissions: u8,
    rp_id: Option<String>,
    user_present: bool,
    last_used: Instant,
}

impl Token {
    pub fn issue(protocol: Protocol, permissions: u8, rp_id: Option<String>) -> Self {
        Self {
            key: Zeroizing::new(crate::random()),
            protocol,
            permissions,
            rp_id,
            user_present: true,
            last_used: Instant::now(),
        }
    }

    pub fn key(&self) -> &[u8; 32] {
        &self.key
    }

    pub fn authorize(
        &mut self,
        protocol: Protocol,
        message: &[u8],
        param: &[u8],
        permission: u8,
        rp_id: Option<&str>,
    ) -> Result<()> {
        let fresh = self.last_used.elapsed() < IDLE_LIMIT;
        if !fresh
            || protocol != self.protocol
            || !protocol.verify(self.key.as_slice(), message, param)
        {
            return Err(Status::PinAuthInvalid);
        }
        if self.permissions & permission == 0 {
            return Err(Status::PinAuthInvalid);
        }
        match (&self.rp_id, rp_id) {
            (Some(bound), Some(requested)) if bound != requested => {
                return Err(Status::PinAuthInvalid);
            }
            (None, Some(requested)) => self.rp_id = Some(requested.to_owned()),
            _ => {}
        }
        self.last_used = Instant::now();
        Ok(())
    }

    pub fn take_presence(&mut self) -> bool {
        std::mem::take(&mut self.user_present)
    }

    pub fn spend(&mut self) {
        self.permissions &= !(MAKE_CREDENTIAL | GET_ASSERTION);
        self.user_present = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn binds_to_the_first_relying_party_and_refuses_others() {
        let mut token = Token::issue(Protocol::Two, GET_ASSERTION, None);
        let param = Protocol::Two.authenticate(token.key(), b"hash");
        token
            .authorize(
                Protocol::Two,
                b"hash",
                &param,
                GET_ASSERTION,
                Some("example.com"),
            )
            .unwrap();
        assert_eq!(
            token.authorize(
                Protocol::Two,
                b"hash",
                &param,
                GET_ASSERTION,
                Some("evil.example")
            ),
            Err(Status::PinAuthInvalid)
        );
    }

    #[test]
    fn refuses_missing_permissions_and_spent_tokens() {
        let mut token = Token::issue(Protocol::Two, MAKE_CREDENTIAL, Some("example.com".into()));
        let param = Protocol::Two.authenticate(token.key(), b"hash");
        assert_eq!(
            token.authorize(Protocol::Two, b"hash", &param, CREDENTIAL_MANAGEMENT, None),
            Err(Status::PinAuthInvalid)
        );
        token
            .authorize(
                Protocol::Two,
                b"hash",
                &param,
                MAKE_CREDENTIAL,
                Some("example.com"),
            )
            .unwrap();
        token.spend();
        assert_eq!(
            token.authorize(
                Protocol::Two,
                b"hash",
                &param,
                MAKE_CREDENTIAL,
                Some("example.com")
            ),
            Err(Status::PinAuthInvalid)
        );
    }
}
