use std::os::fd::RawFd;
use std::sync::Arc;

use luft_keyring_vault::SshKey;

use super::keys::fingerprint;
use crate::daemon::Daemon;
use crate::identity::{App, of_process};
use crate::prompter::{Answer, Request};
use crate::unlocking::{Mode, Outcome, authenticate, can_authenticate};

pub struct Requester {
    pub app: App,
    surrounding: Option<String>,
}

impl Requester {
    pub fn of(socket: RawFd) -> Self {
        let mut credentials = libc::ucred {
            pid: 0,
            uid: 0,
            gid: 0,
        };
        let mut length = size_of::<libc::ucred>() as libc::socklen_t;
        let found = unsafe {
            libc::getsockopt(
                socket,
                libc::SOL_SOCKET,
                libc::SO_PEERCRED,
                (&raw mut credentials).cast(),
                &raw mut length,
            )
        } == 0;
        let (app, surrounding) = match u32::try_from(credentials.pid) {
            Ok(pid) if found && pid > 0 => of_process(pid),
            _ => (App::unknown(), None),
        };
        Self { app, surrounding }
    }

    fn who(&self) -> String {
        match &self.surrounding {
            Some(surrounding) if *surrounding != self.app.name => {
                format!("{} in {surrounding}", self.app.name)
            }
            _ => self.app.name.clone(),
        }
    }

    pub async fn confirm(&self, daemon: &Arc<Daemon>, key: &SshKey) -> bool {
        let grant = (format!("ssh:{}", fingerprint(&key.public)), 0);
        if daemon.granted.contains(&self.app, &grant) {
            return true;
        }
        let _turn = daemon.prompting.lock().await;
        let fingerprint_reader = can_authenticate()
            && daemon
                .fingerprints
                .load(std::sync::atomic::Ordering::Relaxed);
        let title = format!(
            "Allow {} to use your SSH key “{}”?",
            self.who(),
            key.comment
        );
        let body = if fingerprint_reader {
            "Touch the fingerprint reader to allow it."
        } else {
            "It wants to sign in somewhere with it."
        };
        let request = Request {
            title: &title,
            body,
            icon: "dialog-password-symbolic",
            remember: !fingerprint_reader,
            fingerprint: fingerprint_reader,
            ..Request::default()
        };
        let handle = daemon.prompter.handle();
        if fingerprint_reader {
            tokio::select! {
                answer = daemon.prompter.access(&handle, &request) => matches!(answer, Answer::Allowed { .. }),
                outcome = authenticate(Mode::Fingerprint, None) => {
                    daemon.prompter.close(&handle).await;
                    outcome == Outcome::Accepted
                }
            }
        } else {
            match daemon.prompter.access(&handle, &request).await {
                Answer::Allowed { remember } => {
                    if remember {
                        daemon.granted.add(&self.app, std::slice::from_ref(&grant));
                    }
                    true
                }
                _ => false,
            }
        }
    }
}
