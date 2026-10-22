use std::os::fd::{AsFd, FromRawFd, OwnedFd, RawFd};
use std::sync::Arc;

use luft_keyring_vault::SshKey;

use super::keys::fingerprint;
use crate::daemon::Daemon;
use crate::prompter::{Answer, Request};
use crate::requester::Requester;
use crate::unlocking::{Mode, Outcome, authenticate, can_authenticate};

pub async fn requester(daemon: &Daemon, socket: RawFd) -> Requester {
    let mut pidfd: libc::c_int = -1;
    let mut length = size_of::<libc::c_int>() as libc::socklen_t;
    let found = unsafe {
        libc::getsockopt(
            socket,
            libc::SOL_SOCKET,
            libc::SO_PEERPIDFD,
            (&raw mut pidfd).cast(),
            &raw mut length,
        )
    } == 0;
    if !found || pidfd < 0 {
        return Requester::unknown(None);
    }
    let pidfd = unsafe { OwnedFd::from_raw_fd(pidfd) };
    Requester::of_process(&daemon.connection, None, pidfd.as_fd()).await
}

pub async fn confirm(daemon: &Arc<Daemon>, requester: &Requester, key: &SshKey) -> bool {
    let grant = (format!("ssh:{}", fingerprint(&key.public)), 0);
    if daemon.granted.contains(requester, &grant) {
        return true;
    }
    let _turn = daemon.prompting.lock().await;
    let fingerprint_reader = can_authenticate()
        && daemon
            .fingerprints
            .load(std::sync::atomic::Ordering::Relaxed);
    let title = format!(
        "Allow {} to use your SSH key “{}”?",
        requester.named(),
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
        app: requester.icon(),
        icon: "dialog-password-symbolic",
        remember: !fingerprint_reader && requester.sandboxed_app().is_some(),
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
                if remember && requester.sandboxed_app().is_some() {
                    daemon.granted.add(requester, std::slice::from_ref(&grant));
                }
                true
            }
            _ => false,
        }
    }
}
