use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use luft_variant::Variant;
use tokio::sync::mpsc;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, ObjectServer, SignalEmitter};
use zbus::{Connection, interface};

use super::PATH;
use super::error::Error;
use crate::bootc::{self, Fetch, Process};
use crate::schedule::{self, Every, Schedule};

const DOWNLOAD: &str = "com.lantharos.updater.download";
const ROLLBACK: &str = "com.lantharos.updater.rollback";
const SCHEDULE: &str = "com.lantharos.updater.schedule";
const VARIANT: &str = "com.lantharos.updater.variant";
const SYSTEM_PACKAGES: &str = "/var/lib/luft/system-packages/packages";
const PACKAGES: &str = "com.lantharos.Packages1";
const PACKAGES_PATH: &str = "/com/lantharos/Packages1";

pub struct Updater {
    idle: Arc<Idle>,
    downloading: Mutex<Option<Process>>,
    downloaded: AtomicU64,
    schedule: Mutex<Schedule>,
}

impl Updater {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            downloading: Mutex::new(None),
            downloaded: AtomicU64::new(0),
            schedule: Mutex::new(Schedule::load()),
        }
    }

    fn fetching(&self) -> Option<Process> {
        self.downloading.lock().expect("download lock").clone()
    }

    fn planned(&self) -> Schedule {
        *self.schedule.lock().expect("schedule lock")
    }

    async fn plan(&self, planned: Schedule) -> Result<(), Error> {
        self.blocking(move || planned.save()).await?;
        *self.schedule.lock().expect("schedule lock") = planned;
        Ok(())
    }

    async fn authorize(
        &self,
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

    async fn begin(
        &self,
        fetch: impl FnOnce() -> anyhow::Result<Fetch>,
        scheduled: bool,
        server: &ObjectServer,
        emitter: &SignalEmitter<'_>,
    ) -> Result<(), Error> {
        let fetch = {
            let mut downloading = self.downloading.lock().expect("download lock");
            if downloading.is_some() {
                return Err(Error::Busy(
                    "An update is already being downloaded.".to_owned(),
                ));
            }
            let fetch = fetch()?;
            *downloading = Some(fetch.process());
            fetch
        };
        self.downloaded.store(0, Ordering::Relaxed);
        let _ = self.downloaded_changed(emitter).await;
        let _ = self.downloading_changed(emitter).await;
        let updater = server.interface::<_, Updater>(PATH).await?;
        tokio::spawn(follow(updater, fetch, scheduled, self.idle.clone()));
        Ok(())
    }

    fn refuse_while_downloading(&self) -> Result<(), Error> {
        if self.fetching().is_some_and(|bootc| bootc.running()) {
            return Err(Error::Busy("An update is being downloaded.".to_owned()));
        }
        Ok(())
    }

    async fn blocking<T: Send + 'static>(
        &self,
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed("The updater stopped unexpectedly.".to_owned()))?
            .map_err(Error::from)
    }
}

async fn follow(updater: InterfaceRef<Updater>, fetch: Fetch, scheduled: bool, idle: Arc<Idle>) {
    let _activity = idle.hold();
    let (sender, mut fetched) = mpsc::unbounded_channel();
    let work = tokio::task::spawn_blocking(move || {
        fetch.follow(|bytes| {
            let _ = sender.send(bytes);
        })
    });
    let emitter = updater.signal_emitter();
    while let Some(bytes) = fetched.recv().await {
        let inner = updater.get().await;
        inner.downloaded.store(bytes, Ordering::Relaxed);
        let _ = inner.downloaded_changed(emitter).await;
    }
    let result = work.await;
    if matches!(result, Ok(Ok(()))) {
        build_system_packages(emitter.connection()).await;
    }
    let inner = updater.get().await;
    *inner.downloading.lock().expect("download lock") = None;
    let _ = inner.downloading_changed(emitter).await;
    let error = match result {
        Ok(Ok(())) => {
            if scheduled {
                let _ = Updater::update_found(emitter, true).await;
            }
            String::new()
        }
        Ok(Err(error)) => format!("{error:#}"),
        Err(_) => "The updater stopped unexpectedly.".to_owned(),
    };
    let _ = Updater::finished(emitter, &error).await;
}

