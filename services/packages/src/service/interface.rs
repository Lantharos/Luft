use std::collections::BTreeMap;
use std::fs::File;
use std::os::fd::AsFd;
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
use super::unreviewed::approver;
use crate::changes::{self, Report, Step};
use crate::extensions::unreviewed::Unreviewed;
use crate::extensions::{self, Signed};

const CHANGE: &str = "com.lantharos.packages.change";
const SOURCES: &str = "com.lantharos.packages.sources";
const LONGEST_CAPABILITY: usize = 256;
const EXTENSIONS: &str = "com.lantharos.packages.extensions";

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

    /// The account an extension call is for, once polkit allowed it.
    async fn extension_caller(connection: &Connection, header: &Header<'_>) -> Result<u32, Error> {
        Self::authorize(connection, header, EXTENSIONS).await?;
        luft_identity::caller::uid(connection, header)
            .await?
            .ok_or_else(Error::not_authorized)
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
    #[zbus(signal)]
    async fn step(emitter: &SignalEmitter<'_>, step: &str) -> zbus::Result<()>;

    async fn list(&self) -> Result<String, Error> {
        self.blocking(changes::list).await
    }

    async fn rebuild(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        if luft_identity::caller::uid(connection, &header).await? != Some(0) {
            return Err(Error::not_authorized());
        }
        self.blocking(changes::rebuild).await
    }

    async fn update(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        if luft_identity::caller::uid(connection, &header).await? != Some(0) {
            return Err(Error::not_authorized());
        }
        self.blocking(changes::update).await
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

    async fn provider(&self, capability: String) -> Result<String, Error> {
        if capability.is_empty()
            || capability.len() > LONGEST_CAPABILITY
            || capability.starts_with('-')
        {
            return Err(Error::Failed(format!(
                "{capability} isn't something a package provides."
            )));
        }
        self.blocking(move || crate::build::provider(&capability))
            .await
            .map(Option::unwrap_or_default)
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

    #[allow(clippy::too_many_arguments)]
    async fn install_extension(
        &self,
        id: String,
        listing: Vec<u8>,
        listing_seal: Vec<u8>,
        keys: Vec<u8>,
        keys_seal: Vec<u8>,
        archive: OwnedFd,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let uid = Self::extension_caller(connection, &header).await?;
        let archive = File::from(std::os::fd::OwnedFd::from(archive));
        let listing = Signed {
            body: listing,
            seal: listing_seal,
        };
        let keys = Signed {
            body: keys,
            seal: keys_seal,
        };
        self.blocking(move || extensions::install(uid, &id, &listing, &keys, archive))
            .await
    }

    async fn remove_extension(
        &self,
        id: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let uid = Self::extension_caller(connection, &header).await?;
        self.blocking(move || extensions::remove(uid, &id)).await
    }

    async fn install_unreviewed_extension(
        &self,
        id: String,
        folder: OwnedFd,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let question =
            format!("Install a copy of {id} that runs inside Luft without being reviewed");
        let uid = approver(connection, &header, &question).await?;
        let folder = std::os::fd::OwnedFd::from(folder);
        self.blocking(move || Unreviewed::system().install_copy(uid, &id, folder.as_fd()))
            .await
    }

    async fn allow_extension_folder(
        &self,
        id: String,
        path: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let question = format!("Run {id} inside Luft from {path} without it being reviewed");
        let uid = approver(connection, &header, &question).await?;
        self.blocking(move || Unreviewed::system().allow_folder(uid, &id, &path))
            .await
    }

    async fn remove_unreviewed_extension(
        &self,
        id: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let uid = luft_identity::caller::uid(connection, &header)
            .await?
            .ok_or_else(Error::not_authorized)?;
        self.blocking(move || Unreviewed::system().remove(uid, &id))
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
