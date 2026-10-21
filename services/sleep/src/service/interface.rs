use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::error::Error;
use crate::config;

const CONFIGURE: &str = "com.lantharos.sleep.configure";

pub struct Sleep {
    idle: Arc<Idle>,
}

impl Sleep {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self { idle }
    }
}

#[interface(name = "com.lantharos.Sleep1")]
impl Sleep {
    async fn set_power_off_after(
        &self,
        seconds: u32,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        let _activity = self.idle.hold();
        if !luft_dbus::polkit::is_authorized(connection, &header, CONFIGURE).await? {
            return Err(Error::NotAuthorized(
                "You aren't allowed to change how the computer sleeps.".to_owned(),
            ));
        }
        config::set_power_off_after((seconds > 0).then(|| Duration::from_secs(seconds.into())))?;
        self.power_off_after_changed(&emitter).await?;
        Ok(())
    }

    #[zbus(property)]
    fn power_off_after(&self) -> u32 {
        let _activity = self.idle.hold();
        config::power_off_after().map_or(0, |after| after.as_secs() as u32)
    }
}
