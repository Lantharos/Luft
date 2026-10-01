use std::time::Duration;

use futures_util::StreamExt;
use zbus::zvariant::OwnedObjectPath;
use zbus::{Connection, proxy};

const CITY_ACCURACY: u32 = 4;
const LOCATE_TIMEOUT: Duration = Duration::from_secs(60);
const ZONE_TABLES: [&str; 2] = [
    "/usr/share/zoneinfo/zone1970.tab",
    "/usr/share/zoneinfo/zone.tab",
];

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Coordinates {
    pub latitude: f64,
    pub longitude: f64,
}

#[proxy(
    interface = "org.freedesktop.GeoClue2.Manager",
    default_service = "org.freedesktop.GeoClue2",
    default_path = "/org/freedesktop/GeoClue2/Manager"
)]
trait Manager {
    fn create_client(&self) -> zbus::Result<OwnedObjectPath>;
    fn delete_client(&self, client: &OwnedObjectPath) -> zbus::Result<()>;
}

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
    let client = ClientProxy::builder(system).path(path)?.build().await?;
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
        .path(update.args()?.new)?
        .build()
        .await?;
    Ok(Coordinates {
        latitude: location.latitude().await?,
        longitude: location.longitude().await?,
    })
}

pub fn timezone() -> Option<String> {
    let target = std::fs::read_link("/etc/localtime").ok()?;
    let target = target.to_str()?;
    Some(target[target.find("zoneinfo/")? + "zoneinfo/".len()..].to_owned())
}

pub fn zone_coordinates(zone: &str) -> Option<Coordinates> {
    ZONE_TABLES.iter().find_map(|table| {
        let text = std::fs::read_to_string(table).ok()?;
        text.lines()
            .map(|line| line.split('\t').collect::<Vec<_>>())
            .find(|columns| columns.get(2) == Some(&zone))
            .and_then(|columns| parse_iso6709(columns[1]))
    })
}

fn parse_iso6709(text: &str) -> Option<Coordinates> {
    let split = text[1..].find(['+', '-'])? + 1;
    Some(Coordinates {
        latitude: degrees(&text[..split], 2)?,
        longitude: degrees(&text[split..], 3)?,
    })
}

fn degrees(text: &str, digits: usize) -> Option<f64> {
    let sign = if text.starts_with('-') { -1.0 } else { 1.0 };
    let body = &text[1..];
    let whole: f64 = body.get(..digits)?.parse().ok()?;
    let minutes: f64 = body.get(digits..digits + 2)?.parse().ok()?;
    let seconds: f64 = body
        .get(digits + 2..)
        .filter(|rest| !rest.is_empty())
        .map_or(Some(0.0), |rest| rest.parse().ok())?;
    Some(sign * (whole + minutes / 60.0 + seconds / 3600.0))
}
