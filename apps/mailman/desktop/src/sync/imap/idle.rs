use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use crate::accounts::{Account, Credentials, Protocol};
use crate::protocols::imap::Client;

const IDLE_FOR: Duration = Duration::from_secs(25 * 60);
const RETRY_AFTER: Duration = Duration::from_secs(30);

pub struct Push {
    pub(super) stop: Arc<AtomicBool>,
}

impl Drop for Push {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
    }
}

fn pause(stop: &AtomicBool, duration: Duration) {
    let steps = duration.as_millis() / 250;
    for _ in 0..steps {
        if stop.load(Ordering::Relaxed) {
            return;
        }
        std::thread::sleep(Duration::from_millis(250));
    }
}

fn session(
    account: &Account,
    credentials: &Credentials,
    inbox: &str,
    stop: &AtomicBool,
    changed: &dyn Fn(),
) -> Result<bool, String> {
    let Protocol::Imap { imap, .. } = &account.config.protocol else {
        return Ok(false);
    };
    let mut client = Client::connect(imap)?;
    client.login(&credentials.login(account)?)?;
    if !client.has("IDLE") {
        client.logout();
        return Ok(false);
    }
    client.select(inbox, None, false)?;
    while !stop.load(Ordering::Relaxed) {
        if client.idle(IDLE_FOR, || stop.load(Ordering::Relaxed))? {
            changed();
        }
    }
    client.logout();
    Ok(true)
}

pub fn watch(
    account: Account,
    credentials: Credentials,
    inbox: String,
    changed: impl Fn() + Send + 'static,
) -> Push {
    let stop = Arc::new(AtomicBool::new(false));
    let watching = stop.clone();
    std::thread::Builder::new()
        .name(format!("idle-{}", account.id))
        .spawn(move || {
            while !watching.load(Ordering::Relaxed) {
                match session(&account, &credentials, &inbox, &watching, &changed) {
                    Ok(false) => return,
                    Ok(true) => {}
                    Err(_) => pause(&watching, RETRY_AFTER),
                }
            }
        })
        .ok();
    Push { stop }
}
