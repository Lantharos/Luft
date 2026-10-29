use std::collections::BTreeMap;
use std::fs::File;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use tokio::sync::mpsc;
use zbus::OwnedFd;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::error::Error;
use crate::changes::{self, Report, Step};

const CHANGE: &str = "com.lantharos.packages.change";
const SOURCES: &str = "com.lantharos.packages.sources";

fn stopped() -> Error {
    Error::Failed("The system packages service stopped unexpectedly.".to_owned())
}

pub struct Packages {
    idle: Arc<Idle>,
    busy: AtomicBool,
}

impl Packages {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            busy: AtomicBool::new(false),
        }
    }

    async fn authorize(
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if luft_dbus::polkit::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    /// Runs `work`, which changes the system packages, reporting its steps.
    async fn change(
        &self,
        emitter: &SignalEmitter<'_>,
        work: impl FnOnce(Report) -> anyhow::Result<()> + Send + 'static,
    ) -> Result<(), Error> {
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
        let work = tokio::task::spawn_blocking(move || work(report));
        while let Some(step) = steps.recv().await {
            let _ = Self::step(emitter, step.name()).await;
        }
        let result = work.await;
        self.busy.store(false, Ordering::SeqCst);
        let _ = self.busy_changed(emitter).await;
        result.map_err(|_| stopped())?.map_err(Error::from)
    }

    async fn blocking<T: Send + 'static>(
        &self,
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| stopped())?
            .map_err(Error::from)
    }
}

#[introspect]
#[interface(name = "com.lantharos.Packages1")]
impl Packages {
    #[zbus(property)]
    fn busy(&self) -> bool {
        self.busy.load(Ordering::SeqCst)
    }

    #[zbus(signal)]
    async fn step(emitter: &SignalEmitter<'_>, step: &str) -> zbus::Result<()>;

    async fn list(&self) -> Result<String, Error> {
        self.blocking(changes::list).await
    }

    async fn rebuild(&self) -> Result<(), Error> {
        self.blocking(changes::rebuild).await
    }

    async fn install(
        &self,
        names: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        Self::authorize(connection, &header, CHANGE).await?;
        self.change(&emitter, move |report| changes::change(&names, &[], report))
            .await
    }

    async fn install_file(
        &self,
        package: OwnedFd,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        Self::authorize(connection, &header, CHANGE).await?;
        let package = File::from(std::os::fd::OwnedFd::from(package));
        self.change(&emitter, move |report| {
            changes::install_file(package, report)
        })
        .await
    }

    async fn remove(
        &self,
        names: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        Self::authorize(connection, &header, CHANGE).await?;
        self.change(&emitter, move |report| changes::change(&[], &names, report))
            .await
    }

    async fn describe_repository(
        &self,
        file: String,
        text: String,
        keys: BTreeMap<String, String>,
    ) -> Result<String, Error> {
        self.blocking(move || changes::describe_repository(&file, &text, &keys))
            .await
    }

    async fn add_repository(
        &self,
        file: String,
        text: String,
        keys: BTreeMap<String, String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        Self::authorize(connection, &header, SOURCES).await?;
        self.blocking(move || changes::add_repository(&file, &text, &keys))
            .await
    }

    async fn remove_repository(
        &self,
        file: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        Self::authorize(connection, &header, SOURCES).await?;
        self.change(&emitter, move |report| {
            changes::remove_repository(&file, report)
        })
        .await
    }
}
