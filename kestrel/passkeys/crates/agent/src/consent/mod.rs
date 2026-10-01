mod authenticate;
mod fingerprint;
mod kestrel;

use std::future::pending;
use std::sync::Arc;
use std::time::Duration;

use ctap::{Prompt, Status};
use zbus::Connection;

use fingerprint::{Reader, Scan};
use kestrel::{Action, Feedback, Window};

const PROMPT_LIMIT: Duration = Duration::from_secs(180);

#[derive(Clone)]
pub struct Consent {
    session: Connection,
    user: Arc<str>,
}

async fn scan(reader: &mut Option<Reader>) -> Scan {
    match reader {
        Some(reader) => reader.scan().await,
        None => pending().await,
    }
}

impl Consent {
    pub fn new(session: Connection, user: String) -> Self {
        Self {
            session,
            user: Arc::from(user),
        }
    }

    pub async fn ask(
        &self,
        prompt: Prompt<'_>,
        requester: Option<u32>,
    ) -> Result<ctap::Consent, Status> {
        tokio::time::timeout(PROMPT_LIMIT, self.converse(prompt, requester))
            .await
            .unwrap_or(Err(Status::UserActionTimeout))
    }

    async fn converse(
        &self,
        prompt: Prompt<'_>,
        requester: Option<u32>,
    ) -> Result<ctap::Consent, Status> {
        let verifying = prompt.needs_verification();
        let (mut reader, hint) = if verifying {
            Reader::start(&self.user).await.unzip()
        } else {
            (None, None)
        };
        let mut window = Window::open(&self.session, &prompt, requester, hint.as_deref())
            .await
            .map_err(|error| {
                eprintln!("Couldn't ask about a passkey: {error}");
                Status::OperationDenied
            })?;
        if !verifying {
            return match window.next().await {
                Action::Confirm => Ok(ctap::Consent::Confirmed),
                _ => Err(Status::OperationDenied),
            };
        }
        let last_account = prompt.accounts.len().saturating_sub(1);
        let mut account = 0;
        loop {
            let action = tokio::select! {
                action = window.next() => action,
                scanned = scan(&mut reader) => {
                    match scanned {
                        Scan::Matched => return Ok(verified(&window, account).await),
                        Scan::Hint(hint) => window.show(Feedback::FingerprintHint(&hint)).await,
                        Scan::Lost => {
                            reader = None;
                            window.show(Feedback::FingerprintUnavailable).await;
                        }
                    }
                    continue;
                }
            };
            match action {
                Action::Account(index) => account = index.min(last_account),
                Action::Password(password) => {
                    if authenticate::password(&self.user, &password).await {
                        return Ok(verified(&window, account).await);
                    }
                    window.show(Feedback::WrongPassword).await;
                }
                Action::Confirm => {}
                Action::Cancel => return Err(Status::OperationDenied),
            }
        }
    }
}

async fn verified(window: &Window, account: usize) -> ctap::Consent {
    window.show(Feedback::Verified).await;
    ctap::Consent::Verified { account }
}
