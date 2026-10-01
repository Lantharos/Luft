use std::future::Future;

use zeroize::Zeroizing;

use crate::model::{Credential, NewCredential, User};
use crate::status::Result;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Purpose {
    Register,
    SignIn,
    Manage,
    AlreadyRegistered,
    Choose,
}

#[derive(Debug, Clone, Copy)]
pub struct Prompt<'a> {
    pub purpose: Purpose,
    pub rp_id: Option<&'a str>,
    pub rp_name: Option<&'a str>,
    pub accounts: &'a [User],
}

impl Prompt<'_> {
    pub fn needs_verification(&self) -> bool {
        matches!(
            self.purpose,
            Purpose::Register | Purpose::SignIn | Purpose::Manage
        )
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Consent {
    Verified { account: usize },
    Confirmed,
}

pub trait Platform {
    fn ask(&self, prompt: Prompt<'_>) -> impl Future<Output = Result<Consent>>;
    fn credentials(&self, rp_id: &str) -> impl Future<Output = Result<Vec<Credential>>>;
    fn all_credentials(&self) -> impl Future<Output = Result<Vec<Credential>>>;
    fn create(&self, request: NewCredential) -> impl Future<Output = Result<Credential>>;
    fn next_count(&self, id: &[u8]) -> impl Future<Output = Result<u32>>;
    fn sign(&self, id: &[u8], message: &[u8]) -> impl Future<Output = Result<Vec<u8>>>;
    fn hmac_secret(
        &self,
        id: &[u8],
        verified: bool,
        salts: &[u8],
    ) -> impl Future<Output = Result<Zeroizing<Vec<u8>>>>;
    fn delete(&self, id: &[u8]) -> impl Future<Output = Result<()>>;
    fn update_user(&self, id: &[u8], user: User) -> impl Future<Output = Result<()>>;
}
