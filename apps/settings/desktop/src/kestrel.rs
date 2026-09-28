use serde::Serialize;
use zbus::blocking::Proxy;

use crate::dbus;
use crate::events::Events;

pub const ACCENT_CHANGED: &str = "kestrel.accent";

const DESTINATION: &str = "dev.lantharos.Kestrel";
const PATH: &str = "/dev/lantharos/Kestrel/Appearance";
const INTERFACE: &str = "dev.lantharos.Kestrel.Appearance";

#[derive(Serialize)]
pub struct Accent {
    color: String,
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session()?, DESTINATION, PATH, INTERFACE).map_err(|error| error.to_string())
}

pub fn accent() -> Result<Option<Accent>, String> {
    let color = proxy()?.get_property::<String>("AccentColor").ok();
    Ok(color
        .filter(|color| !color.is_empty())
        .map(|color| Accent { color }))
}

pub fn watch_accent(events: Events) {
    std::thread::spawn(move || {
        let Ok(proxy) = proxy() else {
            return;
        };
        for change in proxy.receive_property_changed::<String>("AccentColor") {
            if let Ok(color) = change.get() {
                events.emit(ACCENT_CHANGED, Accent { color });
            }
        }
    });
}
