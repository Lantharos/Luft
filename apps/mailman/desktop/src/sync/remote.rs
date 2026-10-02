use crate::accounts::{Account, Credentials, Protocol};
use crate::store::{Inserted, Mailbox, Outgoing, Store};

use super::ops::Operation;

pub struct Context<'a> {
    pub store: &'a Store,
    pub account: &'a Account,
    pub changed: &'a dyn Fn(),
}

pub trait Remote: Send {
    fn folders(&mut self, context: &Context) -> Result<Vec<Mailbox>, String>;
    fn sync(&mut self, context: &Context, mailbox: &Mailbox) -> Result<Vec<Inserted>, String>;
    fn bodies(
        &mut self,
        mailbox: &Mailbox,
        wanted: &[(i64, String)],
    ) -> Result<Vec<(i64, Vec<u8>)>, String>;
    fn apply(&mut self, context: &Context, operation: &Operation) -> Result<(), String>;
    fn send(&mut self, context: &Context, outgoing: &Outgoing) -> Result<(), String>;
}

pub fn connect(account: &Account, credentials: &Credentials) -> Result<Box<dyn Remote>, String> {
    let login = credentials.login(account)?;
    Ok(match &account.config.protocol {
        Protocol::Imap { .. } => Box::new(super::imap_remote::connect(account, login)?),
        Protocol::Jmap { session } => {
            Box::new(super::jmap_remote::JmapRemote::connect(session, login)?)
        }
    })
}
