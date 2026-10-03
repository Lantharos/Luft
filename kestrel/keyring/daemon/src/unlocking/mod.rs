mod ask;
mod authenticate;
pub mod link;
mod prints;

use std::sync::Arc;
use std::sync::atomic::Ordering;
use std::time::Duration;

use luft_keyring_vault::{ChipWrap, Contents, Error, MasterKey, PasswordWrap};
use luft_keyring_wire::{Chip, Event, GrantReason, Problem, Reply, Request, Secret, Unlock};
use tokio::sync::mpsc;
use zeroize::Zeroizing;

pub use ask::Why;
pub use authenticate::{Mode, Outcome, authenticate, available as can_authenticate};

use crate::daemon::Daemon;
use crate::identity::App;

const SIGN_IN_GRACE: Duration = Duration::from_secs(6);
const REATTACH_DELAY: Duration = Duration::from_secs(3);
const PROMPT_COOLDOWN: Duration = Duration::from_secs(30);

impl Daemon {
    pub async fn start_unlocking(self: &Arc<Self>) {
        if !link::available() {
            return;
        }
        self.signing_in.send_replace(true);
        let daemon = self.clone();
        tokio::spawn(async move {
            tokio::time::sleep(SIGN_IN_GRACE).await;
            daemon.signing_in.send_replace(false);
        });
        let daemon = self.clone();
        tokio::spawn(async move {
            let mut warned = false;
            loop {
                let (sender, mut events) = mpsc::unbounded_channel();
                match link::attach(sender).await {
                    Ok(()) => {
                        warned = false;
                        while let Some(Event::Unlock(unlock)) = events.recv().await {
                            daemon.clone().receive(unlock).await;
                        }
                    }
                    Err(error) if !warned => {
                        eprintln!("Signing in can't unlock the keyring: {error}");
                        warned = true;
                    }
                    Err(_) => {}
                }
                tokio::time::sleep(REATTACH_DELAY).await;
            }
        });
        self.refresh_chip().await;
    }

    async fn receive(self: Arc<Self>, unlock: Unlock) {
        let Unlock {
            reason,
            key,
            password,
            problem,
        } = unlock;
        if matches!(problem, Some(Problem::PolicyChanged | Problem::NotSealed)) {
            self.reseal.store(true, Ordering::Relaxed);
        }
        if reason == GrantReason::PasswordChanged {
            if let Some(password) = password {
                self.rewrap(&password).await;
            }
            return;
        }
        if !self.keyring.lock().await.is_locked() {
            if reason == GrantReason::SignIn
                && let Some(password) = password
            {
                self.rewrap(&password).await;
            }
            self.signing_in.send_replace(false);
            return;
        }
        if let Some(key) = &key
            && self.open_with_chip_key(key).await.is_ok()
        {
            self.unlocked_now(password).await;
            return;
        }
        if let Some(password) = &password
            && self.open_with_password(password.expose()).await.is_ok()
        {
            self.unlocked_now(None).await;
            return;
        }
        self.signing_in.send_replace(false);
        eprintln!("Signing in left the keyring locked: {problem:?}");
        let daemon = self.clone();
        tokio::spawn(async move {
            match problem {
                Some(Problem::NeedsPin) => daemon.ask_for_pin().await,
                Some(Problem::PolicyChanged) => daemon.ask_for_password(Why::StartupChanged).await,
                _ => daemon.ask_for_password(Why::FingerprintOnly).await,
            };
        });
    }

    pub async fn ensure_unlocked(self: &Arc<Self>, app: &App, insist: bool) -> bool {
        if !self.keyring.lock().await.is_locked() {
            return true;
        }
        let mut signing_in = self.signing_in.subscribe();
        let _ = signing_in.wait_for(|waiting| !waiting).await;
        if !self.keyring.lock().await.is_locked() {
            return true;
        }
        let recently_dismissed = self
            .dismissed
            .lock()
            .expect("dismissal time")
            .is_some_and(|at| at.elapsed() < PROMPT_COOLDOWN);
        if recently_dismissed && !insist {
            return false;
        }
        let opened = self.ask_for_password(Why::App(app.name.clone())).await;
        if !opened && !self.screen_is_locked() {
            *self.dismissed.lock().expect("dismissal time") = Some(std::time::Instant::now());
        }
        opened
    }

    async fn open_with_chip_key(&self, chip_key: &Secret) -> Result<(), Error> {
        let mut keyring = self.keyring.lock().await;
        let wrap = keyring.chip_wrap().ok_or(Error::WrongKey)?;
        let key = wrap.open(chip_key.expose())?;
        keyring.install(key)
    }

