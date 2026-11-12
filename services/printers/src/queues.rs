use std::io;

use luft_cups::drivers::{self, DeviceId, Driver};
use luft_cups::ipp::Attributes;
use luft_cups::{Cups, Queue, uri};

pub const DRIVERLESS: &str = "everywhere";
const LEFT_OUT: [&str; 4] = ["gutenprint53+usb", "beh", "parallel", "serial"];
const NAME_LIMIT: usize = 127;
const QUEUE_ATTRIBUTES: [&str; 3] = ["printer-name", "device-uri", "printer-is-temporary"];

pub struct Device {
    pub uri: String,
    pub class: String,
    pub info: String,
    pub model: String,
    pub id: String,
}

impl Device {
    fn from(attributes: &Attributes) -> Option<Self> {
        let uri = attributes.text("device-uri")?.to_owned();
        if !uri.contains("://") || left_out(&uri) {
            return None;
        }
        let text = |key| attributes.text(key).unwrap_or_default().to_owned();
        Some(Self {
            class: text("device-class"),
            info: text("device-info"),
            model: text("device-make-and-model"),
            id: text("device-id"),
            uri,
        })
    }

    pub fn device_id(&self) -> DeviceId {
        identify(&self.id, &self.model)
    }
}

fn left_out(uri: &str) -> bool {
    let scheme = uri.split(':').next().unwrap_or_default();
    LEFT_OUT
        .iter()
        .any(|left_out| scheme.eq_ignore_ascii_case(left_out))
}

pub fn identify(device_id: &str, make_and_model: &str) -> DeviceId {
    let mut id = DeviceId::parse(device_id);
    if id.make.is_empty()
        && let Some((make, model)) = make_and_model.split_once(' ')
    {
        id.make = make.to_owned();
        id.model = model.to_owned();
    }
    id
}

pub async fn devices(cups: &Cups, timeout: i32, schemes: &[&str]) -> io::Result<Vec<Device>> {
    Ok(cups
        .devices(timeout, schemes)
        .await?
        .iter()
        .filter_map(Device::from)
        .collect())
}

pub async fn drivers(cups: &Cups, device: &DeviceId) -> io::Result<Vec<Driver>> {
    if device.make.is_empty() {
        return Ok(Vec::new());
    }
    Ok(drivers::rank(device, &cups.drivers(&device.make).await?))
}

fn free_name(info: &str, taken: &[String]) -> String {
    let name = uri::queue_name(info);
    let base = name.trim_matches('_');
    let base = if base.is_empty() { "Printer" } else { base };
    let base = &base[..base.len().min(NAME_LIMIT - 3)];
    let free = |name: &str| !taken.iter().any(|other| other.eq_ignore_ascii_case(name));
    if free(base) {
        return base.to_owned();
    }
    (2..)
        .map(|number| format!("{base}_{number}"))
        .find(|name| free(name))
        .unwrap_or_default()
}

fn queue_for<'a>(printers: &'a [Attributes], device: &str) -> Option<&'a Attributes> {
    let service = uri::service_queue(device);
    printers.iter().find(|printer| {
        printer.text("device-uri") == Some(device)
            || service
                .as_deref()
                .is_some_and(|name| printer.text("printer-name") == Some(name))
    })
}

pub async fn new_devices(cups: &Cups, timeout: i32) -> io::Result<Vec<Device>> {
    let (found, printers) = tokio::join!(
        devices(cups, timeout, &[]),
        cups.printers(&QUEUE_ATTRIBUTES)
    );
    let printers = printers?;
    Ok(found?
        .into_iter()
        .filter(|device| queue_for(&printers, &device.uri).is_none())
        .collect())
}

pub async fn add(
    cups: &Cups,
    device: &str,
    driver: &str,
    info: &str,
    location: &str,
) -> io::Result<String> {
    if left_out(device) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "Luft doesn't set up printers connected that way",
        ));
    }
    let printers = cups.printers(&QUEUE_ATTRIBUTES).await?;
    if let Some(printer) = queue_for(&printers, device) {
        let name = printer.text("printer-name").unwrap_or_default().to_owned();
        if printer.boolean("printer-is-temporary") {
            cups.keep(&name, &Queue::default()).await?;
        }
        return Ok(name);
    }
    let taken: Vec<String> = printers
        .iter()
        .filter_map(|printer| printer.text("printer-name").map(str::to_owned))
        .collect();
    let name = uri::service_queue(device).unwrap_or_else(|| free_name(info, &taken));
    let queue = Queue {
        device: Some(device),
        driver: Some(driver),
        info: Some(info),
        location: Some(location),
        defaults: &[],
    };
    cups.keep(&name, &queue).await?;
    Ok(name)
}

#[cfg(test)]
mod tests {
    use super::free_name;

    #[test]
    fn names_queues_like_cups() {
        assert_eq!(free_name("Canon MX490 series", &[]), "Canon_MX490_series");
        let taken = ["canon_mx490_series".to_owned()];
        assert_eq!(
            free_name("Canon MX490 series", &taken),
            "Canon_MX490_series_2"
        );
        assert_eq!(free_name("  ", &[]), "Printer");
    }
}
