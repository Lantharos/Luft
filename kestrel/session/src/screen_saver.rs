use std::sync::Arc;

use futures_util::StreamExt;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::proxy::CacheProperties;
use zbus::{Connection, interface, proxy};

use crate::errors::Failure;
use crate::manager::{INHIBIT_IDLE, Session, sender};
use crate::presence::IdleMonitorProxy;

pub const NAME: &str = "org.freedesktop.ScreenSaver";
pub const PATHS: [&str; 2] = ["/org/freedesktop/ScreenSaver", "/ScreenSaver"];

#[proxy(
    interface = "org.gnome.ScreenSaver",
    default_service = "org.gnome.ScreenSaver",
    default_path = "/org/gnome/ScreenSaver"
)]
trait Shell {
    #[zbus(no_autostart)]
    fn get_active(&self) -> zbus::Result<bool>;

    #[zbus(no_autostart)]
    fn get_active_time(&self) -> zbus::Result<u32>;

    #[zbus(signal)]
    fn active_changed(&self, active: bool) -> zbus::Result<()>;
}

/// The freedesktop screen saver, which players and browsers use to keep the
/// screen on. The lock screen itself is Kestrel's.
pub struct ScreenSaver {
    session: Arc<Session>,
    shell: ShellProxy<'static>,
    idle_monitor: IdleMonitorProxy<'static>,
}

#[interface(name = "org.freedesktop.ScreenSaver")]
impl ScreenSaver {
    async fn inhibit(
        &self,
        app_id: &str,
        reason: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<u32, Failure> {
        Ok(self
            .session
            .inhibit(sender(&header), app_id, reason, INHIBIT_IDLE)
            .await?)
    }

    #[zbus(name = "UnInhibit")]
    async fn uninhibit(&self, cookie: u32) -> Result<(), Failure> {
        self.session.uninhibit(cookie).await?;
        Ok(())
    }

    async fn get_active(&self) -> Result<bool, Failure> {
        Ok(self.shell.get_active().await?)
    }

    async fn get_active_time(&self) -> Result<u32, Failure> {
        Ok(self.shell.get_active_time().await?)
    }

    async fn get_session_idle_time(&self) -> Result<u32, Failure> {
        let milliseconds = self.idle_monitor.get_idletime().await?;
        Ok(u32::try_from(milliseconds / 1000).unwrap_or(u32::MAX))
    }

    #[zbus(signal)]
    async fn active_changed(emitter: &SignalEmitter<'_>, active: bool) -> zbus::Result<()>;
}

/// Serves the screen saver at both paths apps look for it.
pub async fn serve(
    connection: &Connection,
    session: &Arc<Session>,
    idle_monitor: &IdleMonitorProxy<'static>,
) -> zbus::Result<()> {
    let shell = ShellProxy::builder(connection)
        .cache_properties(CacheProperties::No)
        .build()
        .await?;
    for path in PATHS {
        let screen_saver = ScreenSaver {
            session: Arc::clone(session),
            shell: shell.clone(),
            idle_monitor: idle_monitor.clone(),
        };
        connection.object_server().at(path, screen_saver).await?;
    }
    let mut changes = shell.receive_active_changed().await?;
    let connection = connection.clone();
    tokio::spawn(async move {
        while let Some(change) = changes.next().await {
            let Ok(args) = change.args() else { continue };
            for path in PATHS {
                let emitted = match SignalEmitter::new(&connection, path) {
                    Ok(emitter) => ScreenSaver::active_changed(&emitter, args.active).await,
                    Err(error) => Err(error),
                };
                if let Err(error) = emitted {
                    eprintln!("Couldn't pass on that the screen saver changed: {error}");
                }
            }
        }
    });
    Ok(())
}