    pub async fn open_with_password(&self, password: &[u8]) -> Result<(), Error> {
        let mut keyring = self.keyring.lock().await;
        if !keyring.is_locked() {
            return Ok(());
        }
        let password = Zeroizing::new(password.to_vec());
        let Some(wrap) = keyring.password_wrap() else {
            let key = MasterKey::generate()?;
            let (key, wrap) = stretch(key, password).await?;
            return keyring.create(key, wrap, Contents::fresh());
        };
        let key = tokio::task::spawn_blocking(move || wrap.open(&password))
            .await
            .map_err(|_| Error::WrongPassword)??;
        keyring.install(key)
    }

    async fn rewrap(&self, password: &Secret) {
        let (wrap, key) = {
            let keyring = self.keyring.lock().await;
            let Some(key) = keyring.key().and_then(|key| key.duplicate().ok()) else {
                return;
            };
            (keyring.password_wrap(), key)
        };
        let password = Zeroizing::new(password.expose().to_vec());
        let current = tokio::task::spawn_blocking({
            let password = password.clone();
            move || wrap.is_some_and(|wrap| wrap.is_current() && wrap.open(&password).is_ok())
        })
        .await
        .unwrap_or(false);
        if current {
            return;
        }
        if let Ok((_, wrap)) = stretch(key, password).await
            && let Err(error) = self.keyring.lock().await.set_password_wrap(wrap)
        {
            eprintln!("Couldn't update the keyring's password: {error}");
        }
    }

    pub async fn unlocked_now(self: &Arc<Self>, password: Option<Secret>) {
        self.keyring.lock().await.release_misclaimed();
        self.signing_in.send_replace(false);
        self.unlocked.send_replace(true);
        self.changed.notify_one();
        let daemon = self.clone();
        tokio::spawn(async move {
            daemon.seal_if_needed().await;
            if let Some(password) = password {
                daemon.rewrap(&password).await;
            }
        });
    }

    pub async fn lock(&self) {
        self.keyring.lock().await.lock();
        self.granted.clear();
        self.unlocked.send_replace(false);
        self.changed.notify_one();
    }

    pub async fn refresh_chip(&self) {
        let status = match link::request(Request::Status).await {
            Ok(Reply::Status(status)) => Some(status),
            _ => None,
        };
        *self.chip.lock().await = status;
        self.fingerprints
            .store(prints::enrolled().await, Ordering::Relaxed);
        self.changed.notify_one();
    }

    async fn seal_if_needed(self: &Arc<Self>) {
        if !link::available() {
            return;
        }
        self.refresh_chip().await;
        let Some(status) = self.chip.lock().await.clone() else {
            return;
        };
        if status.chip != Chip::Ready {
            return;
        }
        let wrapped = self.keyring.lock().await.has_chip_wrap();
        let stale = self.reseal.load(Ordering::Relaxed);
        match status.seal {
            Some(_) if wrapped && !stale => {}
            Some(seal) if seal.pin => {
                if !self.choose_pin().await {
                    let _ = link::request(Request::Forget).await;
                    let _ = self.keyring.lock().await.set_chip_wrap(None);
                    self.refresh_chip().await;
                }
            }
            _ => {
                if let Err(problem) = self.seal(None).await {
                    eprintln!("Couldn't protect the keyring with the security chip: {problem:?}");
                }
            }
        }
    }

    pub async fn seal(&self, pin: Option<Secret>) -> Result<(), Problem> {
        let Reply::Sealed { key: chip_key } = link::request(Request::Seal { pin }).await? else {
            return Err(Problem::Failed("unexpected reply".into()));
        };
        let mut keyring = self.keyring.lock().await;
        let key = keyring
            .key()
            .ok_or(Problem::Failed("the keyring is locked".into()))?;
        let wrap = ChipWrap::create(key, chip_key.expose())
            .map_err(|error| Problem::Failed(error.to_string()))?;
        keyring
            .set_chip_wrap(Some(wrap))
            .map_err(|error| Problem::Failed(error.to_string()))?;
        drop(keyring);
        self.reseal.store(false, Ordering::Relaxed);
        self.refresh_chip().await;
        Ok(())
    }
}

async fn stretch(
    key: MasterKey,
    password: Zeroizing<Vec<u8>>,
) -> Result<(MasterKey, PasswordWrap), Error> {
    tokio::task::spawn_blocking(move || {
        let wrap = PasswordWrap::create(&key, &password)?;
        Ok((key, wrap))
    })
    .await
    .map_err(|_| Error::Corrupt("the password couldn't be prepared"))?
}
