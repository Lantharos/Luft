use std::time::Duration;

use anyhow::Result;
use futures_util::StreamExt;
use luft_accounts::types::Pause;
use tokio::sync::{broadcast, watch};
use zbus::{Connection, Proxy};

const NETWORK: (&str, &str, &str) = (
    "org.freedesktop.NetworkManager",
    "/org/freedesktop/NetworkManager",
    "org.freedesktop.NetworkManager",
);
const POWER: (&str, &str, &str) = (
    "org.freedesktop.UPower",
    "/org/freedesktop/UPower",
    "org.freedesktop.UPower",
);
const BATTERY: (&str, &str, &str) = (
    "org.freedesktop.UPower",
    "/org/freedesktop/UPower/devices/DisplayDevice",
    "org.freedesktop.UPower.Device",
);
const LOGIN: (&str, &str, &str) = (
    "org.freedesktop.login1",
    "/org/freedesktop/login1",
    "org.freedesktop.login1.Manager",
);
const CONNECTED_SITE: u32 = 60;
const METERED: [u32; 2] = [1, 3];
const LOW_BATTERY: f64 = 20.0;
const RETRY: Duration = Duration::from_secs(30);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Conditions {
    pub online: bool,
    pub pause: Option<Pause>,
}

#[derive(Clone, Copy, Default, PartialEq)]
struct Readings {
    online: Option<bool>,
    metered: bool,
    low_battery: bool,
}

impl Readings {
    fn conditions(self) -> Conditions {
        Conditions {
            online: self.online.unwrap_or(true),
            pause: if self.metered {
                Some(Pause::Metered)
            } else if self.low_battery {
                Some(Pause::Battery)
            } else {
                None
            },
        }
    }
}

pub struct Watchers {
    pub conditions: watch::Receiver<Conditions>,
    pub woke: broadcast::Sender<()>,
}

pub fn watch(system: Connection) -> Watchers {
    let initial = Readings::default();
    let (readings, _) = watch::channel(initial);
    let (conditions_sender, conditions) = watch::channel(initial.conditions());
    let (woke, _) = broadcast::channel(4);
    let mut combined = readings.subscribe();
    tokio::spawn(async move {
        while combined.changed().await.is_ok() {
            let next = combined.borrow_and_update().conditions();
            conditions_sender.send_if_modified(|current| std::mem::replace(current, next) != next);
        }
    });
    tokio::spawn(follow(
        system.clone(),
        NETWORK,
        readings.clone(),
        read_network,
    ));
    tokio::spawn(follow(
        system.clone(),
        POWER,
        readings.clone(),
        read_battery,
    ));
    tokio::spawn(follow(system.clone(), BATTERY, readings, read_battery));
    tokio::spawn(follow_sleep(system, woke.clone()));
    Watchers { conditions, woke }
}

type Apply = Box<dyn FnOnce(&mut Readings) + Send>;

async fn read_network(system: &Connection) -> Result<Apply> {
    let network = proxy(system, NETWORK).await?;
    let online = network.get_property::<u32>("State").await? >= CONNECTED_SITE;
    let metered = METERED.contains(&network.get_property::<u32>("Metered").await?);
    Ok(Box::new(move |readings| {
        readings.online = Some(online);
        readings.metered = metered;
    }))
}

async fn read_battery(system: &Connection) -> Result<Apply> {
    let on_battery = proxy(system, POWER)
        .await?
        .get_property::<bool>("OnBattery")
        .await?;
    let percentage = proxy(system, BATTERY)
        .await?
        .get_property::<f64>("Percentage")
        .await?;
    let low = on_battery && percentage <= LOW_BATTERY;
    Ok(Box::new(move |readings| readings.low_battery = low))
}

async fn proxy(
    system: &Connection,
    (name, path, interface): (&'static str, &'static str, &'static str),
) -> Result<Proxy<'static>> {
    Ok(Proxy::new(system, name, path, interface).await?)
}

async fn follow<F>(
    system: Connection,
    object: (&'static str, &'static str, &'static str),
    readings: watch::Sender<Readings>,
    read: F,
) where
    F: AsyncFn(&Connection) -> Result<Apply>,
{
    loop {
        let changes = async {
            let properties = proxy(
                &system,
                (object.0, object.1, "org.freedesktop.DBus.Properties"),
            )
            .await?;
            let mut changes = properties.receive_signal("PropertiesChanged").await?;
            loop {
                let apply = read(&system).await?;
                readings.send_modify(apply);
                if changes.next().await.is_none() {
                    return anyhow::Ok(());
                }
            }
        };
        if let Err(error) = changes.await {
            eprintln!("Not following {}: {error:#}", object.1);
        }
        tokio::time::sleep(RETRY).await;
    }
}

async fn follow_sleep(system: Connection, woke: broadcast::Sender<()>) {
    loop {
        let sleeping = async {
            let login = proxy(&system, LOGIN).await?;
            let mut signals = login.receive_signal("PrepareForSleep").await?;
            while let Some(signal) = signals.next().await {
                if !signal.body().deserialize::<bool>()? {
                    let _ = woke.send(());
                }
            }
            anyhow::Ok(())
        };
        if let Err(error) = sleeping.await {
            eprintln!("Not following sleep: {error:#}");
        }
        tokio::time::sleep(RETRY).await;
    }
}
