use futures_util::StreamExt;
use tokio::sync::watch;
use zbus::Variant;
use zbus::object_server::{InterfaceRef, SignalEmitter};
use zbus::proxy::CacheProperties;
use zbus::{Connection, interface, proxy};

use crate::properties;

pub const PATH: &str = "/org/gnome/SessionManager/Presence";
const INTERFACE: &str = "org.gnome.SessionManager.Presence";
const AVAILABLE: u32 = 0;
const IDLE: u32 = 3;

#[derive(Default)]
pub struct Presence {
    status: u32,
    status_text: String,
}

#[interface(name = "org.gnome.SessionManager.Presence")]
impl Presence {
    #[zbus(name = "SetStatus")]
    async fn request_status(
        &mut self,
        status: u32,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> zbus::fdo::Result<()> {
        Ok(self.change_status(status, &emitter).await?)
    }

    #[zbus(name = "SetStatusText")]
    async fn request_status_text(
        &mut self,
        text: String,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> zbus::fdo::Result<()> {
        Ok(self.change_status_text(text, &emitter).await?)
    }

    #[zbus(property(emits_changed_signal = "false"), name = "status")]
    fn status(&self) -> u32 {
        self.status
    }

    #[zbus(property, name = "status")]
    async fn set_status(
        &mut self,
        status: u32,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> zbus::Result<()> {
        self.change_status(status, &emitter).await
    }

    #[zbus(property(emits_changed_signal = "false"), name = "status-text")]
    fn status_text(&self) -> &str {
        &self.status_text
    }

    #[zbus(property, name = "status-text")]
    async fn set_status_text(
        &mut self,
        text: String,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> zbus::Result<()> {
        self.change_status_text(text, &emitter).await
    }

    #[zbus(signal, name = "StatusChanged")]
    async fn announce_status(emitter: &SignalEmitter<'_>, status: u32) -> zbus::Result<()>;

    #[zbus(signal, name = "StatusTextChanged")]
    async fn announce_status_text(emitter: &SignalEmitter<'_>, text: &str) -> zbus::Result<()>;
}

impl Presence {
    async fn change_status(
        &mut self,
        status: u32,
        emitter: &SignalEmitter<'_>,
    ) -> zbus::Result<()> {
        if status == self.status {
            return Ok(());
        }
        self.status = status;
        Self::announce_status(emitter, status).await?;
        properties::changed(emitter, INTERFACE, "status", Variant::from(status)).await
    }

    async fn change_status_text(
        &mut self,
        text: String,
        emitter: &SignalEmitter<'_>,
    ) -> zbus::Result<()> {
        if text == self.status_text {
            return Ok(());
        }
        self.status_text = text;
        Self::announce_status_text(emitter, &self.status_text).await?;
        properties::changed(
            emitter,
            INTERFACE,
            "status-text",
            Variant::from(&self.status_text),
        )
        .await
    }
}

#[proxy(
    interface = "org.gnome.Mutter.IdleMonitor",
    default_service = "org.gnome.Mutter.IdleMonitor",
    default_path = "/org/gnome/Mutter/IdleMonitor/Core"
)]
pub trait IdleMonitor {
    #[zbus(no_autostart)]
    fn add_idle_watch(&self, interval: u64) -> zbus::Result<u32>;

    #[zbus(no_autostart)]
    fn add_user_active_watch(&self) -> zbus::Result<u32>;

    #[zbus(no_autostart)]
    fn remove_watch(&self, id: u32) -> zbus::Result<()>;

    #[zbus(no_autostart)]
    fn get_idletime(&self) -> zbus::Result<u64>;

    #[zbus(signal)]
    fn watch_fired(&self, id: u32) -> zbus::Result<()>;
}

pub async fn idle_monitor(connection: &Connection) -> zbus::Result<IdleMonitorProxy<'static>> {
    IdleMonitorProxy::builder(connection)
        .cache_properties(CacheProperties::No)
        .build()
        .await
}

#[derive(Default)]
struct Watches {
    idle: u32,
    active: u32,
}

impl Watches {
    async fn clear(&mut self, monitor: &IdleMonitorProxy<'_>) {
        for watch in [
            std::mem::take(&mut self.idle),
            std::mem::take(&mut self.active),
        ] {
            if watch != 0 {
                let _ = monitor.remove_watch(watch).await;
            }
        }
    }

    async fn restart(
        &mut self,
        monitor: &IdleMonitorProxy<'_>,
        present: bool,
        delay: u32,
    ) -> zbus::Result<()> {
        if !present {
            *self = Self::default();
            return Ok(());
        }
        self.clear(monitor).await;
        if delay != 0 {
            self.idle = monitor.add_idle_watch(u64::from(delay) * 1000).await?;
        }
        Ok(())
    }

    async fn fired(
        &mut self,
        monitor: &IdleMonitorProxy<'_>,
        presence: &InterfaceRef<Presence>,
        signal: WatchFired,
    ) -> zbus::Result<()> {
        let id = signal.args()?.id;
        let emitter = presence.signal_emitter();
        if id == self.idle {
            presence
                .get_mut()
                .await
                .change_status(IDLE, emitter)
                .await?;
            self.active = monitor.add_user_active_watch().await?;
        } else if id == self.active {
            self.active = 0;
            presence
                .get_mut()
                .await
                .change_status(AVAILABLE, emitter)
                .await?;
        }
        Ok(())
    }
}

fn current(delay: &mut watch::Receiver<u32>) -> u32 {
    *delay.borrow_and_update()
}

fn report(followed: zbus::Result<()>) {
    if let Err(error) = followed {
        eprintln!("Couldn't follow whether the session is idle: {error}");
    }
}

/// Marks the session idle once nobody has used the computer for the idle
/// delay, and available again at the next input.
pub async fn follow_idle(
    monitor: IdleMonitorProxy<'static>,
    presence: InterfaceRef<Presence>,
    mut delay: watch::Receiver<u32>,
) -> zbus::Result<()> {
    let mut fired = monitor.receive_watch_fired().await?;
    let mut owners = monitor.inner().receive_owner_changed().await?;
    let mut watches = Watches::default();
    let mut present = zbus::fdo::DBusProxy::new(monitor.inner().connection())
        .await?
        .name_has_owner(monitor.inner().destination().clone())
        .await?;
    report(
        watches
            .restart(&monitor, present, current(&mut delay))
            .await,
    );
    loop {
        report(tokio::select! {
            Some(owner) = owners.next() => {
                present = owner.is_some();
                watches.restart(&monitor, present, current(&mut delay)).await
            },
            Ok(()) = delay.changed() => watches.restart(&monitor, present, current(&mut delay)).await,
            Some(signal) = fired.next() => watches.fired(&monitor, &presence, signal).await,
        });
    }
}
