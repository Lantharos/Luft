use std::fs;
use std::sync::mpsc::{self, RecvTimeoutError, Sender};
use std::thread;
use std::time::Duration;

use zbus::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::zvariant::{OwnedValue, Structure};
use zbus::{Connection, connection};

const SIMPLE: &str = "org.freedesktop.IBus.Simple";
const SIMPLE_PROCESS: &str = "ibus-engine-sim";
const IBUS: &str = "org.freedesktop.IBus";
const IBUS_PATH: &str = "/org/freedesktop/IBus";
const XKB_ENGINE: &str = "xkb:";
const ENGINE_NAME_FIELD: usize = 2;
const SETTLE: Duration = Duration::from_millis(800);
const EXIT_POLL: Duration = Duration::from_millis(50);
const EXIT_TRIES: u32 = 60;

#[derive(Clone)]
pub struct Reloader(Sender<()>);

async fn global_engine(connection: &Connection) -> Option<String> {
    let reply = connection
        .call_method(Some(IBUS), IBUS_PATH, Some(IBUS), "GetGlobalEngine", &())
        .await
        .ok()?;
    let value: OwnedValue = reply.body().deserialize().ok()?;
    let description = Structure::try_from(value).ok()?;
    description
        .fields()
        .get(ENGINE_NAME_FIELD)
        .and_then(|field| field.downcast_ref::<String>().ok())
}

fn parent_of(pid: &str) -> Option<u32> {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    stat.rsplit_once(')')?
        .1
        .split_whitespace()
        .nth(1)?
        .parse()
        .ok()
}

fn simple_engine(daemon: u32) -> Option<i32> {
    fs::read_dir("/proc").ok()?.flatten().find_map(|entry| {
        let pid = entry.file_name().into_string().ok()?;
        let name = fs::read_to_string(format!("/proc/{pid}/comm")).ok()?;
        (name.trim() == SIMPLE_PROCESS && parent_of(&pid) == Some(daemon))
            .then(|| pid.parse().ok())?
    })
}

fn stop(pid: i32) -> Result<(), String> {
    if unsafe { libc::kill(pid, libc::SIGTERM) } == 0 {
        Ok(())
    } else {
        Err(std::io::Error::last_os_error().to_string())
    }
}

async fn restart_simple_engine() -> Result<(), String> {
    let address = luft_app::ibus::address()?;
    let connection = connection::Builder::address(address.as_str())
        .map_err(|error| error.to_string())?
        .build()
        .await
        .map_err(|error| error.to_string())?;
    let bus = DBusProxy::new(&connection)
        .await
        .map_err(|error| error.to_string())?;
    let simple = BusName::try_from(SIMPLE).map_err(|error| error.to_string())?;
    let daemon = connection
        .peer_creds()
        .await
        .map_err(|error| error.to_string())?
        .process_id()
        .ok_or("IBus didn't say which process it is")?;
    let Some(pid) = simple_engine(daemon) else {
        return Ok(());
    };
    let engine = global_engine(&connection).await;
    stop(pid)?;
    for _ in 0..EXIT_TRIES {
        if !bus.name_has_owner(simple.clone()).await.unwrap_or(false) {
            break;
        }
        tokio::time::sleep(EXIT_POLL).await;
    }
    if let Some(engine) = engine.filter(|engine| engine.starts_with(XKB_ENGINE)) {
        connection
            .call_method(
                Some(IBUS),
                IBUS_PATH,
                Some(IBUS),
                "SetGlobalEngine",
                &(engine,),
            )
            .await
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn serve(requests: mpsc::Receiver<()>) {
    let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    else {
        return;
    };
    while requests.recv().is_ok() {
        loop {
            match requests.recv_timeout(SETTLE) {
                Ok(()) => {}
                Err(RecvTimeoutError::Timeout) => break,
                Err(RecvTimeoutError::Disconnected) => return,
            }
        }
        if let Err(error) = runtime.block_on(restart_simple_engine()) {
            eprintln!("Keys couldn't refresh the dead keys in IBus: {error}");
        }
    }
}

impl Reloader {
    pub fn start() -> Self {
        let (sender, requests) = mpsc::channel();
        thread::Builder::new()
            .name("keys-compose".into())
            .spawn(move || serve(requests))
            .expect("the compose reloader thread starts");
        Self(sender)
    }

    pub fn reload(&self) {
        let _ = self.0.send(());
    }
}
