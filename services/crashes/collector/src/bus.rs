use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, fdo, interface};

use crate::collector::Collector;

pub const NAME: &str = "com.lantharos.CrashCollector1";
pub const PATH: &str = "/com/lantharos/CrashCollector1";

pub struct Bus {
    pub collector: Arc<Collector>,
    pub idle: Arc<Idle>,
}

/// Collects on a blocking thread, since reading the journal waits on
/// `journalctl`.
pub async fn collect(collector: &Arc<Collector>) -> bool {
    let collector = collector.clone();
    match tokio::task::spawn_blocking(move || collector.collect()).await {
        Ok(Ok(found)) => found,
        Ok(Err(error)) => {
            eprintln!("Couldn't read the journal: {error:#}");
            false
        }
        Err(_) => false,
    }
}

#[introspect]
#[interface(name = "com.lantharos.CrashCollector1")]
impl Bus {
    /// The finished reports of crashes of the caller's own programs and of
    /// the system's, as JSON, each handed over once.
    async fn take(
        &self,
        #[zbus(header)] header: Header<'_>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<Vec<String>> {
        let _active = self.idle.hold();
        let uid = luft_identity::caller::uid(connection, &header)
            .await?
            .ok_or_else(|| fdo::Error::AccessDenied("The caller's account isn't known.".into()))?;
        if collect(&self.collector).await {
            Self::collected(&emitter).await?;
        }
        Ok(self.collector.take(uid))
    }

    #[zbus(signal)]
    pub async fn collected(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
