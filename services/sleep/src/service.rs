use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;
use luft_dbus::polkit;
use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use crate::config;

const NAME: &str = "com.lantharos.Sleep1";
const PATH: &str = "/com/lantharos/Sleep1";
const CONFIGURE: &str = "com.lantharos.sleep.configure";

luft_dbus::errors!("com.lantharos.Sleep1.Error" {});

struct Sleep {
    idle: Arc<Idle>,
}

#[introspect]
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
        polkit::authorize(connection, &header, CONFIGURE).await?;
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

pub fn run() -> anyhow::Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(luft_dbus::idle::serve(NAME, PATH, |idle| Sleep { idle }))?;
    Ok(())
}
