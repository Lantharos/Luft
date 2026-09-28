use std::collections::HashMap;
use std::fs;
use std::sync::Once;

use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::Proxy;

use crate::bridge::Commands;
use crate::dbus;
use crate::events::Events;

pub const CLOCK_CHANGED: &str = "datetime.changed";

const TIMEDATED: &str = "org.freedesktop.timedate1";
const TIMEDATED_PATH: &str = "/org/freedesktop/timedate1";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const ZONE_TABLE: &str = "/usr/share/zoneinfo/zone.tab";
const UTC: &str = "UTC";

static WATCH: Once = Once::new();

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Clock {
    timezone: String,
    automatic: bool,
    can_automatic: bool,
}

#[derive(Serialize)]
struct Zone {
    id: String,
    country: Option<String>,
}

#[derive(Deserialize)]
struct Timezone {
    timezone: String,
}

#[derive(Deserialize)]
struct Automatic {
    enabled: bool,
}

#[derive(Deserialize)]
struct Time {
    usec: i64,
}

fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, TIMEDATED, TIMEDATED_PATH, interface)
        .map_err(|error| error.to_string())
}

fn read() -> Result<Clock, String> {
    let timedated = proxy(TIMEDATED)?;
    let property = |name: &str| -> Result<bool, String> {
        timedated
            .get_property(name)
            .map_err(|error| error.to_string())
    };
    Ok(Clock {
        timezone: timedated
            .get_property("Timezone")
            .map_err(|error| error.to_string())?,
        automatic: property("NTP")?,
        can_automatic: property("CanNTP")?,
    })
}

fn watch(events: Events) {
    std::thread::spawn(move || {
        let Ok(properties) = proxy(PROPERTIES) else {
            return;
        };
        let Ok(changes) = properties.receive_signal("PropertiesChanged") else {
            return;
        };
        for _ in changes {
            if let Ok(clock) = read() {
                events.emit(CLOCK_CHANGED, clock);
            }
        }
    });
}

fn clock(events: &Events, _: Value) -> Result<Clock, String> {
    WATCH.call_once(|| watch(events.clone()));
    read()
}

fn countries() -> HashMap<String, String> {
    fs::read_to_string(ZONE_TABLE)
        .unwrap_or_default()
        .lines()
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| {
            let mut columns = line.split('\t');
            let country = columns.next()?;
            let zone = columns.nth(1)?;
            Some((zone.to_owned(), country.to_owned()))
        })
        .collect()
}

fn zones(_: Value) -> Result<Vec<Zone>, String> {
    let listed: Vec<String> = proxy(TIMEDATED)?
        .call("ListTimezones", &())
        .map_err(|error| error.to_string())?;
    let countries = countries();
    Ok(listed
        .into_iter()
        .filter_map(|id| match countries.get(&id) {
            Some(country) => Some(Zone {
                country: Some(country.clone()),
                id,
            }),
            None => (id == UTC).then_some(Zone { id, country: None }),
        })
        .collect())
}

fn call(method: &str, body: &(impl Serialize + zbus::zvariant::DynamicType)) -> Result<(), String> {
    proxy(TIMEDATED)?
        .call_method(method, body)
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn set_timezone(Timezone { timezone }: Timezone) -> Result<(), String> {
    call("SetTimezone", &(timezone, true))
}

fn set_automatic(Automatic { enabled }: Automatic) -> Result<(), String> {
    call("SetNTP", &(enabled, true))
}

fn set_time(Time { usec }: Time) -> Result<(), String> {
    call("SetTime", &(usec, false, true))
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_events("datetime_clock", events, clock)
        .command("datetime_zones", zones)
        .command("datetime_set_timezone", set_timezone)
        .command("datetime_set_automatic", set_automatic)
        .command("datetime_set_time", set_time)
}
