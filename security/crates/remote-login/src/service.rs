use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use luft_remote_login::choices::Choices;
use tokio::sync::Mutex;
use zbus::fdo::{self, DBusProxy};
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use crate::accounts::Account;
use crate::error::Error;
use crate::keys::{self, PublicKey};
use crate::{firewall, sessions, sshd};

pub const NAME: &str = "com.lantharos.RemoteLogin1";
pub const PATH: &str = "/com/lantharos/RemoteLogin1";
const CONFIGURE: &str = "com.lantharos.remote-login.configure";
const RESTRICT: &str = "com.lantharos.remote-login.restrict";
const PASSWORDS: &str = "com.lantharos.remote-login.password-login";
const PUBLIC: &str = "com.lantharos.remote-login.public-networks";
const PRIVATE_KEY: &str = "PRIVATE KEY";

type Key = (String, String, String);

pub struct RemoteLogin {
    idle: Arc<Idle>,
    changing: Mutex<()>,
}

async fn authorize(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
) -> Result<(), Error> {
    if luft_dbus::polkit::is_authorized(connection, header, action).await? {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}

async fn caller(connection: &Connection, header: &Header<'_>) -> Result<Option<Account>, Error> {
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    let uid = DBusProxy::new(connection)
        .await?
        .get_connection_unix_user(sender.clone().into())
        .await
        .map_err(zbus::Error::from)?;
    Ok(Account::by_uid(uid))
}

async fn person(connection: &Connection, header: &Header<'_>) -> Result<Account, Error> {
    caller(connection, header).await?.ok_or_else(|| {
        Error::InvalidArgs("Only a person's own account has SSH keys to change".into())
    })
}

fn described(key: &PublicKey) -> Key {
    (key.kind.clone(), key.comment.clone(), key.fingerprint())
}

fn unreadable(error: std::io::Error) -> fdo::Error {
    fdo::Error::Failed(error.to_string())
}

impl RemoteLogin {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            changing: Mutex::new(()),
        }
    }

    async fn change_choices(&self, change: impl FnOnce(&mut Choices)) -> Result<(), Error> {
        let mut choices = Choices::load()?;
        change(&mut choices);
        choices.save()?;
        if !choices.enabled {
            return Ok(());
        }
        choices.write_sshd_config()?;
        sshd::reload().await.map_err(Error::Failed)
    }

    async fn turn_on(&self, connection: &Connection, header: &Header<'_>) -> Result<(), Error> {
        authorize(connection, header, CONFIGURE).await?;
        let mut choices = Choices::load()?;
        if choices.enabled {
            return Ok(());
        }
        if choices.accounts.is_empty()
            && let Some(account) = caller(connection, header).await?
        {
            choices.accounts.insert(account.name);
        }
        firewall::open(connection, false).await?;
        choices.enabled = true;
        choices.save()?;
        if let Err(error) = sshd::start().await {
            choices.enabled = false;
            choices.save()?;
            sshd::stop().await.map_err(Error::Failed)?;
            firewall::close(connection).await?;
            return Err(Error::Failed(error));
        }
        Ok(())
    }

    async fn turn_off(&self, connection: &Connection, header: &Header<'_>) -> Result<(), Error> {
        authorize(connection, header, RESTRICT).await?;
        let mut choices = Choices::load()?;
        choices.enabled = false;
        choices.save()?;
        sshd::stop().await.map_err(Error::Failed)?;
        sessions::end_all(connection).await?;
        firewall::close(connection).await?;
        Ok(())
    }
}

#[introspect]
#[interface(name = "com.lantharos.RemoteLogin1")]
impl RemoteLogin {
    #[zbus(property)]
    async fn enabled(&self) -> fdo::Result<bool> {
        Ok(Choices::load().map_err(unreadable)?.enabled)
    }

    #[zbus(property)]
    async fn password_login(&self) -> fdo::Result<bool> {
        Ok(Choices::load().map_err(unreadable)?.password_login)
    }

    #[zbus(property)]
    async fn public_networks(
        &self,
        #[zbus(connection)] connection: &Connection,
    ) -> fdo::Result<bool> {
        Ok(firewall::on_public_networks(connection).await?)
    }

    #[zbus(property)]
    async fn accounts(&self) -> fdo::Result<Vec<String>> {
        Ok(Choices::load()
            .map_err(unreadable)?
            .accounts
            .into_iter()
            .collect())
    }

    #[zbus(property)]
    async fn host_keys(&self) -> Vec<(String, String)> {
        sshd::host_keys()
    }

    async fn set_enabled(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        enabled: bool,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let _changing = self.changing.lock().await;
        if enabled {
            self.turn_on(connection, &header).await?;
        } else {
            self.turn_off(connection, &header).await?;
        }
        self.enabled_changed(&emitter).await?;
        self.accounts_changed(&emitter).await?;
        self.public_networks_changed(&emitter).await?;
        Ok(self.host_keys_changed(&emitter).await?)
    }

    async fn set_password_login(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        allowed: bool,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        authorize(
            connection,
            &header,
            if allowed { PASSWORDS } else { RESTRICT },
        )
        .await?;
        let _changing = self.changing.lock().await;
        self.change_choices(|choices| choices.password_login = allowed)
            .await?;
        Ok(self.password_login_changed(&emitter).await?)
    }

    async fn set_public_networks(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        allowed: bool,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        authorize(connection, &header, if allowed { PUBLIC } else { RESTRICT }).await?;
        let _changing = self.changing.lock().await;
        if !Choices::load()?.enabled {
            return Err(Error::Failed("Remote login is off".into()));
        }
        firewall::open(connection, allowed).await?;
        Ok(self.public_networks_changed(&emitter).await?)
    }

    async fn set_account_allowed(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        account: &str,
        allowed: bool,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let account = Account::by_name(account)
            .ok_or_else(|| Error::InvalidArgs(format!("{account} isn't a person's account")))?;
        authorize(
            connection,
            &header,
            if allowed { CONFIGURE } else { RESTRICT },
        )
        .await?;
        let _changing = self.changing.lock().await;
        self.change_choices(|choices| {
            if allowed {
                choices.accounts.insert(account.name);
            } else {
                choices.accounts.remove(&account.name);
            }
        })
        .await?;
        Ok(self.accounts_changed(&emitter).await?)
    }

    async fn authorized_keys(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<Key>, Error> {
        let _activity = self.idle.hold();
        let account = person(connection, &header).await?;
        let keys = account.run_as(keys::list).await?;
        Ok(keys.iter().map(described).collect())
    }

    async fn add_authorized_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        key: &str,
    ) -> Result<Key, Error> {
        let _activity = self.idle.hold();
        let key = PublicKey::parse(key).ok_or_else(|| {
            Error::InvalidArgs(if key.contains(PRIVATE_KEY) {
                "This is a private key, which never leaves the device it belongs to. Add the .pub file next to it instead".into()
            } else {
                "This isn't an SSH public key. One starts with ssh-ed25519, ecdsa-sha2 or ssh-rsa, as in a .pub file".into()
            })
        })?;
        let account = person(connection, &header).await?;
        let added = described(&key);
        account
            .run_as(move |account| keys::add(account, &key))
            .await?;
        Ok(added)
    }

    async fn remove_authorized_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        fingerprint: String,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let account = person(connection, &header).await?;
        let removed = account
            .run_as(move |account| keys::remove(account, &fingerprint))
            .await?;
        if removed {
            Ok(())
        } else {
            Err(Error::InvalidArgs(
                "No key with this fingerprint can sign in".into(),
            ))
        }
    }
}
