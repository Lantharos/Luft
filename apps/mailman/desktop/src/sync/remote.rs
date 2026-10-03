use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use crate::accounts::{Account, Credentials, Login, Protocol};
use crate::store::{Inserted, Mailbox, Outgoing, Store, now};

use super::ops::Operation;

const RENEW_BEFORE: i64 = 60;

pub struct Context<'a> {
    pub store: &'a Store,
    pub account: &'a Account,
    pub changed: &'a dyn Fn(),
}

pub trait Remote: Send {
    fn folders(&mut self, context: &Context) -> Result<Vec<Mailbox>, String>;
    fn sync(&mut self, context: &Context, mailbox: &Mailbox) -> Result<Vec<Inserted>, String>;
    fn backfill(&mut self, context: &Context, mailbox: &Mailbox) -> Result<(), String>;
    fn identities(&mut self, context: &Context) -> Result<bool, String>;
    fn bodies(
        &mut self,
        mailbox: &Mailbox,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String>;
    fn apply(&mut self, context: &Context, operation: &Operation) -> Result<(), String>;
    fn send(&mut self, context: &Context, outgoing: &Outgoing) -> Result<(), String>;
}

pub struct Connection {
    pub remote: Box<dyn Remote>,
    expires: Option<i64>,
}

impl Connection {
    pub fn current(&self) -> bool {
        renewal(self.expires).is_none_or(|renew_at| renew_at > now())
    }
}

pub fn renewal(expires: Option<i64>) -> Option<i64> {
    expires.map(|expires| expires - RENEW_BEFORE)
}

fn open(account: &Account, login: Login) -> Result<Box<dyn Remote>, String> {
    Ok(match &account.config.protocol {
        Protocol::Imap { .. } => Box::new(super::imap::connect(account, login)?),
        Protocol::Jmap { session } => Box::new(super::jmap::JmapRemote::connect(session, &login)?),
    })
}

pub fn signed_in<T>(
    account: &Account,
    credentials: &Credentials,
    mut attempt: impl FnMut(Login) -> Result<T, String>,
) -> Result<(T, Option<i64>), String> {
    let login = credentials.login(account)?;
    let expires = login.expires();
    let token = match &login {
        Login::Bearer { token, .. } => Some(token.clone()),
        Login::Password { .. } => None,
    };
    match (attempt(login), token) {
        (Ok(value), _) => Ok((value, expires)),
        (Err(_), Some(rejected)) => {
            let login = credentials.renew(account, &rejected)?;
            let expires = login.expires();
            attempt(login).map(|value| (value, expires))
        }
        (Err(error), None) => Err(error),
    }
}

pub fn connect(account: &Account, credentials: &Credentials) -> Result<Connection, String> {
    let (remote, expires) = signed_in(account, credentials, |login| open(account, login))?;
    Ok(Connection { remote, expires })
}

pub struct Push {
    stop: Arc<AtomicBool>,
}

impl Push {
    pub fn spawn(name: String, watch: impl FnOnce(&AtomicBool) + Send + 'static) -> Self {
        let stop = Arc::new(AtomicBool::new(false));
        let watching = stop.clone();
        std::thread::Builder::new()
            .name(name)
            .spawn(move || watch(&watching))
            .ok();
        Self { stop }
    }
}

impl Drop for Push {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
    }
}

pub fn pause(stop: &AtomicBool, duration: Duration) {
    let steps = duration.as_millis() / 250;
    for _ in 0..steps {
        if stop.load(Ordering::Relaxed) {
            return;
        }
        std::thread::sleep(Duration::from_millis(250));
    }
}
