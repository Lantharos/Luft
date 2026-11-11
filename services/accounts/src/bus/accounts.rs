use std::fs::File;
use std::io::Read;
use std::sync::Arc;

use anyhow::Context;
use luft_accounts::types::{Account, Answer, Credentials, Provider};
use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, OwnedFd, interface};
use zeroize::Zeroizing;

use super::{Error, SETTINGS, admit, json, parse};
use crate::accounts;
use crate::hub::Hub;
use crate::signin::{self, Typed};

const LONGEST_PASSWORD: u64 = 4096;

pub struct Accounts {
    hub: Arc<Hub>,
}

impl Accounts {
    pub fn new(hub: Arc<Hub>) -> Self {
        Self { hub }
    }
}

async fn typed_password(password: OwnedFd) -> Result<Option<Zeroizing<String>>, Error> {
    let typed = tokio::task::spawn_blocking(move || {
        let mut typed = Zeroizing::new(String::new());
        File::from(std::os::fd::OwnedFd::from(password))
            .take(LONGEST_PASSWORD + 1)
            .read_to_string(&mut typed)
            .map(|_| typed)
    })
    .await
    .context("Reading the password stopped unexpectedly.")?
    .map_err(|_| Error::Unreadable("That password couldn't be read.".to_owned()))?;
    if typed.len() as u64 > LONGEST_PASSWORD {
        return Err(Error::Unreadable("That password is too long.".to_owned()));
    }
    Ok(Some(typed).filter(|typed| !typed.is_empty()))
}

#[introspect]
#[interface(name = "com.lantharos.Accounts1")]
impl Accounts {
    async fn accounts(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        let accounts: Vec<Account> = self
            .hub
            .records()
            .all()
            .iter()
            .map(|record| record.account())
            .collect();
        Ok(json(&accounts))
    }

    async fn sign_in(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        provider: String,
        credentials: String,
        password: OwnedFd,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        let provider: Provider = parse(&format!("\"{provider}\""))?;
        let typed = Typed {
            credentials: parse::<Credentials>(&credentials)?,
            password: typed_password(password).await?,
        };
        Ok(signin::start(&self.hub, provider, typed, None).await?)
    }

    async fn sign_in_again(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        account: String,
        credentials: String,
        password: OwnedFd,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        let typed = Typed {
            credentials: parse::<Credentials>(&credentials)?,
            password: typed_password(password).await?,
        };
        let provider = self
            .hub
            .records()
            .get(&account)
            .map(|record| record.provider)
            .ok_or_else(Error::account_gone)?;
        Ok(signin::start(&self.hub, provider, typed, Some(account)).await?)
    }

    async fn step(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        session: String,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        let step = self
            .hub
            .signins
            .step(&session)
            .ok_or_else(|| Error::Gone("That sign-in has ended.".to_owned()))?;
        Ok(json(&step))
    }

    async fn answer(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        session: String,
        answer: String,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        let answer: Answer = parse(&answer)?;
        Ok(self.hub.signins.answer(&session, answer)?)
    }

    async fn cancel(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        session: String,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        self.hub.signins.cancel(&session);
        self.hub.demand.notify_one();
        Ok(())
    }

    async fn rename(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        account: String,
        name: String,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        Ok(accounts::rename(&self.hub, &account, &name).await?)
    }

    async fn remove(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        account: String,
        discard_unsynced: bool,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS]).await?;
        Ok(accounts::remove(&self.hub, &account, discard_unsynced).await?)
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn sign_in_step(
        emitter: &SignalEmitter<'_>,
        session: &str,
        step: &str,
    ) -> zbus::Result<()>;
}
