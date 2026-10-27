use zbus::DBusError;
use zbus::message::{Header, Message};
use zbus::names::{ErrorName, OwnedErrorName};

const GENERAL: &str = "org.gnome.SessionManager.GeneralError";
const NOT_IN_INITIALIZATION: &str = "org.gnome.SessionManager.NotInInitialization";
const ACCESS_DENIED: &str = "org.freedesktop.DBus.Error.AccessDenied";
const FAILED: &str = "org.freedesktop.DBus.Error.Failed";

/// A D-Bus error under any name, so answers from Kestrel and logind reach
/// callers as they were given.
#[derive(Debug)]
pub struct Failure {
    name: OwnedErrorName,
    message: String,
}

impl Failure {
    fn named(name: &'static str, message: impl Into<String>) -> Self {
        Self {
            name: ErrorName::from_static_str_unchecked(name).into(),
            message: message.into(),
        }
    }

    pub fn general(message: impl Into<String>) -> Self {
        Self::named(GENERAL, message)
    }

    pub fn not_in_initialization(message: impl Into<String>) -> Self {
        Self::named(NOT_IN_INITIALIZATION, message)
    }

    pub fn access_denied(message: impl Into<String>) -> Self {
        Self::named(ACCESS_DENIED, message)
    }
}

impl From<zbus::Error> for Failure {
    fn from(error: zbus::Error) -> Self {
        let message = luft_dbus::explain(&error);
        match luft_dbus::error_name(&error).and_then(|name| OwnedErrorName::try_from(name).ok()) {
            Some(name) => Self { name, message },
            None => Self::named(FAILED, message),
        }
    }
}

impl DBusError for Failure {
    fn create_reply(&self, call: &Header<'_>) -> zbus::Result<Message> {
        Message::error(call, &self.name).build(&(&self.message,))
    }

    fn name(&self) -> ErrorName<'_> {
        self.name.as_ref()
    }

    fn description(&self) -> Option<&str> {
        Some(&self.message)
    }
}
