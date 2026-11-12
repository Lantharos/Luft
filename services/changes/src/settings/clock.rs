use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

const ZONES: &str = "/usr/share/zoneinfo/tzdata.zi";
const UTC: &str = "UTC";

#[introspect]
#[proxy(
    interface = "org.freedesktop.timedate1",
    default_service = "org.freedesktop.timedate1",
    default_path = "/org/freedesktop/timedate1"
)]
trait Timedate {
    fn set_timezone(&self, timezone: &str, interactive: bool) -> zbus::Result<()>;

    #[zbus(name = "SetNTP")]
    fn set_ntp(&self, use_ntp: bool, interactive: bool) -> zbus::Result<()>;

    #[zbus(property)]
    fn timezone(&self) -> zbus::Result<String>;

    #[zbus(property, name = "NTP")]
    fn ntp(&self) -> zbus::Result<bool>;
}

/// Whether `name` is a time zone the system knows, by the zone and link
/// lines of its time zone data.
pub fn is_zone(name: &str) -> bool {
    name == UTC || std::fs::read_to_string(ZONES).is_ok_and(|zones| known(&zones, name))
}

fn known(zones: &str, name: &str) -> bool {
    zones.lines().any(|line| {
        let mut words = line.split_ascii_whitespace();
        match words.next() {
            Some("Z") => words.next() == Some(name),
            Some("L") => words.nth(1) == Some(name),
            _ => false,
        }
    })
}

pub async fn zone(system: &Connection) -> zbus::Result<String> {
    TimedateProxy::new(system).await?.timezone().await
}

pub async fn automatic(system: &Connection) -> zbus::Result<bool> {
    TimedateProxy::new(system).await?.ntp().await
}

pub async fn set_zone(system: &Connection, zone: &str) -> zbus::Result<()> {
    TimedateProxy::new(system)
        .await?
        .set_timezone(zone, false)
        .await
}

pub async fn set_automatic(system: &Connection, on: bool) -> zbus::Result<()> {
    TimedateProxy::new(system).await?.set_ntp(on, false).await
}

#[cfg(test)]
mod tests {
    use super::known;

    const DATA: &str = "Z Europe/Berlin 0:53:28 - LMT 1893 Ap\nZ Europe/Tirane 1:19:20 - LMT 1914\nL Europe/Zurich Europe/Busingen\n";

    #[test]
    fn knows_zones_and_their_links_by_the_time_zone_data() {
        assert!(known(DATA, "Europe/Tirane"));
        assert!(known(DATA, "Europe/Busingen"));
        assert!(!known(DATA, "Europe/Zurich"));
        assert!(!known(DATA, "Mars/Olympus"));
    }
}
