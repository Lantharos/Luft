mod enroll;
mod error;

use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use crate::keyring;
use crate::store::{Person, Store};
use crate::ways::{self, Ways};
pub use error::Error;

pub const NAME: &str = "com.lantharos.SignIn1";
pub const PATH: &str = "/com/lantharos/SignIn1";
const ENROLL: &str = "com.lantharos.sign-in.enroll";
const PASSWORD_OFF: &str = "com.lantharos.sign-in.password-off";

type Enrolled = (String, String);

pub struct SignIn {
    idle: Arc<Idle>,
    changing: Mutex<()>,
}

async fn caller(connection: &Connection, header: &Header<'_>) -> Result<(u32, String), Error> {
    let sender = header.sender().ok_or(Error::NotAuthorized)?;
    let uid = DBusProxy::new(connection)
        .await?
        .get_connection_unix_user(sender.clone().into())
        .await
        .map_err(zbus::Error::from)?;
    let name = ways::user_name(uid).ok_or(Error::NotAuthorized)?;
    Ok((uid, name))
}

async fn authorize(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
) -> Result<(), Error> {
    if luft_dbus::polkit::is_authorized(connection, header, action).await? {
        Ok(())
    } else {
        Err(Error::NotAuthorized)
    }
}

async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, Error> + Send + 'static,
) -> Result<T, Error> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|error| Error::Failed(error.to_string()))?
}

fn listed(person: &Person) -> (Vec<Enrolled>, Vec<Enrolled>) {
    (
        person
            .keys
            .iter()
            .map(|key| (key.id.clone(), key.name.clone()))
            .collect(),
        person
            .cards
            .iter()
            .map(|card| (card.id.clone(), card.name.clone()))
            .collect(),
    )
}

impl SignIn {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            changing: Mutex::new(()),
        }
    }

    /// Removes what `remove` picks, and turns password sign-in back on when
    /// nothing else would be left.
    async fn remove(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        remove: impl FnOnce(&mut Person),
    ) -> Result<(), Error> {
        let (uid, name) = caller(connection, header).await?;
        let _changing = self.changing.lock().await;
        let fingerprint = ways::has_fingerprints(&name);
        Store::system().change(uid, |person| {
            remove(person);
            if !Ways::of(person, fingerprint).has_another() {
                person.password = true;
            }
        })?;
        Ok(())
    }
}

#[introspect]
#[interface(name = "com.lantharos.SignIn1")]
impl SignIn {
    /// The ways the account `uid` signs in, best first, for the login and
    /// lock screens to open on the right one.
    async fn ways(&self, uid: u32) -> Result<Vec<String>, Error> {
        let _activity = self.idle.hold();
        let person = Store::system().person(uid)?;
        let fingerprint = ways::user_name(uid).is_some_and(|name| ways::has_fingerprints(&name));
        Ok(Ways::of(&person, fingerprint).names())
    }

    /// The caller's security keys and smart cards, whether they chose to sign
    /// in with a password, and whether they could turn it off.
    async fn methods(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(Vec<Enrolled>, Vec<Enrolled>, bool, bool), Error> {
        let _activity = self.idle.hold();
        let (uid, name) = caller(connection, &header).await?;
        let person = Store::system().person(uid)?;
        let ways = Ways::of(&person, ways::has_fingerprints(&name));
        let (keys, cards) = listed(&person);
        Ok((keys, cards, person.password, ways.has_another()))
    }

    /// Whether a key that can sign in is plugged in, whether it has a PIN,
    /// and whether it checks fingerprints by itself.
    async fn find_security_key(&self) -> Result<(bool, bool, bool), Error> {
        let _activity = self.idle.hold();
        blocking(|| match enroll::plugged_key() {
            Ok((device, _)) => Ok((true, device.has_pin(), device.verifies_by_itself())),
            Err(Error::NoKey) => Ok((false, false, false)),
            Err(error) => Err(error),
        })
        .await
    }

    async fn add_security_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        pin: String,
    ) -> Result<String, Error> {
        let _activity = self.idle.hold();
        authorize(connection, &header, ENROLL).await?;
        let (uid, name) = caller(connection, &header).await?;
        let _changing = self.changing.lock().await;
        let known = Store::system().person(uid)?.keys;
        let runtime = tokio::runtime::Handle::current();
        let signals = emitter.to_owned();
        let enrolled = blocking(move || {
            enroll::security_key(&name, &pin, &known, |step| {
                let _ = runtime.block_on(Self::touch_security_key(&signals, step));
            })
        })
        .await?;
        let id = enrolled.record.id.clone();
        let person = Store::system().change(uid, |person| person.keys.push(enrolled.record))?;
        if let Some(secret) = enrolled.secret {
            keyring::key_added(uid, &id, secret.expose(), person.enrolled());
        }
        Self::changed(&emitter, uid).await?;
        Ok(id)
    }

    async fn remove_security_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        id: String,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let (uid, _) = caller(connection, &header).await?;
        self.remove(connection, &header, |person| {
            person.keys.retain(|key| key.id != id)
        })
        .await?;
        Ok(Self::changed(&emitter, uid).await?)
    }

    /// Whether a card with a certificate on it is in a reader, and its name.
    async fn find_smart_card(&self) -> Result<(bool, String), Error> {
        let _activity = self.idle.hold();
        blocking(|| {
            Ok(crate::card::inserted()
                .unwrap_or_default()
                .into_iter()
                .next()
                .map_or((false, String::new()), |found| (true, found.label)))
        })
        .await
    }

    async fn add_smart_card(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        pin: String,
    ) -> Result<String, Error> {
        let _activity = self.idle.hold();
        authorize(connection, &header, ENROLL).await?;
        let (uid, _) = caller(connection, &header).await?;
        let _changing = self.changing.lock().await;
        let known = Store::system().person(uid)?.cards;
        let enrolled = blocking(move || enroll::smart_card(&pin, &known)).await?;
        let id = enrolled.record.id.clone();
        let person = Store::system().change(uid, |person| person.cards.push(enrolled.record))?;
        if let Some(secret) = enrolled.secret {
            keyring::key_added(uid, &id, secret.expose(), person.enrolled());
        }
        Self::changed(&emitter, uid).await?;
        Ok(id)
    }

    async fn remove_smart_card(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        id: String,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let (uid, _) = caller(connection, &header).await?;
        self.remove(connection, &header, |person| {
            person.cards.retain(|card| card.id != id)
        })
        .await?;
        Ok(Self::changed(&emitter, uid).await?)
    }

    /// Turns signing in with the password on or off. It only goes off while
    /// a security key, card or fingerprint can sign in instead.
    async fn set_password_sign_in(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        allowed: bool,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        if !allowed {
            authorize(connection, &header, PASSWORD_OFF).await?;
        }
        let (uid, name) = caller(connection, &header).await?;
        let _changing = self.changing.lock().await;
        let store = Store::system();
        if !allowed && !Ways::of(&store.person(uid)?, ways::has_fingerprints(&name)).has_another() {
            return Err(Error::NothingElse);
        }
        store.change(uid, |person| person.password = allowed)?;
        Ok(Self::changed(&emitter, uid).await?)
    }

    #[zbus(signal)]
    async fn changed(emitter: &SignalEmitter<'_>, uid: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn touch_security_key(emitter: &SignalEmitter<'_>, step: u32) -> zbus::Result<()>;
}
