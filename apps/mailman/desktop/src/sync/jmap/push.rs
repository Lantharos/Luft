use std::time::Duration;

use crate::accounts::{Account, Credentials};
use crate::protocols::jmap::{self, Client};
use crate::protocols::sse::EventStream;
use crate::store::now;
use crate::sync::remote::{Backoff, Push, Watch, renewal, signed_in};

const SILENCE: Duration = Duration::from_secs(jmap::PING * 2 + 15);
const POLL_WITHOUT_PUSH: Duration = Duration::from_secs(2 * 60);

struct Source {
    url: String,
    authorization: String,
    renew_at: Option<i64>,
}

fn listen(
    source: &Source,
    watch: &Watch,
    backoff: &mut Backoff,
    changed: &dyn Fn(),
) -> Result<(), String> {
    let mut events = EventStream::open(&source.url, &source.authorization, SILENCE)?;
    if !watch.attach(events.handle()?) {
        return Ok(());
    }
    backoff.reset();
    changed();
    loop {
        let event = events.next()?;
        if source.renew_at.is_some_and(|renew_at| renew_at <= now()) {
            return Ok(());
        }
        if event == "state" {
            changed();
        }
    }
}

fn open(
    session: &str,
    account: &Account,
    credentials: &Credentials,
) -> Result<Option<Source>, String> {
    let (url, expires) = signed_in(account, credentials, |login| {
        Ok(Client::connect(session, &login)?
            .event_source()
            .map(|url| (url, jmap::authorization(&login))))
    })?;
    Ok(url.map(|(url, authorization)| Source {
        url,
        authorization,
        renew_at: renewal(expires),
    }))
}

fn poll(watch: &Watch, changed: &dyn Fn()) {
    while watch.rest(POLL_WITHOUT_PUSH) {
        changed();
    }
}

pub fn watch(
    session: String,
    account: Account,
    credentials: Credentials,
    changed: impl Fn() + Send + 'static,
) -> Push {
    Push::spawn(format!("push-{}", account.id), move |watch| {
        let mut backoff = Backoff::default();
        loop {
            let ended = match open(&session, &account, &credentials) {
                Ok(None) => return poll(watch, &changed),
                Ok(Some(source)) => listen(&source, watch, &mut backoff, &changed),
                Err(error) => Err(error),
            };
            watch.detach();
            let wait = match ended {
                Ok(()) => Duration::ZERO,
                Err(_) => backoff.next(),
            };
            if !watch.rest(wait) {
                return;
            }
        }
    })
}
