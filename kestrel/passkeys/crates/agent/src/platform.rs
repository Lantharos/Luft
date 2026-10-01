use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError};

use ctap::{Credential, NewCredential, Platform, Prompt, Status, User};
use zeroize::Zeroizing;

use crate::consent::Consent;
use crate::device::requester;
use crate::service::Notifier;
use crate::vault::Vault;

#[derive(Clone)]
pub struct Agent {
    vault: Vault,
    consent: Consent,
    notifier: Notifier,
    device: Arc<Mutex<Option<String>>>,
    waiting: Arc<AtomicBool>,
}

struct Waiting<'a>(&'a AtomicBool);

impl Drop for Waiting<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::Relaxed);
    }
}

impl Agent {
    pub fn new(vault: Vault, consent: Consent, notifier: Notifier) -> Self {
        Self {
            vault,
            consent,
            notifier,
            device: Arc::default(),
            waiting: Arc::default(),
        }
    }

    pub fn attach(&self, uniq: Option<String>) {
        *self.device.lock().unwrap_or_else(PoisonError::into_inner) = uniq;
    }

    pub fn waiting(&self) -> bool {
        self.waiting.load(Ordering::Relaxed)
    }

    fn requester(&self) -> Option<u32> {
        let uniq = self
            .device
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .clone()?;
        requester::find(&uniq)
    }
}

impl Platform for Agent {
    async fn ask(&self, prompt: Prompt<'_>) -> Result<ctap::Consent, Status> {
        let requester = self.requester();
        self.waiting.store(true, Ordering::Relaxed);
        let _waiting = Waiting(&self.waiting);
        self.consent.ask(prompt, requester).await
    }

    async fn credentials(&self, rp_id: &str) -> Result<Vec<Credential>, Status> {
        let mut passkeys = self.vault.list().await?;
        passkeys.retain(|passkey| passkey.credential.rp.id == rp_id);
        passkeys.sort_by_key(|passkey| std::cmp::Reverse(passkey.created));
        Ok(passkeys
            .into_iter()
            .map(|passkey| passkey.credential)
            .collect())
    }

    async fn all_credentials(&self) -> Result<Vec<Credential>, Status> {
        Ok(self
            .vault
            .list()
            .await?
            .into_iter()
            .map(|passkey| passkey.credential)
            .collect())
    }

    async fn create(&self, request: NewCredential) -> Result<Credential, Status> {
        let passkey = self.vault.create(&request).await?;
        self.notifier.changed().await;
        Ok(passkey.credential)
    }

    async fn next_count(&self, id: &[u8]) -> Result<u32, Status> {
        let count = self.vault.count(id).await?;
        self.notifier.changed().await;
        Ok(count)
    }

    async fn sign(&self, id: &[u8], message: &[u8]) -> Result<Vec<u8>, Status> {
        self.vault.sign(id, message).await
    }

    async fn hmac_secret(
        &self,
        id: &[u8],
        verified: bool,
        salts: &[u8],
    ) -> Result<Zeroizing<Vec<u8>>, Status> {
        self.vault.hmac_secret(id, verified, salts).await
    }

    async fn delete(&self, id: &[u8]) -> Result<(), Status> {
        self.vault.delete(id).await?;
        self.notifier.changed().await;
        Ok(())
    }

    async fn update_user(&self, id: &[u8], user: User) -> Result<(), Status> {
        self.vault.update_user(id, &user).await?;
        self.notifier.changed().await;
        Ok(())
    }
}
