use std::io;
use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus::polkit;
use luft_dbus_macros::introspect;
use luft_files::client::Process;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::{Connection, interface};

use super::error::Error;
use super::prompt::Prompt;
use crate::work::place::Place;
use crate::work::trash::Person;
use crate::work::{copy, create, processes, remove, trash};

const CHANGE: &str = "com.lantharos.files.change";
const PROCESSES: &str = "com.lantharos.files.processes";

pub struct Files {
    idle: Arc<Idle>,
}

impl Files {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self { idle }
    }

    async fn allowed<T: Send + 'static>(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
        prompt: &Prompt,
        work: impl FnOnce() -> io::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        if !polkit::is_authorized_to(connection, header, action, &prompt.details()).await? {
            return Err(Error::not_authorized());
        }
        tokio::task::spawn_blocking(work)
            .await
            .map_err(io::Error::other)?
            .map_err(Error::from)
    }
}

async fn caller(connection: &Connection, header: &Header<'_>) -> Result<u32, Error> {
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    Ok(DBusProxy::new(connection)
        .await?
        .get_connection_unix_user(sender.to_owned().into())
        .await?)
}

#[introspect]
#[interface(name = "com.lantharos.Files1")]
impl Files {
    async fn copy(
        &self,
        source: Vec<u8>,
        target: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let prompt = Prompt::copy(&source, &target);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            copy::copy(&Place::find(&source)?, &Place::find(&target)?)
        })
        .await
    }

    #[zbus(name = "Move")]
    async fn move_to(
        &self,
        source: Vec<u8>,
        target: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let prompt = Prompt::move_to(&source, &target);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            copy::move_to(&Place::find(&source)?, &Place::find(&target)?)
        })
        .await
    }

    async fn delete(
        &self,
        path: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let prompt = Prompt::delete(&path);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            remove::remove(&Place::find(&path)?)
        })
        .await
    }

    #[zbus(out_args("file", "info"))]
    async fn trash(
        &self,
        path: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(Vec<u8>, Vec<u8>), Error> {
        let user = caller(connection, &header).await?;
        let prompt = Prompt::trash(&path);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            trash::put(&path, &Person::find(user)?)
        })
        .await
    }

    #[zbus(out_args("created"))]
    async fn make_folder(
        &self,
        path: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<bool, Error> {
        let prompt = Prompt::make_folder(&path);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            create::folder(&path)
        })
        .await
    }

    async fn make_file(
        &self,
        path: Vec<u8>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let prompt = Prompt::make_file(&path);
        self.allowed(connection, &header, CHANGE, &prompt, move || {
            create::file(&Place::find(&path)?)
        })
        .await
    }

    async fn signal(
        &self,
        processes: Vec<Process>,
        signal: i32,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let signal = processes::allowed(signal)?;
        let prompt = Prompt::signal(&processes, signal);
        self.allowed(connection, &header, PROCESSES, &prompt, move || {
            processes::signal(&processes, signal)
        })
        .await
    }

    async fn set_priority(
        &self,
        process: Process,
        nice: i32,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        let prompt = Prompt::set_priority(process);
        self.allowed(connection, &header, PROCESSES, &prompt, move || {
            processes::set_priority(process, nice)
        })
        .await
    }
}
