#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Sleep1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    Failed(String),
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        eprintln!("{error}");
        Self::Failed(format!("The setting couldn't be saved: {error}."))
    }
}
