//! Whether reports may go out now: only on a connection that reaches the
//! internet and isn't metered, as NetworkManager sees it.

use futures_util::StreamExt;
use zbus::proxy::PropertyStream;
use zbus::{Connection, Proxy};

const NETWORK_MANAGER: &str = "org.freedesktop.NetworkManager";
const NETWORK_MANAGER_PATH: &str = "/org/freedesktop/NetworkManager";
const METERED: [u32; 2] = [1, 3];
const FULL_CONNECTIVITY: u32 = 4;

pub struct Network {
    manager: Proxy<'static>,
    metered: PropertyStream<'static, u32>,
    connectivity: PropertyStream<'static, u32>,
}

impl Network {
    pub async fn watch(system: &Connection) -> zbus::Result<Self> {
        let manager = Proxy::new(
            system,
            NETWORK_MANAGER,
            NETWORK_MANAGER_PATH,
            NETWORK_MANAGER,
        )
        .await?;
        Ok(Self {
            metered: manager.receive_property_changed("Metered").await,
            connectivity: manager.receive_property_changed("Connectivity").await,
            manager,
        })
    }

    pub async fn allows_sending(&self) -> bool {
        let metered = self
            .manager
            .get_property::<u32>("Metered")
            .await
            .is_ok_and(|metered| METERED.contains(&metered));
        let online =
            self.manager.get_property::<u32>("Connectivity").await == Ok(FULL_CONNECTIVITY);
        online && !metered
    }

    /// Waits until the connection changes in a way that matters here.
    pub async fn changed(&mut self) {
        tokio::select! {
            _ = self.metered.next() => {}
            _ = self.connectivity.next() => {}
        }
    }
}
