use std::time::Duration;

use futures_util::StreamExt;
use luft_daylight::Coordinates;
use luft_dbus_macros::introspect;
use zbus::OwnedObjectPath;
use zbus::{Connection, proxy};

const CITY_ACCURACY: u32 = 4;
const LOCATE_TIMEOUT: Duration = Duration::from_secs(60);

#[introspect]
#[proxy(
    interface = "org.freedesktop.GeoClue2.Manager",
    default_service = "org.freedesktop.GeoClue2",
    default_path = "/org/freedesktop/GeoClue2/Manager"
)]
trait Manager {
    fn create_client(&self) -> zbus::Result<OwnedObjectPath>;
    fn delete_client(&self, client: &OwnedObjectPath) -> zbus::Result<()>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.GeoClue2.Client",
    default_service = "org.freedesktop.GeoClue2"
)]
trait Client {
    fn start(&self) -> zbus::Result<()>;
    fn stop(&self) -> zbus::Result<()>;

    #[zbus(property)]
    fn set_desktop_id(&self, id: &str) -> zbus::Result<()>;

    #[zbus(property)]
    fn set_requested_accuracy_level(&self, level: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    fn location_updated(&self, old: OwnedObjectPath, new: OwnedObjectPath) -> zbus::Result<()>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.GeoClue2.Location",
    default_service = "org.freedesktop.GeoClue2"
)]
trait Location {
    #[zbus(property)]
    fn latitude(&self) -> zbus::Result<f64>;

    #[zbus(property)]
    fn longitude(&self) -> zbus::Result<f64>;
}

pub async fn locate(system: &Connection, desktop_id: &str) -> zbus::Result<Coordinates> {
    let manager = ManagerProxy::new(system).await?;
    let path = manager.create_client().await?;
    let located = locate_with(system, &path, desktop_id).await;
    if let Err(error) = manager.delete_client(&path).await {
        eprintln!("Couldn't close the location request: {error}");
    }
    located
}

async fn locate_with(
    system: &Connection,
    path: &OwnedObjectPath,
    desktop_id: &str,
) -> zbus::Result<Coordinates> {
    let client = ClientProxy::builder(system).path(path).build().await?;
    client.set_desktop_id(desktop_id).await?;
    client.set_requested_accuracy_level(CITY_ACCURACY).await?;
    let mut updates = client.receive_location_updated().await?;
    client.start().await?;
    let update = tokio::time::timeout(LOCATE_TIMEOUT, updates.next()).await;
    client.stop().await?;
    let update = update
        .ok()
        .flatten()
        .ok_or_else(|| zbus::Error::Failure("The location didn't arrive in time".into()))?;
    let location = LocationProxy::builder(system)
        .path(update.args()?.new)
        .build()
        .await?;
    Ok(Coordinates {
        latitude: location.latitude().await?,
        longitude: location.longitude().await?,
    })
}
