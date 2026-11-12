//! The system settings Kestrel may hand over once someone reviewed them:
//! each is read and changed through the service that owns it, exactly as
//! Settings does, and checked here before anything changes.

mod clock;
mod greeter;
mod updater;
mod usb;

use luft_variant::Channel;
use zbus::Connection;
use zbus::{OwnedVariant, Variant};

const SCHEDULES: [&str; 3] = ["daily", "weekly", "never"];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Setting {
    DeveloperTools,
    UsbProtection,
    UpdateChannel,
    UpdateSchedule,
    DownloadUpdates,
    TimeZone,
    AutomaticTime,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Value {
    Switch(bool),
    Text(String),
}

impl Value {
    pub fn variant(&self) -> OwnedVariant {
        match self {
            Self::Switch(on) => OwnedVariant::from(*on),
            Self::Text(text) => OwnedVariant::try_from(Variant::from(text.as_str()))
                .expect("a string is always a value"),
        }
    }

    fn switch(&self) -> bool {
        matches!(self, Self::Switch(true))
    }

    fn text(&self) -> &str {
        match self {
            Self::Text(text) => text,
            Self::Switch(_) => "",
        }
    }
}

impl Setting {
    pub const ALL: [Self; 7] = [
        Self::DeveloperTools,
        Self::UsbProtection,
        Self::UpdateChannel,
        Self::UpdateSchedule,
        Self::DownloadUpdates,
        Self::TimeZone,
        Self::AutomaticTime,
    ];

    pub fn named(name: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|setting| setting.name() == name)
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::DeveloperTools => "developer-tools",
            Self::UsbProtection => "usb-protection",
            Self::UpdateChannel => "update-channel",
            Self::UpdateSchedule => "update-schedule",
            Self::DownloadUpdates => "download-updates",
            Self::TimeZone => "time-zone",
            Self::AutomaticTime => "automatic-time",
        }
    }

    fn is_switch(self) -> bool {
        matches!(
            self,
            Self::DeveloperTools
                | Self::UsbProtection
                | Self::DownloadUpdates
                | Self::AutomaticTime
        )
    }

    /// The value a caller asked for, when it is one this setting takes.
    pub fn check(self, value: &Variant<'_>) -> Result<Value, String> {
        let value = match (self.is_switch(), value) {
            (true, Variant::Bool(on)) => Value::Switch(*on),
            (false, Variant::Str(text)) => Value::Text(text.as_str().to_owned()),
            _ if self.is_switch() => return Err(format!("{} is on or off.", self.name())),
            _ => return Err(format!("{} takes text.", self.name())),
        };
        let allowed = match self {
            Self::UpdateChannel => Channel::named(value.text()).is_some(),
            Self::UpdateSchedule => SCHEDULES.contains(&value.text()),
            Self::TimeZone => clock::is_zone(value.text()),
            _ => true,
        };
        if !allowed {
            return Err(format!(
                "“{}” isn't something {} can be.",
                value.text(),
                self.name()
            ));
        }
        Ok(value)
    }

    /// What changing to `value` does, in the words a password prompt uses.
    pub fn describe(self, value: &Value) -> String {
        let on = value.switch();
        match self {
            Self::DeveloperTools if on => "turn on developer tools".to_owned(),
            Self::DeveloperTools => "turn off developer tools".to_owned(),
            Self::UsbProtection if on => "hold back new USB devices while locked".to_owned(),
            Self::UsbProtection => "stop holding back new USB devices while locked".to_owned(),
            Self::UpdateChannel => format!("get {} versions of Luft", value.text()),
            Self::UpdateSchedule => match value.text() {
                "daily" => "look for updates every day".to_owned(),
                "weekly" => "look for updates every week".to_owned(),
                _ => "look for updates only when asked".to_owned(),
            },
            Self::DownloadUpdates if on => "download updates in the background".to_owned(),
            Self::DownloadUpdates => "stop downloading updates in the background".to_owned(),
            Self::TimeZone => format!("set the time zone to {}", value.text()),
            Self::AutomaticTime if on => "set the time automatically".to_owned(),
            Self::AutomaticTime => "stop setting the time automatically".to_owned(),
        }
    }

    pub async fn read(self, system: &Connection) -> zbus::Result<Value> {
        Ok(match self {
            Self::DeveloperTools => Value::Switch(greeter::developer_tools(system).await?),
            Self::UsbProtection => Value::Switch(usb::enabled(system).await?),
            Self::UpdateChannel => Value::Text(updater::channel(system).await?.name().to_owned()),
            Self::UpdateSchedule => Value::Text(updater::schedule(system).await?.0),
            Self::DownloadUpdates => Value::Switch(updater::schedule(system).await?.1),
            Self::TimeZone => Value::Text(clock::zone(system).await?),
            Self::AutomaticTime => Value::Switch(clock::automatic(system).await?),
        })
    }

    pub async fn apply(self, system: &Connection, value: &Value) -> Result<(), String> {
        let done = match self {
            Self::DeveloperTools => greeter::set_developer_tools(system, value.switch()).await,
            Self::UsbProtection => usb::set_enabled(system, value.switch()).await,
            Self::UpdateChannel => return updater::switch_channel(system, value.text()).await,
            Self::UpdateSchedule => updater::set_schedule(system, Some(value.text()), None).await,
            Self::DownloadUpdates => {
                updater::set_schedule(system, None, Some(value.switch())).await
            }
            Self::TimeZone => clock::set_zone(system, value.text()).await,
            Self::AutomaticTime => clock::set_automatic(system, value.switch()).await,
        };
        done.map_err(|error| luft_dbus::explain(&error))
    }
}

#[cfg(test)]
mod tests;
