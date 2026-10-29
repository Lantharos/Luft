use std::sync::Arc;

use luft_accounts::types::{Account, Answer, Credentials, Provider};
use luft_dbus_macros::introspect;
use zbus::interface;
use zbus::object_server::SignalEmitter;

use super::{Error, json, parse};
use crate::accounts;
use crate::hub::Hub;
use crate::signin;

pub struct Accounts {
    hub: Arc<Hub>,
}

impl Accounts {
    pub fn new(hub: Arc<Hub>) -> Self {
        Self { hub }
    }
}

#[introspect]
#[interface(name = "com.lantharos.Accounts1")]
impl Accounts {
    fn accounts(&self) -> String {
        let accounts: Vec<Account> = self
            .hub
            .records()
            .all()
            .iter()
            .map(|record| record.account())
            .collect();
        json(&accounts)
    }

    async fn sign_in(&self, provider: String, credentials: String) -> Result<String, Error> {
        let provider: Provider = parse(&format!("\"{provider}\""))?;
        let credentials: Credentials = parse(&credentials)?;
        Ok(signin::start(&self.hub, provider, credentials, None).await?)
    }

    async fn sign_in_again(&self, account: String, credentials: String) -> Result<String, Error> {
        let credentials: Credentials = parse(&credentials)?;
        let provider = self
            .hub
            .records()
            .get(&account)
            .map(|record| record.provider)
            .ok_or_else(|| Error::Failed("That account isn't here anymore".to_owned()))?;
        Ok(signin::start(&self.hub, provider, credentials, Some(account)).await?)
    }

    fn step(&self, session: String) -> Result<String, Error> {
        let step = self
            .hub
            .signins
            .step(&session)
            .ok_or_else(|| Error::Failed("That sign-in has ended".to_owned()))?;
        Ok(json(&step))
    }

    fn answer(&self, session: String, answer: String) -> Result<(), Error> {
        let answer: Answer = parse(&answer)?;
        Ok(self.hub.signins.answer(&session, answer)?)
    }

    fn cancel(&self, session: String) {
        self.hub.signins.cancel(&session);
        self.hub.demand.notify_one();
    }

    async fn rename(&self, account: String, name: String) -> Result<(), Error> {
        Ok(accounts::rename(&self.hub, &account, &name).await?)
    }

    async fn remove(&self, account: String) -> Result<(), Error> {
        Ok(accounts::remove(&self.hub, &account).await?)
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
