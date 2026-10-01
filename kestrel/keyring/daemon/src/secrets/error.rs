use zbus::DBusError;

#[derive(Debug, DBusError)]
#[zbus(prefix = "org.freedesktop.Secret.Error")]
pub enum SecretError {
    #[zbus(error)]
    ZBus(zbus::Error),
    IsLocked(String),
    NoSession(String),
    NoSuchObject(String),
}

impl SecretError {
    pub fn locked() -> Self {
        Self::IsLocked("The item is locked".into())
    }

    pub fn missing() -> Self {
        Self::NoSuchObject("No such item or collection".into())
    }

    pub fn failed(error: impl std::fmt::Display) -> Self {
        Self::ZBus(zbus::Error::Failure(error.to_string()))
    }
}
