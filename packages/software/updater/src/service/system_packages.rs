use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use access::Idle;
use tokio::sync::mpsc;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::error::Error;
use crate::system_packages::{self, Report, Step};

const CHANGE: &str = "com.lantharos.updater.system-packages";

pub struct SystemPackages {
    idle: Arc<Idle>,
    busy: AtomicBool,
}

impl SystemPackages {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            busy: AtomicBool::new(false),
        }
    }

    async fn change(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        emitter: &SignalEmitter<'_>,
        add: Vec<String>,
        remove: Vec<String>,
    ) -> Result<(), Error> {
        if !access::is_authorized(connection, header, CHANGE).await? {
            return Err(Error::not_authorized());
        }
        if self.busy.swap(true, Ordering::SeqCst) {
            return Err(Error::Busy(
                "System packages are already being changed.".to_owned(),
            ));
        }
        let _ = self.busy_changed(emitter).await;
        let _activity = self.idle.hold();
        let (sender, mut steps) = mpsc::unbounded_channel();
        let report: Report = Arc::new(move |step: Step| {
            let _ = sender.send(step);
        });
        let work =
            tokio::task::spawn_blocking(move || system_packages::change(&add, &remove, report));
        while let Some(step) = steps.recv().await {
            let _ = Self::step(emitter, step.name()).await;
        }
        let result = work.await;
        self.busy.store(false, Ordering::SeqCst);
        let _ = self.busy_changed(emitter).await;
        result
            .map_err(|_| Error::Failed("The updater stopped unexpectedly.".to_owned()))?
            .map_err(Error::from)
    }
}

#[interface(name = "com.lantharos.Updater1.SystemPackages")]
impl SystemPackages {
    #[zbus(property)]
    fn busy(&self) -> bool {
        self.busy.load(Ordering::SeqCst)
    }

    #[zbus(signal)]
    async fn step(emitter: &SignalEmitter<'_>, step: &str) -> zbus::Result<()>;

    async fn list(&self) -> Result<String, Error> {
        let _activity = self.idle.hold();
        tokio::task::spawn_blocking(system_packages::list)
            .await
            .map_err(|_| Error::Failed("The updater stopped unexpectedly.".to_owned()))?
            .map_err(Error::from)
    }

    async fn install(
        &self,
        names: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.change(connection, &header, &emitter, names, Vec::new())
            .await
    }

    async fn remove(
        &self,
        names: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.change(connection, &header, &emitter, Vec::new(), names)
            .await
    }
}
