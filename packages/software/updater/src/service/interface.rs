use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use access::Idle;
use tokio::sync::mpsc;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, ObjectServer, SignalEmitter};
use zbus::{Connection, interface};

use super::PATH;
use super::error::Error;
use crate::bootc::{self, Upgrade};

const DOWNLOAD: &str = "com.lantharos.updater.download";
const ROLLBACK: &str = "com.lantharos.updater.rollback";

pub struct Updater {
    idle: Arc<Idle>,
    downloading: Mutex<Option<i32>>,
    downloaded: AtomicU64,
}

impl Updater {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            downloading: Mutex::new(None),
            downloaded: AtomicU64::new(0),
        }
    }

    fn download_pid(&self) -> Option<i32> {
        *self.downloading.lock().expect("download lock")
    }

    async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if access::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    fn refuse_while_downloading(&self) -> Result<(), Error> {
        match self.download_pid() {
            Some(_) => Err(Error::Busy("An update is being downloaded.".to_owned())),
            None => Ok(()),
        }
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

async fn follow(updater: InterfaceRef<Updater>, upgrade: Upgrade, idle: Arc<Idle>) {
    let _activity = idle.hold();
    let (sender, mut fetched) = mpsc::unbounded_channel();
    let work = tokio::task::spawn_blocking(move || {
        upgrade.follow(|bytes| {
            let _ = sender.send(bytes);
        })
    });
    let emitter = updater.signal_emitter();
    while let Some(bytes) = fetched.recv().await {
        let inner = updater.get().await;
        inner.downloaded.store(bytes, Ordering::Relaxed);
        let _ = inner.downloaded_changed(emitter).await;
    }
    let error = match work.await {
        Ok(Ok(())) => String::new(),
        Ok(Err(error)) => format!("{error:#}"),
        Err(_) => "The updater stopped unexpectedly.".to_owned(),
    };
    let inner = updater.get().await;
    *inner.downloading.lock().expect("download lock") = None;
    let _ = inner.downloading_changed(emitter).await;
    let _ = Updater::finished(emitter, &error).await;
}

#[interface(name = "com.lantharos.Updater1")]
impl Updater {
    #[zbus(property)]
    fn downloading(&self) -> bool {
        self.download_pid().is_some()
    }

    #[zbus(property)]
    fn downloaded(&self) -> u64 {
        self.downloaded.load(Ordering::Relaxed)
    }

    #[zbus(signal)]
    async fn finished(emitter: &SignalEmitter<'_>, error: &str) -> zbus::Result<()>;

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
        let upgrade = {
            let mut downloading = self.downloading.lock().expect("download lock");
            if downloading.is_some() {
                return Err(Error::Busy(
                    "An update is already being downloaded.".to_owned(),
                ));
            }
            let upgrade = Upgrade::start()?;
            *downloading = Some(upgrade.pid());
            upgrade
        };
        self.downloaded.store(0, Ordering::Relaxed);
        let _ = self.downloaded_changed(&emitter).await;
        let _ = self.downloading_changed(&emitter).await;
        let updater = server.interface::<_, Updater>(PATH).await?;
        tokio::spawn(follow(updater, upgrade, self.idle.clone()));
        Ok(())
    }

    async fn cancel(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, DOWNLOAD).await?;
        if let Some(pid) = self.download_pid() {
            unsafe { libc::kill(pid, libc::SIGTERM) };
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
