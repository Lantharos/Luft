mod formats;
mod keyboards;
mod zones;

use std::time::Duration;

use luft_app::Commands;
use luft_app::dbus::failed;
use luft_app::dbus::service::{Service, get};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const LOCALE: Service = Service {
    name: "org.freedesktop.locale1",
    path: "/org/freedesktop/locale1",
    interface: "org.freedesktop.locale1",
};
const TIME: Service = Service {
    name: "org.freedesktop.timedate1",
    path: "/org/freedesktop/timedate1",
    interface: "org.freedesktop.timedate1",
};
const NETWORK: Service = Service {
    name: "org.freedesktop.NetworkManager",
    path: "/org/freedesktop/NetworkManager",
    interface: "org.freedesktop.NetworkManager",
};
const FULL_CONNECTIVITY: u32 = 4;
const LOCATION: &str = "https://geoip.fedoraproject.org/city";
const LOCATION_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(Serialize)]
struct Catalog {
    keyboards: Vec<keyboards::Keyboard>,
    zones: Vec<zones::Zone>,
}

#[derive(Deserialize)]
struct Keyboard {
    layout: String,
    variant: String,
}

#[derive(Deserialize)]
struct Zone {
    zone: String,
}

#[derive(Deserialize, Serialize)]
struct Location {
    time_zone: Option<String>,
    country_code: Option<String>,
}

async fn online() -> bool {
    NETWORK
        .read()
        .await
        .ok()
        .flatten()
        .and_then(|properties| get::<u32>(&properties, "Connectivity"))
        == Some(FULL_CONNECTIVITY)
}

async fn locate(_: Value) -> Result<Option<Location>, String> {
    if !online().await {
        return Ok(None);
    }
    tokio::task::spawn_blocking(fetch_location)
        .await
        .map_err(failed)?
        .map(Some)
}

fn fetch_location() -> Result<Location, String> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(LOCATION_TIMEOUT))
        .build()
        .new_agent();
    let body = agent
        .get(LOCATION)
        .call()
        .map_err(failed)?
        .body_mut()
        .read_to_string()
        .map_err(failed)?;
    serde_json::from_str(&body).map_err(failed)
}

async fn set_keyboard(Keyboard { layout, variant }: Keyboard) -> Result<(), String> {
    LOCALE
        .change::<_, ()>("SetX11Keyboard", &(layout, "", variant, "", true, true))
        .await
        .map_err(failed)
}

async fn set_zone(Zone { zone }: Zone) -> Result<(), String> {
    TIME.change::<_, ()>("SetTimezone", &(zone, true))
        .await
        .map_err(failed)
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("regional_catalog", |_: Value| {
            Ok(Catalog {
                keyboards: keyboards::all(),
                zones: zones::all(),
            })
        })
        .command_async("regional_locate", locate)
        .command_async("regional_keyboard", set_keyboard)
        .command_async("regional_zone", set_zone)
        .command_async("regional_formats_country", formats::unset_country)
        .command("regional_set_formats", formats::set)
}
