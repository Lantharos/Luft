mod composer;
mod engine;
mod registration;
mod wire;

use std::fs::{self, File, TryLockError};
use std::time::Duration;

use futures_util::StreamExt;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use luft_dbus_macros::introspect;
use tokio::sync::mpsc::{self, UnboundedReceiver};
use zbus::object_server::ObjectServer;
use zbus::{Connection, MessageStream, OwnedObjectPath, connection, fdo, interface};

use crate::method::{self, ENGINE_PREFIX, SERVE_FLAG, Summary};
use crate::paths;
use engine::InputMethod;
use registration::COMPONENT;

const FACTORY_PATH: &str = "/org/freedesktop/IBus/Factory";
const ENGINE_PATH: &str = "/org/freedesktop/IBus/Engine";
const IBUS: &str = "org.freedesktop.IBus";
const IBUS_PATH: &str = "/org/freedesktop/IBus";
const SETTLE: Duration = Duration::from_millis(300);
const SETTLE_AT_MOST: Duration = Duration::from_secs(1);
const RECONNECT: Duration = Duration::from_secs(1);
const RECONNECT_TRIES: u32 = 10;

#[derive(Default)]
struct Factory {
    created: u32,
}

struct Service;

enum Ended {
    Changed,
    Disconnected,
}

#[introspect]
#[interface(name = "org.freedesktop.IBus.Factory")]
impl Factory {
    async fn create_engine(
        &mut self,
        name: String,
        #[zbus(object_server)] server: &ObjectServer,
    ) -> fdo::Result<OwnedObjectPath> {
        let id = name.strip_prefix(ENGINE_PREFIX).ok_or_else(|| {
            fdo::Error::InvalidArgs(format!("{name} isn't one of Keys' input methods"))
        })?;
        let method = InputMethod::load(id).map_err(fdo::Error::Failed)?;
        self.created += 1;
        let path = OwnedObjectPath::try_from(format!("{ENGINE_PATH}/{}", self.created))
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        server.at(&path, method).await?;
        server.at(&path, Service).await?;
        Ok(path)
    }
}

#[introspect]
#[interface(name = "org.freedesktop.IBus.Service")]
impl Service {
    async fn destroy(
        &self,
        #[zbus(object_server)] server: &ObjectServer,
        #[zbus(header)] header: zbus::message::Header<'_>,
    ) -> fdo::Result<()> {
        let Some(path) = header.path() else {
            return Ok(());
        };
        server.remove::<InputMethod, _>(path).await?;
        server.remove::<Service, _>(path).await?;
        Ok(())
    }
}

fn exec() -> Result<String, String> {
    let executable = std::env::current_exe().map_err(|error| error.to_string())?;
    Ok(format!(
        "'{}' {SERVE_FLAG}",
        executable.to_string_lossy().replace('\'', "'\\''")
    ))
}

async fn register(methods: &[Summary]) -> Result<Connection, String> {
    let address = luft_app::ibus::address()?;
    let connection = connection::Builder::address(address.as_str())
        .name(COMPONENT)
        .serve_at(FACTORY_PATH, Factory::default())
        .build()
        .await
        .map_err(|error| error.to_string())?;
    let component = registration::component(methods, exec()?)?;
    connection
        .call_method(
            Some(IBUS),
            IBUS_PATH,
            Some(IBUS),
            "RegisterComponent",
            &(component,),
        )
        .await
        .map_err(|error| error.to_string())?;
    Ok(connection)
}

async fn session(
    methods: &[Summary],
    changes: &mut UnboundedReceiver<()>,
) -> Result<Ended, String> {
    let connection = register(methods).await?;
    let disconnected = async {
        let mut messages = MessageStream::from(&connection);
        while messages.next().await.is_some() {}
    };
    tokio::pin!(disconnected);
    loop {
        tokio::select! {
            () = &mut disconnected => return Ok(Ended::Disconnected),
            Some(()) = changes.recv() => {
                if method::list() != methods {
                    return Ok(Ended::Changed);
                }
            }
        }
    }
}

fn watch() -> Result<UnboundedReceiver<()>, String> {
    let folder = paths::methods();
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let (sender, changes) = mpsc::unbounded_channel();
    let watch = Watch {
        events: WatchMask::CLOSE_WRITE
            | WatchMask::MOVED_TO
            | WatchMask::MOVED_FROM
            | WatchMask::DELETE,
        report: Report::Folders,
        quiet: SETTLE,
        latest: SETTLE_AT_MOST,
    };
    let watcher = FolderWatcher::spawn(watch, move |_| {
        let _ = sender.send(());
    })
    .map_err(|error| error.to_string())?;
    watcher.watch([folder]).map_err(|error| error.to_string())?;
    Ok(changes)
}

fn lock() -> Result<Option<File>, String> {
    let file = File::create(paths::host_lock()).map_err(|error| error.to_string())?;
    match file.try_lock() {
        Ok(()) => Ok(Some(file)),
        Err(TryLockError::WouldBlock) => Ok(None),
        Err(TryLockError::Error(error)) => Err(error.to_string()),
    }
}

pub fn serve() -> Result<(), String> {
    let Some(_lock) = lock()? else {
        return Ok(());
    };
    luft_app::block_on(async {
        let mut changes = watch()?;
        let mut failures = 0;
        loop {
            let methods = method::list();
            if methods.is_empty() {
                return Ok(());
            }
            match session(&methods, &mut changes).await {
                Ok(Ended::Changed) => failures = 0,
                Ok(Ended::Disconnected) | Err(_) if failures < RECONNECT_TRIES => {
                    failures += 1;
                    tokio::time::sleep(RECONNECT).await;
                }
                Ok(Ended::Disconnected) => return Ok(()),
                Err(error) => return Err(error),
            }
        }
    })
}
