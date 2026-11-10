use luft_app::dbus::{self, explain};
use luft_dbus_macros::introspect;
use serde::Serialize;
use zbus::{Connection, DeserializeDict, proxy};

#[derive(DeserializeDict, zbus::Type, Serialize, specta::Type)]
#[zbus(signature = "a{sv}", rename_all = "kebab-case")]
#[serde(rename_all = "camelCase")]
pub struct Printer {
    name: String,
    description: String,
    location: String,
    model: String,
    device: String,
    state: i32,
    reasons: Vec<String>,
    message: String,
    accepting: bool,
    temporary: bool,
    default: bool,
    markers: Vec<(String, i32, String)>,
    media: Vec<String>,
    media_default: String,
    sides: Vec<String>,
    sides_default: String,
    color_modes: Vec<String>,
    color_mode_default: String,
}

#[derive(DeserializeDict, zbus::Type, Serialize, specta::Type)]
#[zbus(signature = "a{sv}", rename_all = "kebab-case")]
#[serde(rename_all = "camelCase")]
pub struct PrintJob {
    id: u32,
    printer: String,
    name: String,
    owner: String,
    state: i32,
    created: i32,
    mine: bool,
}

#[introspect]
#[proxy(
    interface = "com.lantharos.Settings.Printing",
    default_service = "com.lantharos.Settings",
    default_path = "/com/lantharos/Settings/Printing"
)]
pub trait Printing {
    fn printers(&self) -> zbus::Result<Vec<Printer>>;

    fn available(&self) -> zbus::Result<Vec<(String, String, String)>>;

    fn add_available(&self, printer: &str) -> zbus::Result<()>;

    fn jobs(&self) -> zbus::Result<Vec<PrintJob>>;

    fn cancel_job(&self, printer: &str, job: u32) -> zbus::Result<()>;

    fn set_default(&self, printer: &str) -> zbus::Result<()>;

    fn print_test_page(&self, printer: &str) -> zbus::Result<u32>;

    #[zbus(signal)]
    fn changed(&self) -> zbus::Result<()>;
}

async fn connection() -> Result<&'static Connection, String> {
    dbus::session().await
}

pub async fn proxy() -> Result<PrintingProxy<'static>, String> {
    PrintingProxy::new(connection().await?)
        .await
        .map_err(|error| explain(&error))
}

pub async fn printers() -> Result<Vec<Printer>, String> {
    proxy()
        .await?
        .printers()
        .await
        .map_err(|error| explain(&error))
}

pub async fn jobs() -> Result<Vec<PrintJob>, String> {
    proxy().await?.jobs().await.map_err(|error| explain(&error))
}
