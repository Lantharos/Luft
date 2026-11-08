use luft_cups::Cups;
use luft_cups::drivers::Fit;

use crate::queues::{self, Device};

const LOOK_FOR: i32 = 5;

pub async fn set_up() -> anyhow::Result<()> {
    let cups = Cups::new("root".to_owned());
    let queued: Vec<String> = cups
        .printers(&["device-uri"])
        .await?
        .iter()
        .filter_map(|printer| printer.text("device-uri").map(str::to_owned))
        .collect();
    let new: Vec<Device> = queues::devices(&cups, LOOK_FOR, &["usb"])
        .await?
        .into_iter()
        .filter(|device| !queued.contains(&device.uri))
        .collect();
    if new.is_empty() {
        return Ok(());
    }
    let networked: Vec<_> = queues::devices(&cups, LOOK_FOR, &["dnssd"])
        .await?
        .iter()
        .map(Device::device_id)
        .collect();
    for device in new {
        let id = device.device_id();
        if networked.iter().any(|other| other.same_printer(&id)) {
            println!(
                "{} is on the network, where it prints without a driver",
                device.info
            );
            continue;
        }
        let drivers = queues::drivers(&cups, &id).await?;
        let Some(driver) = drivers.into_iter().find(|driver| driver.fit == Fit::Exact) else {
            println!(
                "No driver fits {}; it can be added in Settings",
                device.info
            );
            continue;
        };
        let name = queues::add(&cups, &device.uri, &driver.name, &device.info, "").await?;
        println!("Set up {name} with {}", driver.description);
    }
    Ok(())
}
