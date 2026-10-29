use luft_dbus_macros::introspect;
use zbus::Fd;
use zbus::{Connection, proxy};

use crate::portals::Options;

#[introspect]
#[proxy(
    interface = "com.lantharos.Settings.Printing",
    default_service = "com.lantharos.Settings",
    default_path = "/com/lantharos/Settings/Printing"
)]
trait Printing {
    fn printers(&self) -> zbus::Result<Vec<Options>>;

    fn print(
        &self,
        printer: &str,
        document: Fd<'_>,
        title: &str,
        options: &Options,
    ) -> zbus::Result<u32>;
}

pub async fn list(connection: &Connection) -> Vec<Options> {
    let listed = async { PrintingProxy::new(connection).await?.printers().await };
    listed.await.unwrap_or_else(|error| {
        eprintln!("Couldn't find printers: {error}");
        Vec::new()
    })
}

pub async fn submit(
    connection: &Connection,
    printer: &str,
    document: Fd<'_>,
    title: &str,
    job: &Options,
) -> zbus::Result<u32> {
    PrintingProxy::new(connection)
        .await?
        .print(printer, document, title, job)
        .await
}
