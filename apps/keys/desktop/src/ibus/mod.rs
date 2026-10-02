mod engine;
mod registration;
mod wire;

use std::fs::{self, File, TryLockError};
use std::time::Duration;

use futures_util::StreamExt;
use inotify::{EventStream, Inotify, WatchMask};
use zbus::object_server::ObjectServer;
use zbus::zvariant::OwnedObjectPath;
use zbus::{Connection, MessageStream, connection, fdo, interface};

use crate::method::{self, ENGINE_PREFIX, SERVE_FLAG, Summary};
use crate::paths;
use engine::InputMethod;
use registration::COMPONENT;

const FACTORY_PATH: &str = "/org/freedesktop/IBus/Factory";
const ENGINE_PATH: &str = "/org/freedesktop/IBus/Engine";
const IBUS: &str = "org.freedesktop.IBus";
const IBUS_PATH: &str = "/org/freedesktop/IBus";
const SETTLE: Duration = Duration::from_millis(300);
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
        .and_then(|builder| builder.name(COMPONENT))
        .and_then(|builder| builder.serve_at(FACTORY_PATH, Factory::default()))
        .map_err(|error| error.to_string())?
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
    changes: &mut EventStream<[u8; 1024]>,
) -> Result<Ended, String> {
    let connection = register(methods).await?;
    let disconnected = async {
        let mut messages = MessageStream::from(&connection);
        while messages.next().await.is_some() {}
    };
    tokio::pin!(disconnected);
    let settled = tokio::time::sleep(Duration::ZERO);
    tokio::pin!(settled);
    let mut pending = false;
    loop {
        tokio::select! {
            () = &mut disconnected => return Ok(Ended::Disconnected),
            Some(_) = changes.next() => {
                pending = true;
                settled.as_mut().reset(tokio::time::Instant::now() + SETTLE);
            }
            () = &mut settled, if pending => {
                pending = false;
                if method::list() != methods {
                    return Ok(Ended::Changed);
                }
            }
        }
    }
}

fn watch() -> Result<EventStream<[u8; 1024]>, String> {
    let folder = paths::methods();
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let inotify = Inotify::init().map_err(|error| error.to_string())?;
    inotify
        .watches()
        .add(
            &folder,
            WatchMask::CLOSE_WRITE
                | WatchMask::MOVED_TO
                | WatchMask::MOVED_FROM
                | WatchMask::DELETE,
        )
        .map_err(|error| error.to_string())?;
    inotify
        .into_event_stream([0; 1024])
        .map_err(|error| error.to_string())
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
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|error| error.to_string())?;
    runtime.block_on(async {
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