async fn system_packages(connection: &Connection, method: &str) {
    if !Path::new(SYSTEM_PACKAGES).exists() {
        return;
    }
    let done = connection
        .call_method(Some(PACKAGES), PACKAGES_PATH, Some(PACKAGES), method, &())
        .await;
    if let Err(error) = done {
        eprintln!("{method} of the system packages: {error}");
    }
}

/// Has the system packages built for the version that was just staged, so they're ready when
/// it starts.
async fn build_system_packages(connection: &Connection) {
    system_packages(connection, "Rebuild").await;
}

/// Has the system packages brought up to their newest versions, for every version of Luft on
/// the computer.
async fn update_system_packages(connection: Connection, idle: Arc<Idle>) {
    let _activity = idle.hold();
    system_packages(&connection, "Update").await;
}

#[introspect]
#[interface(name = "com.lantharos.Updater1")]
impl Updater {
    #[zbus(property)]
    fn downloading(&self) -> bool {
        self.fetching().is_some()
    }

    #[zbus(property)]
    fn downloaded(&self) -> u64 {
        self.downloaded.load(Ordering::Relaxed)
    }

    #[zbus(property)]
    fn schedule(&self) -> &'static str {
        self.planned().every.name()
    }

    #[zbus(property)]
    fn download_automatically(&self) -> bool {
        self.planned().download
    }

    #[zbus(property)]
    fn last_checked(&self) -> u64 {
        self.planned().checked
    }

    #[zbus(signal)]
    async fn finished(emitter: &SignalEmitter<'_>, error: &str) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn update_found(emitter: &SignalEmitter<'_>, ready: bool) -> zbus::Result<()>;

    async fn set_schedule(
        &self,
        schedule: &str,
        download: bool,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SCHEDULE).await?;
        let every = Every::named(schedule)?;
        self.plan(Schedule {
            every,
            download,
            ..self.planned()
        })
        .await?;
        let _ = self.schedule_changed(&emitter).await;
        let _ = self.download_automatically_changed(&emitter).await;
        Ok(())
    }

    async fn run_schedule(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        if luft_identity::caller::uid(connection, &header).await? != Some(0) {
            return Err(Error::not_authorized());
        }
        let planned = self.planned();
        if !planned.due(schedule::now()) || self.fetching().is_some() {
            return Ok(());
        }
        if schedule::metered(connection).await {
            eprintln!("Not checking for updates over a metered connection.");
            return Ok(());
        }
        let Ok(available) = self.blocking(bootc::available).await else {
            return Ok(());
        };
        self.plan(Schedule {
            checked: schedule::now(),
            ..self.planned()
        })
        .await?;
        let _ = self.last_checked_changed(&emitter).await;
        if available && planned.download {
            return self.begin(Fetch::upgrade, true, server, &emitter).await;
        }
        tokio::spawn(update_system_packages(
            connection.clone(),
            self.idle.clone(),
        ));
        if available {
            Updater::update_found(&emitter, false).await?;
        }
        Ok(())
    }

    async fn status(&self) -> Result<String, Error> {
        self.blocking(bootc::status).await
    }

    async fn download(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, DOWNLOAD).await?;
        self.begin(Fetch::upgrade, false, server, &emitter).await
    }

    async fn switch_variant(
        &self,
        variant: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, VARIANT).await?;
        self.refuse_while_downloading()?;
        let named = Variant::named(variant);
        if named.name() != variant {
            return Err(Error::Failed(format!(
                "“{variant}” isn't one of Luft's images."
            )));
        }
        let target = self.blocking(move || bootc::switch_target(named)).await?;
        self.begin(|| Fetch::switch(&target), false, server, &emitter)
            .await
    }

    async fn cancel(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, DOWNLOAD).await?;
        if let Some(bootc) = self.fetching() {
            bootc.stop();
        }
        Ok(())
    }

    async fn apply(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, DOWNLOAD).await?;
        self.refuse_while_downloading()?;
        self.blocking(bootc::apply).await
    }

    async fn rollback(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ROLLBACK).await?;
        self.refuse_while_downloading()?;
        self.blocking(bootc::rollback).await
    }
}
