use std::io::BufRead;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use crate::accounts::{Account, Credentials};
use crate::protocols::jmap::{self, Client};
use crate::store::now;
use crate::sync::remote::{Push, pause, renewal, signed_in};

const RECONNECT_AFTER: Duration = Duration::from_secs(30);

struct Source {
    url: String,
    authorization: String,
    renew_at: Option<i64>,
}

fn listen(source: &Source, stop: &AtomicBool, changed: &dyn Fn()) -> Result<(), String> {
    let response = ureq::get(&source.url)
        .header("Authorization", &source.authorization)
        .header("Accept", "text/event-stream")
        .call()
        .map_err(|error| error.to_string())?;
    let reader = std::io::BufReader::new(response.into_body().into_reader());
    let mut event = String::new();
    for line in reader.lines() {
        let renewing = source.renew_at.is_some_and(|renew_at| renew_at <= now());
        if stop.load(Ordering::Relaxed) || renewing {
            return Ok(());
        }
        let line = line.map_err(|error| error.to_string())?;
        if let Some(name) = line.strip_prefix("event:") {
            event = name.trim().to_owned();
        } else if line.starts_with("data:") && event == "state" {
            changed();
        }
    }
    Err("The server closed the event stream".into())
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

pub fn watch(
    session: String,
    account: Account,
    credentials: Credentials,
    changed: impl Fn() + Send + 'static,
) -> Push {
    Push::spawn(format!("push-{}", account.id), move |stop| {
        let mut resumed = false;
        while !stop.load(Ordering::Relaxed) {
            match open(&session, &account, &credentials) {
                Ok(None) => return,
                Ok(Some(source)) => {
                    if resumed {
                        changed();
                    }
                    resumed = true;
                    if listen(&source, stop, &changed).is_err() {
                        pause(stop, RECONNECT_AFTER);
                    }
                }
                Err(_) => pause(stop, RECONNECT_AFTER),
            }
        }
    })
}
