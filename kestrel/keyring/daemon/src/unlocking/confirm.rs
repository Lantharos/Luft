use std::sync::Arc;
use std::sync::atomic::Ordering;

use tokio::sync::Notify;
use tokio::task::JoinHandle;

use super::authenticate::{self, Mode, Outcome};
use crate::daemon::Daemon;
use crate::prompter::Request as Prompt;

const FINGERPRINT_ROUNDS: usize = 3;

impl Daemon {
    /// Asks you to prove it's you, by password or fingerprint, before an app
    /// on this computer gets something no app gets on its own word.
    pub async fn confirm_its_you(self: &Arc<Self>, title: &str, body: &str) -> bool {
        if !authenticate::available() {
            eprintln!("There's no sign-in service to confirm it's you");
            return false;
        }
        let _turn = self.prompting.lock().await;
        if self.screen_is_locked() {
            return false;
        }
        let fingerprint = self.fingerprints.load(Ordering::Relaxed);
        let touched = Arc::new(Notify::new());
        let watcher = fingerprint.then(|| watch_fingerprint(touched.clone()));
        let handle = self.prompter.handle();
        let mut warning = String::new();
        let confirmed = loop {
            let prompt = Prompt {
                title,
                body,
                warning: &warning,
                action: "Confirm",
                fingerprint,
                ..Prompt::default()
            };
            let entered = tokio::select! {
                entered = self.prompter.password(&handle, &prompt) => entered,
                () = touched.notified() => break true,
            };
            let Some(password) = entered else {
                break false;
            };
            match authenticate::authenticate(Mode::Password, Some(&password)).await {
                Outcome::Accepted => break true,
                Outcome::Refused => warning = "That isn't your password".into(),
                Outcome::Unavailable => break false,
            }
        };
        if let Some(watcher) = watcher {
            watcher.abort();
        }
        self.prompter.close(&handle).await;
        confirmed
    }
}

fn watch_fingerprint(touched: Arc<Notify>) -> JoinHandle<()> {
    tokio::spawn(async move {
        for _ in 0..FINGERPRINT_ROUNDS {
            match authenticate::authenticate(Mode::Fingerprint, None).await {
                Outcome::Accepted => return touched.notify_one(),
                Outcome::Refused => {}
                Outcome::Unavailable => return,
            }
        }
    })
}
