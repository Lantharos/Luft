use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus::polkit::{self, Details};
use luft_dbus_macros::introspect;
use zbus::OwnedVariant;
use zbus::message::Header;
use zbus::{Connection, interface};

use super::admit;
use super::error::Error;
use super::prompt;
use crate::settings::{Setting, Value};

const APPLY: &str = "com.lantharos.changes.apply";

pub struct Changes {
    idle: Arc<Idle>,
}

impl Changes {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self { idle }
    }
}

fn setting(name: &str) -> Result<Setting, Error> {
    Setting::named(name)
        .ok_or_else(|| Error::Invalid(format!("There's no system setting called “{name}”.")))
}

/// Every change, checked before any of them is made.
fn checked(changes: &[(String, OwnedVariant)]) -> Result<Vec<(Setting, Value)>, Error> {
    let mut checked = Vec::with_capacity(changes.len());
    for (name, value) in changes {
        let setting = setting(name)?;
        if checked.iter().any(|(seen, _)| *seen == setting) {
            return Err(Error::Invalid(format!("{name} is changed twice.")));
        }
        checked.push((setting, setting.check(value).map_err(Error::Invalid)?));
    }
    if checked.is_empty() {
        return Err(Error::Invalid("There's nothing to change.".to_owned()));
    }
    Ok(checked)
}

#[introspect]
#[interface(name = "com.lantharos.Changes1")]
impl Changes {
    /// The current value of each system setting named.
    async fn read(
        &self,
        settings: Vec<String>,
        #[zbus(connection)] connection: &Connection,
    ) -> Result<Vec<(String, OwnedVariant)>, Error> {
        let _activity = self.idle.hold();
        let mut values = Vec::with_capacity(settings.len());
        for name in settings {
            let value = setting(&name)?.read(connection).await?;
            values.push((name, value.variant()));
        }
        Ok(values)
    }

    /// Makes the changes Kestrel showed for review, in order, after one
    /// password for all of them. Stops at the first that fails and returns
    /// what each setting it changed was before, with why it stopped.
    async fn apply(
        &self,
        changes: Vec<(String, OwnedVariant)>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(Vec<(String, OwnedVariant)>, String), Error> {
        let _activity = self.idle.hold();
        admit::kestrel(connection, &header).await?;
        let changes = checked(&changes)?;
        let words: Vec<String> = changes
            .iter()
            .map(|(setting, value)| setting.describe(value))
            .collect();
        let names: Vec<&str> = changes.iter().map(|(setting, _)| setting.name()).collect();
        let message = prompt::message(&words);
        let names = names.join(",");
        let details = Details::message(&message).with("settings", &names);
        if !polkit::is_authorized_to(connection, &header, APPLY, &details).await? {
            return Err(Error::NotAuthorized(
                "The changes weren't allowed.".to_owned(),
            ));
        }
        let mut previous = Vec::with_capacity(changes.len());
        for (setting, value) in changes {
            let before = setting.read(connection).await?;
            if let Err(error) = setting.apply(connection, &value).await {
                return Ok((previous, error));
            }
            previous.push((setting.name().to_owned(), before.variant()));
        }
        Ok((previous, String::new()))
    }
}

#[cfg(test)]
mod tests {
    use zbus::OwnedVariant;

    use super::checked;

    fn change(name: &str, value: OwnedVariant) -> (String, OwnedVariant) {
        (name.to_owned(), value)
    }

    #[test]
    fn refuses_the_whole_set_for_one_bad_change() {
        let good = change("developer-tools", OwnedVariant::from(true));
        assert!(checked(std::slice::from_ref(&good)).is_ok());
        assert!(
            checked(&[
                good.clone(),
                change("online-accounts", OwnedVariant::from(true))
            ])
            .is_err()
        );
        assert!(checked(&[good.clone(), good]).is_err());
        assert!(checked(&[]).is_err());
    }
}
