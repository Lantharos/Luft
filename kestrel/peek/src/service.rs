use std::collections::HashMap;
use std::fmt;
use std::path::Path;

use zbus::blocking::Connection;
use zbus::zvariant::{Fd, OwnedValue};

#[zbus::proxy(
    interface = "com.lantharos.Kestrel.Peek",
    default_service = "com.lantharos.Kestrel.Peek",
    default_path = "/com/lantharos/Kestrel/Peek"
)]
pub trait Service {
    fn list(&self, handle: &str) -> zbus::Result<Vec<HashMap<String, OwnedValue>>>;
    fn handle_window(&self, handle: &str) -> zbus::Result<HashMap<String, OwnedValue>>;
    fn capture_window(&self, window: u64, output: Fd<'_>) -> zbus::Result<()>;
    fn capture_screen(&self, output: Fd<'_>) -> zbus::Result<()>;
    fn launch(&self, process: Fd<'_>) -> zbus::Result<String>;
    fn wait_for_window(
        &self,
        unit: &str,
        timeout: u32,
    ) -> zbus::Result<HashMap<String, OwnedValue>>;
    #[zbus(name = "Move")]
    fn move_to(&self, window: u64, x: f64, y: f64) -> zbus::Result<()>;
    fn click(&self, window: u64, x: f64, y: f64, button: u32, count: u32) -> zbus::Result<()>;
    fn drag(
        &self,
        window: u64,
        x: f64,
        y: f64,
        to_x: f64,
        to_y: f64,
        button: u32,
    ) -> zbus::Result<()>;
    fn scroll(&self, window: u64, x: f64, y: f64, dx: i32, dy: i32) -> zbus::Result<()>;
    #[zbus(name = "Type")]
    fn type_text(&self, window: u64, text: &str) -> zbus::Result<()>;
    fn key(&self, window: u64, combo: &str) -> zbus::Result<()>;
    fn stop(&self, handle: &str) -> zbus::Result<()>;
}

pub type Peek = ServiceProxyBlocking<'static>;

pub fn connect_session() -> Result<Peek, Failure> {
    let connection = Connection::session()?;
    Ok(ServiceProxyBlocking::new(&connection)?)
}

pub fn connect_display(bus: &Path) -> Result<Peek, Failure> {
    let connection = zbus::blocking::connection::Builder::address(
        format!("unix:path={}", bus.display()).as_str(),
    )?
    .build()?;
    Ok(ServiceProxyBlocking::new(&connection)?)
}

#[derive(Debug)]
pub struct Failure(pub String);

impl fmt::Display for Failure {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.0)
    }
}

impl From<zbus::Error> for Failure {
    fn from(error: zbus::Error) -> Self {
        match error {
            zbus::Error::MethodError(name, _, _)
                if name.as_str() == "org.freedesktop.DBus.Error.ServiceUnknown" =>
            {
                Self("Kestrel isn't running, or it is too old for peek".into())
            }
            zbus::Error::MethodError(_, Some(message), _) => Self(message),
            error => Self(error.to_string()),
        }
    }
}

impl From<std::io::Error> for Failure {
    fn from(error: std::io::Error) -> Self {
        Self(error.to_string())
    }
}

#[derive(Debug, Clone)]
pub struct Window {
    pub id: u64,
    pub app: String,
    pub name: String,
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub scale: f64,
    pub focused: bool,
    pub access: String,
    pub handle: String,
}

fn field<T: TryFrom<OwnedValue>>(
    fields: &HashMap<String, OwnedValue>,
    name: &str,
) -> Result<T, Failure> {
    fields
        .get(name)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
        .ok_or_else(|| Failure(format!("Kestrel described a window without its {name}")))
}

impl TryFrom<HashMap<String, OwnedValue>> for Window {
    type Error = Failure;

    fn try_from(fields: HashMap<String, OwnedValue>) -> Result<Self, Failure> {
        Ok(Self {
            id: field(&fields, "id")?,
            app: field(&fields, "app")?,
            name: field(&fields, "name")?,
            title: field(&fields, "title")?,
            width: field(&fields, "width")?,
            height: field(&fields, "height")?,
            scale: field(&fields, "scale")?,
            focused: field(&fields, "focused")?,
            access: field(&fields, "access")?,
            handle: field(&fields, "handle")?,
        })
    }
}

pub fn windows(peek: &Peek, handle: &str) -> Result<Vec<Window>, Failure> {
    peek.list(handle)?
        .into_iter()
        .map(Window::try_from)
        .collect()
}
