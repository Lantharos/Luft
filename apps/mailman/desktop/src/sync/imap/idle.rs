use std::time::Duration;

use crate::accounts::{Account, Credentials, Protocol};
use crate::protocols::imap::Client;
use crate::store::now;
use crate::sync::remote::{Backoff, Push, Watch, renewal, signed_in};

const IDLE_FOR: i64 = 10 * 60;
const POLL_WITHOUT_IDLE: Duration = Duration::from_secs(2 * 60);

enum Ended {
    Unsupported,
    Renewing,
    Stopped,
}

fn session(
    account: &Account,
    credentials: &Credentials,
    watch: &Watch,
    backoff: &mut Backoff,
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
    if !client.has("IDLE") {
        client.logout();
        return Ok(Ended::Unsupported);
    }
    if !watch.attach(client.handle()?) {
        return Ok(Ended::Stopped);
    }
    client.select("INBOX", None, false)?;
    backoff.reset();
    changed();
    let renew_at = renewal(expires);
    while !watch.stopped() {
        let until = renew_at.map_or(now() + IDLE_FOR, |renew_at| renew_at.min(now() + IDLE_FOR));
        if until <= now() {
            client.logout();
            return Ok(Ended::Renewing);
        }
        if client.idle(Duration::from_secs((until - now()) as u64))? {
            changed();
        }
    }
    Ok(Ended::Stopped)
}

fn poll(watch: &Watch, changed: &dyn Fn()) {
    while watch.rest(POLL_WITHOUT_IDLE) {
        changed();
    }
}

pub fn watch(
    account: Account,
    credentials: Credentials,
    changed: impl Fn() + Send + 'static,
) -> Push {
    Push::spawn(format!("idle-{}", account.id), move |watch| {
        let mut backoff = Backoff::default();
        loop {
            let ended = session(&account, &credentials, watch, &mut backoff, &changed);
            watch.detach();
            let wait = match ended {
                Ok(Ended::Stopped) => return,
                Ok(Ended::Unsupported) => return poll(watch, &changed),
                Ok(Ended::Renewing) => Duration::ZERO,
                Err(_) => backoff.next(),
            };
            if !watch.rest(wait) {
                return;
            }
        }
    })
}
