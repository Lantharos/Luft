use serde::Serialize;

use super::network::objects::{Object, Objects};
use super::{ADAPTER, BATTERY, DEVICE};

const BLOCKED: &str = "off-blocked";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Adapter {
    pub path: String,
    pub powered: bool,
    pub blocked: bool,
    pub discovering: bool,
    pub discoverable: bool,
    name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
enum Kind {
    Headphones,
    Speaker,
    Mouse,
    Keyboard,
    Gamepad,
    Phone,
    Computer,
    Tablet,
    Display,
    Printer,
    Camera,
    Other,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    path: String,
    name: String,
    kind: Kind,
    connected: bool,
    battery: Option<u8>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Bluetooth {
    pub adapter: Option<Adapter>,
    paired: Vec<Device>,
    nearby: Vec<Device>,
}

fn kind(icon: &str) -> Kind {
    match icon {
        "audio-headset" | "audio-headphones" => Kind::Headphones,
        "audio-card" | "audio-speakers" => Kind::Speaker,
        "input-mouse" => Kind::Mouse,
        "input-keyboard" => Kind::Keyboard,
        "input-gaming" => Kind::Gamepad,
        "phone" => Kind::Phone,
        "computer" => Kind::Computer,
        "input-tablet" => Kind::Tablet,
        "video-display" => Kind::Display,
        "printer" => Kind::Printer,
        "camera-photo" | "camera-video" => Kind::Camera,
        _ => Kind::Other,
    }
}

fn device(objects: &Objects, device: &Object, name: String) -> Device {
    Device {
        path: device.path.to_owned(),
        name,
        kind: kind(&device.get::<String>("Icon").unwrap_or_default()),
        connected: device.flag("Connected"),
        battery: objects
            .get(device.path, BATTERY)
            .and_then(|battery| battery.get("Percentage")),
    }
}

fn adapter(object: Object) -> Adapter {
    Adapter {
        path: object.path.to_owned(),
        powered: object.flag("Powered"),
        blocked: object.get::<String>("PowerState").as_deref() == Some(BLOCKED),
        discovering: object.flag("Discovering"),
        discoverable: object.flag("Discoverable"),
        name: object.get("Alias").unwrap_or_default(),
    }
}

pub fn build(objects: &Objects) -> Bluetooth {
    let adapter = objects
        .implementing(ADAPTER)
        .min_by_key(|adapter| adapter.path)
        .map(adapter);
    let mut paired = Vec::new();
    let mut nearby = Vec::new();
    let owned = objects.implementing(DEVICE).filter(|device| {
        adapter.as_ref().map(|adapter| adapter.path.as_str()) == device.link("Adapter").as_deref()
    });
    for object in owned {
        if object.flag("Paired") || object.flag("Bonded") {
            paired.push(device(
                objects,
                &object,
                object.get("Alias").unwrap_or_default(),
            ));
        } else if let Some(name) = object.get::<String>("Name")
            && object.get::<i16>("RSSI").is_some()
        {
            nearby.push(device(objects, &object, name));
        }
    }
    paired.sort_by_cached_key(|device| (!device.connected, device.name.to_lowercase()));
    nearby.sort_by_cached_key(|device| device.name.to_lowercase());
    Bluetooth {
        adapter,
        paired,
        nearby,
    }
}
