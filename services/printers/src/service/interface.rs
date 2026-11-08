use std::collections::HashMap;
use std::sync::Arc;

use luft_cups::drivers::Fit;
use luft_cups::{Cups, Queue};
use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::{Connection, interface};

use super::error::Error;
use crate::queues;

const MANAGE: &str = "com.lantharos.printers.manage";
const LOOK_FOR: i32 = 6;
const OPTIONS: [&str; 3] = ["media", "sides", "print-color-mode"];

pub struct Printers {
    idle: Arc<Idle>,
    cups: Cups,
}

impl Printers {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            cups: Cups::new("root".to_owned()),
        }
    }

    async fn allowed(&self, connection: &Connection, header: &Header<'_>) -> Result<(), Error> {
        if luft_dbus::polkit::is_authorized(connection, header, MANAGE).await? {
            Ok(())
        } else {
            Err(Error::NotAuthorized(
                "You aren't allowed to change printers.".to_owned(),
            ))
        }
    }
}

#[introspect]
#[interface(name = "com.lantharos.Printers1")]
impl Printers {
    async fn devices(&self) -> Result<Vec<(String, String, String, String, String)>, Error> {
        let _activity = self.idle.hold();
        let devices = queues::new_devices(&self.cups, LOOK_FOR).await?;
        Ok(devices
            .into_iter()
            .map(|device| {
                (
                    device.uri,
                    device.class,
                    device.info,
                    device.model,
                    device.id,
                )
            })
            .collect())
    }

    async fn drivers(
        &self,
        device_id: &str,
        make_and_model: &str,
    ) -> Result<Vec<(String, String, bool)>, Error> {
        let _activity = self.idle.hold();
        let device = queues::identify(device_id, make_and_model);
        let drivers = queues::drivers(&self.cups, &device).await?;
        Ok(drivers
            .into_iter()
            .map(|driver| (driver.name, driver.description, driver.fit != Fit::Other))
            .collect())
    }

    async fn add(
        &self,
        device: &str,
        driver: &str,
        info: &str,
        location: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        let _activity = self.idle.hold();
        self.allowed(connection, &header).await?;
        let driver = if driver.is_empty() {
            queues::DRIVERLESS
        } else {
            driver
        };
        Ok(queues::add(&self.cups, device, driver, info, location).await?)
    }

    async fn remove(
        &self,
        name: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        self.allowed(connection, &header).await?;
        Ok(self.cups.delete(name).await?)
    }

    async fn configure(
        &self,
        name: &str,
        options: HashMap<String, String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        self.allowed(connection, &header).await?;
        let defaults: Vec<(String, &str)> = options
            .iter()
            .filter(|(option, _)| OPTIONS.contains(&option.as_str()))
            .map(|(option, value)| (format!("{option}-default"), value.as_str()))
            .collect();
        let defaults: Vec<(&str, &str)> = defaults
            .iter()
            .map(|(option, value)| (option.as_str(), *value))
            .collect();
        let queue = Queue {
            defaults: &defaults,
            ..Queue::default()
        };
        Ok(self.cups.keep(name, &queue).await?)
    }
}
