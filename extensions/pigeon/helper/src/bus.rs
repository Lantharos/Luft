use std::path::PathBuf;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::{Connection, fdo, interface};

use crate::app::App;
use crate::send::What;

const NAME: &str = "com.lantharos.Pigeon";
const PATH: &str = "/com/lantharos/Pigeon";

/// Lets apps on this computer, such as Rover, see nearby devices and send files to them through Pigeon.
struct Pigeon {
    app: Arc<App>,
}

#[introspect]
#[interface(interface = "com.lantharos.Pigeon")]
impl Pigeon {
    /// Nearby devices, each as its id, name and kind (`mobile`, `desktop`, `web`, `headless` or `server`).
    #[zbus(property)]
    fn devices(&self) -> Vec<(String, String, String)> {
        self.app.devices.watch().borrow().iter().map(|peer| (peer.id.clone(), peer.alias.clone(), peer.kind.clone())).collect()
    }

    /// Sends files and folders, by their full paths, to a nearby device. Pigeon shows how it goes.
    async fn send(
        &self,
        device: String,
        paths: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        luft_identity::caller::refuse_sandboxed(connection, &header).await?;
        self.app.outbox.send(&self.app, &device, What::Files(paths.into_iter().map(PathBuf::from).collect()));
        Ok(())
    }

    /// Looks for devices again.
    fn scan(&self) {
        self.app.scans.notify_one();
    }
}

/// Owns Pigeon's bus name while the helper runs, and tells listeners when the devices change.
pub async fn serve(app: Arc<App>) -> zbus::Result<()> {
    let mut devices = app.devices.watch();
    let connection = zbus::connection::Builder::session().name(NAME).serve_at(PATH, Pigeon { app }).build().await?;
    let pigeon = connection.object_server().interface::<_, Pigeon>(PATH).await?;
    while devices.changed().await.is_ok() {
        pigeon.get().await.devices_changed(pigeon.signal_emitter()).await?;
    }
    Ok(())
}
