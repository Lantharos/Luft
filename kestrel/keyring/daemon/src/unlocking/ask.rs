use std::sync::Arc;

use luft_keyring_vault::Error;
use luft_keyring_wire::{Problem, Reply, Request, Secret};
use tokio::task::JoinHandle;

use super::authenticate::{self, Mode, Outcome};
use super::{link, prints};
use crate::daemon::Daemon;
use crate::prompter::Request as Prompt;

const FINGERPRINT_ROUNDS: usize = 3;
const TITLE: &str = "Unlock your passwords and keys";

enum PinOutcome {
    Opened,
    Cancelled,
    LockedOut,
}

pub enum Why {
    App(String),
    FingerprintOnly,
    StartupChanged,
    PinLockedOut,
}

impl Why {
    fn body(&self, exists: bool) -> String {
        if !exists {
            return "Enter the password you use to sign in. From then on, signing in unlocks them for you.".into();
        }
        match self {
            Self::App(app) => format!("{app} wants to use something you saved."),
            Self::FingerprintOnly => "Your fingerprint can't unlock them on this computer, so your password is needed once.".into(),
            Self::StartupChanged => "This computer's startup settings changed, so your password is needed once.".into(),
            Self::PinLockedOut => "There were too many wrong PINs. Enter your password instead.".into(),
        }
    }
}

impl Daemon {
    pub async fn ask_for_password(self: &Arc<Self>, why: Why) -> bool {
        let _turn = self.prompting.lock().await;
        let (locked, exists, wrapped) = {
            let keyring = self.keyring.lock().await;
            (
                keyring.is_locked(),
                keyring.exists(),
                keyring.has_chip_wrap(),
            )
        };
        if !locked {
            return true;
        }
        if self.screen_is_locked() {
            return false;
        }
        let fingerprint = wrapped && authenticate::available() && prints::enrolled().await;
        let watcher = fingerprint.then(|| self.watch_fingerprint());
        let handle = self.prompter.handle();
        let body = why.body(exists);
        let mut warning = String::new();
        let mut unlocked = self.unlocked.subscribe();
        let opened = loop {
            let prompt = Prompt {
                title: TITLE,
                body: &body,
                warning: &warning,
                action: "Unlock",
                fingerprint,
                confirm: !exists && !authenticate::available(),
                ..Prompt::default()
            };
            let entered = tokio::select! {
                entered = self.prompter.password(&handle, &prompt) => entered,
                _ = unlocked.wait_for(|unlocked| *unlocked) => break true,
            };
            let Some(password) = entered else {
                eprintln!("The unlock prompt was closed without a password");
                break false;
            };
            if !exists
                && authenticate::available()
                && authenticate::authenticate(Mode::Password, Some(&password)).await
                    == Outcome::Refused
            {
                warning = "That isn't the password you sign in with".into();
                continue;
            }
            match self.open_with_password(&password).await {
                Ok(()) => {
                    self.unlocked_now(Some(Secret::copy_of(&password))).await;
                    break true;
                }
                Err(Error::WrongPassword) => {
                    warning = "That password didn't unlock them. If you changed your password recently, enter the previous one.".into();
                }
                Err(error) => warning = format!("They couldn't be opened: {error}"),
            }
        };
        if let Some(watcher) = watcher {
            watcher.abort();
        }
        self.prompter.close(&handle).await;
        opened
    }

    fn watch_fingerprint(self: &Arc<Self>) -> JoinHandle<()> {
        tokio::spawn(async move {
            for _ in 0..FINGERPRINT_ROUNDS {
                if authenticate::authenticate(Mode::Fingerprint, None).await != Outcome::Refused {
                    return;
                }
            }
        })
    }

    pub async fn ask_for_pin(self: &Arc<Self>) -> bool {
        match self.pin_prompt().await {
            PinOutcome::Opened => true,
            PinOutcome::Cancelled => false,
            PinOutcome::LockedOut => self.ask_for_password(Why::PinLockedOut).await,
        }
    }

    async fn pin_prompt(self: &Arc<Self>) -> PinOutcome {
        let _turn = self.prompting.lock().await;
        if !self.keyring.lock().await.is_locked() {
            return PinOutcome::Opened;
        }
        let handle = self.prompter.handle();
        let mut warning = String::new();
        let outcome = loop {
            let prompt = Prompt {
                title: "Enter your keyring PIN",
                body: "Your fingerprint needs your PIN to unlock your passwords and keys.",
                label: "PIN",
                warning: &warning,
                action: "Unlock",
                numeric: true,
                ..Prompt::default()
            };
            let Some(pin) = self.prompter.password(&handle, &prompt).await else {
                break PinOutcome::Cancelled;
            };
            match link::request(Request::Unseal {
                pin: Secret::copy_of(&pin),
            })
            .await
            {
                Ok(Reply::Unsealed { key }) if self.open_with_chip_key(&key).await.is_ok() => {
                    self.unlocked_now(None).await;
                    break PinOutcome::Opened;
                }
                Err(Problem::WrongPin) => warning = "That PIN isn't right".into(),
                Err(Problem::LockedOut) => break PinOutcome::LockedOut,
                _ => warning = "Your PIN can't unlock them right now".into(),
            }
        };
        self.prompter.close(&handle).await;
        outcome
    }

    pub async fn choose_pin(self: &Arc<Self>) -> bool {
        let _turn = self.prompting.lock().await;
        let handle = self.prompter.handle();
        let prompt = Prompt {
            title: "Choose a keyring PIN",
            body: "You'll enter it after your fingerprint to unlock your passwords and keys. Too many wrong tries lock it for a while.",
            label: "PIN",
            action: "Set PIN",
            numeric: true,
            confirm: true,
            ..Prompt::default()
        };
        let chosen = match self.prompter.password(&handle, &prompt).await {
            Some(pin) if !pin.is_empty() => self.seal(Some(Secret::copy_of(&pin))).await.is_ok(),
            _ => false,
        };
        self.prompter.close(&handle).await;
        chosen
    }
}
