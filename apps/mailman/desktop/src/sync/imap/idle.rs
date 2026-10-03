use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use crate::accounts::{Account, Credentials, Protocol};
use crate::protocols::imap::Client;
use crate::store::now;
use crate::sync::remote::{Push, pause, renewal, signed_in};

const IDLE_FOR: i64 = 25 * 60;
const RETRY_AFTER: Duration = Duration::from_secs(30);

enum Ended {
    Unsupported,
    Renewing,
    Stopped,
}

fn session(
    account: &Account,
    credentials: &Credentials,
    inbox: &str,
    stop: &AtomicBool,
    changed: &dyn Fn(),
) -> Result<Ended, String> {
    let Protocol::Imap { imap, .. } = &account.config.protocol else {
        return Ok(Ended::Unsupported);
    };
    let (mut client, expires) = signed_in(account, credentials, |login| {
        let mut client = Client::connect(imap)?;
        client.login(&login)?;
        Ok(client)
    })?;
    let renew_at = renewal(expires);
    if !client.has("IDLE") {
        client.logout();
        return Ok(Ended::Unsupported);
    }
    client.select(inbox, None, false)?;
    while !stop.load(Ordering::Relaxed) {
        let until = renew_at.map_or(now() + IDLE_FOR, |renew_at| renew_at.min(now() + IDLE_FOR));
        if until <= now() {
            client.logout();
            return Ok(Ended::Renewing);
        }
        let wait = Duration::from_secs((until - now()) as u64);
        if client.idle(wait, || stop.load(Ordering::Relaxed))? {
            changed();
        }
    }
    client.logout();
    Ok(Ended::Stopped)
}

pub fn watch(
    account: Account,
    credentials: Credentials,
    inbox: String,
    changed: impl Fn() + Send + 'static,
) -> Push {
    Push::spawn(format!("idle-{}", account.id), move |stop| {
        while !stop.load(Ordering::Relaxed) {
            match session(&account, &credentials, &inbox, stop, &changed) {
                Ok(Ended::Unsupported | Ended::Stopped) => return,
                Ok(Ended::Renewing) => changed(),
                Err(_) => pause(stop, RETRY_AFTER),
            }
        }
    })
}
