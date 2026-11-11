mod app;
mod config;
mod events;
mod firewall;
mod localsend;
mod progress;
mod service;

use std::process::ExitCode;
use std::sync::Arc;

use app::App;
use events::{Event, Link};
use localsend::tls::Identity;
use service::Post;

const WORKERS: usize = 2;
const FOLDER: &str = "kestrel/post";

fn main() -> ExitCode {
    luft_dbus::panics::report();
    let data = dirs::data_dir().expect("people have a data folder").join(FOLDER);
    let identity = match Identity::load_or_create(&data) {
        Ok(identity) => identity,
        Err(error) => {
            eprintln!("kestrel-post: can't keep a certificate in {}: {error}", data.display());
            return ExitCode::FAILURE;
        }
    };
    let runtime = tokio::runtime::Builder::new_multi_thread().worker_threads(WORKERS).enable_all().build().expect("a runtime starts");
    match runtime.block_on(run(identity)) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("kestrel-post: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn run(identity: Identity) -> zbus::Result<()> {
    let system = zbus::Connection::system().await.ok();
    let (link, events) = Link::new();
    let app = App::new(identity, config::computer_name(system.as_ref()).await, link);
    let mut configured = app.config.subscribe();
    let session = zbus::Connection::session().await?;
    session.object_server().at(service::PATH, Post::new(app.clone())).await?;
    session.request_name(service::NAME).await?;
    tokio::spawn(service::pump(session.object_server().clone(), events));
    if configured.changed().await.is_err() {
        return Ok(());
    }
    tokio::spawn(localsend::server::run(app.clone()));
    tokio::spawn(localsend::discovery::run(app.clone()));
    tokio::spawn(show_devices(app.clone()));
    if let Some(system) = system {
        tokio::spawn(firewall::run(app, system));
    }
    std::future::pending().await
}

async fn show_devices(app: Arc<App>) {
    let mut devices = app.devices.watch();
    loop {
        let shown = devices.borrow_and_update().clone();
        app.link.send(Event::Devices { devices: shown });
        if devices.changed().await.is_err() {
            return;
        }
    }
}
