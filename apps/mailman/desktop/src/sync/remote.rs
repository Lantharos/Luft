use std::net::{Shutdown, TcpStream};
use std::sync::Arc;
use std::time::Duration;

use parking_lot::{Condvar, Mutex};

use crate::accounts::{Account, Credentials, Login, Protocol};
use crate::store::{Inserted, Mailbox, Outgoing, Store, now};

use super::ops::Operation;

const RENEW_BEFORE: i64 = 60;
const FIRST_RETRY: Duration = Duration::from_secs(1);
const LAST_RETRY: Duration = Duration::from_secs(60);

pub struct Context<'a> {
    pub store: &'a Store,
    pub account: &'a Account,
    pub changed: &'a dyn Fn(),
    pub arrived: &'a dyn Fn(&Mailbox, &[Inserted]),
}

pub trait Remote: Send {
    fn folders(&mut self, context: &Context) -> Result<Vec<Mailbox>, String>;
    fn sync(&mut self, context: &Context, mailbox: &Mailbox) -> Result<(), String>;
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

pub struct Watch {
    state: Mutex<Watched>,
    ring: Condvar,
}

#[derive(Default)]
struct Watched {
    stopped: bool,
    kicked: bool,
    line: Option<TcpStream>,
}

impl Watch {
    pub fn attach(&self, line: TcpStream) -> bool {
        let mut state = self.state.lock();
        if state.stopped {
            return false;
        }
        state.kicked = false;
        state.line = Some(line);
        true
    }

    pub fn detach(&self) {
        self.state.lock().line = None;
    }

    pub fn stopped(&self) -> bool {
        self.state.lock().stopped
    }

    pub fn rest(&self, duration: Duration) -> bool {
        let mut state = self.state.lock();
        self.ring.wait_while_for(
            &mut state,
            |state| !state.kicked && !state.stopped,
            duration,
        );
        state.kicked = false;
        !state.stopped
    }

    fn interrupt(&self, stop: bool) {
        let mut state = self.state.lock();
        state.stopped |= stop;
        state.kicked = true;
        if let Some(line) = state.line.take() {
            let _ = line.shutdown(Shutdown::Both);
        }
        self.ring.notify_all();
    }
}

pub struct Push {
    watch: Arc<Watch>,
}

impl Push {
    pub fn spawn(name: String, run: impl FnOnce(&Watch) + Send + 'static) -> Self {
        let watch = Arc::new(Watch {
            state: Mutex::default(),
            ring: Condvar::new(),
        });
        let watching = watch.clone();
        std::thread::Builder::new()
            .name(name)
            .spawn(move || run(&watching))
            .ok();
        Self { watch }
    }

    pub fn kick(&self) {
        self.watch.interrupt(false);
    }
}

impl Drop for Push {
    fn drop(&mut self) {
        self.watch.interrupt(true);
    }
}

pub struct Backoff(Duration);

impl Default for Backoff {
    fn default() -> Self {
        Self(FIRST_RETRY)
    }
}

impl Backoff {
    pub fn next(&mut self) -> Duration {
        let wait = self.0;
        self.0 = (wait * 2).min(LAST_RETRY);
        wait
    }

    pub fn reset(&mut self) {
        self.0 = FIRST_RETRY;
    }
}
