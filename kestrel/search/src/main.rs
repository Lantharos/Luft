mod contents;
mod index;
mod names;
mod power;
mod service;

use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::atomic::AtomicBool;
use std::sync::mpsc;
use std::sync::{Arc, Mutex, RwLock};
use std::thread;

use futures_util::StreamExt;
use tokio::signal::unix::{SignalKind, signal};
use zbus::Connection;
use zbus::fdo::DBusProxy;

use contents::Store;
use index::Indexer;
use index::tree::Tree;
use names::Names;
use service::{NAME, PATH, Search};

fn home() -> PathBuf {
    env::var_os("HOME")
        .map(PathBuf::from)
        .expect("HOME is set in a session")
}

fn database(home: &std::path::Path) -> std::io::Result<PathBuf> {
    let cache = env::var_os("XDG_CACHE_HOME").map_or_else(|| home.join(".cache"), PathBuf::from);
    let folder = cache.join("kestrel").join("search");
    fs::create_dir_all(&folder)?;
    Ok(folder.join("contents.sqlite"))
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    match run().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {NAME}: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    let home = home();
    let database = database(&home)?;
    let tree = Tree::new(home).ok_or("the home folder can't be read")?;
    let names = Arc::new(RwLock::new(Arc::new(Names::default())));
    let on_battery = Arc::new(AtomicBool::new(false));
    let (wake, woken) = mpsc::channel();
    let indexer = Indexer {
        tree,
        store: Store::open(&database)?,
        names: names.clone(),
        on_battery: on_battery.clone(),
        wake: woken,
    };
    let search = Search {
        names,
        store: Arc::new(Mutex::new(Store::open(&database)?)),
        wake: wake.clone(),
    };
    tokio::spawn(async move {
        if let Err(error) = power::follow(on_battery, wake).await {
            eprintln!("Couldn't follow the power source, indexing as if plugged in: {error}");
        }
    });
    thread::Builder::new()
        .name("indexer".into())
        .spawn(move || indexer.run())?;

    let session = Connection::session().await?;
    session.object_server().at(PATH, search).await?;
    let mut lost = DBusProxy::new(&session)
        .await?
        .receive_name_lost_with_args(&[(0, NAME)])
        .await?;
    session.request_name(NAME).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
        _ = lost.next() => {}
    }
    Ok(())
}
