use std::collections::HashSet;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use luft_keyring_vault::SshKey;

struct Timed {
    key: SshKey,
    expires: Instant,
}

#[derive(Default)]
pub struct Session {
    timed: Mutex<Vec<Timed>>,
    unloaded: Mutex<HashSet<Vec<u8>>>,
}

impl Session {
    pub fn keep(&self, key: SshKey, lifetime: Duration) {
        let mut timed = self.timed.lock().expect("session SSH keys");
        timed.retain(|existing| existing.key.public != key.public);
        timed.push(Timed {
            key,
            expires: Instant::now() + lifetime,
        });
    }

    pub fn expire(&self) {
        let now = Instant::now();
        self.timed
            .lock()
            .expect("session SSH keys")
            .retain(|timed| timed.expires > now);
    }

    pub fn timed(&self) -> Vec<SshKey> {
        self.timed
            .lock()
            .expect("session SSH keys")
            .iter()
            .map(|timed| timed.key.clone())
            .collect()
    }

    pub fn forget(&self, public: &[u8]) -> bool {
        let mut timed = self.timed.lock().expect("session SSH keys");
        let before = timed.len();
        timed.retain(|timed| timed.key.public != public);
        timed.len() != before
    }

    pub fn forget_all(&self) {
        self.timed.lock().expect("session SSH keys").clear();
    }

    pub fn is_loaded(&self, public: &[u8]) -> bool {
        !self
            .unloaded
            .lock()
            .expect("unloaded SSH keys")
            .contains(public)
    }

    pub fn set_loaded(&self, public: &[u8], loaded: bool) {
        let mut unloaded = self.unloaded.lock().expect("unloaded SSH keys");
        if loaded {
            unloaded.remove(public);
        } else {
            unloaded.insert(public.to_owned());
        }
    }
}
