mod app;
mod client;
mod config;
mod discovery;
mod link;
mod progress;
mod protocol;
mod receive;
mod send;
mod server;
mod tls;

use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;

use app::App;
use link::{Command, Commands, Event, Link};
use send::What;
use tls::Identity;

const WORKERS: usize = 2;

fn main() -> ExitCode {
    let Some(data) = std::env::args_os().nth(1).map(PathBuf::from) else {
        eprintln!("pigeon: run it with the folder it keeps its certificate in");
        return ExitCode::FAILURE;
    };
    let identity = match Identity::load_or_create(&data) {
        Ok(identity) => identity,
        Err(error) => {
            eprintln!("pigeon: can't keep a certificate in {}: {error}", data.display());
            return ExitCode::FAILURE;
        }
    };
    let runtime = tokio::runtime::Builder::new_multi_thread().worker_threads(WORKERS).enable_all().build().expect("a runtime starts");
    runtime.block_on(run(identity));
    ExitCode::SUCCESS
}

async fn run(identity: Identity) {
    let mut commands = Commands::stdin();
    let config = loop {
        match commands.next().await {
            Some(Command::Configure(config)) => break config,
            Some(_) => continue,
            None => return,
        }
    };
    let app = App::new(identity, config::computer_name().await, config, Link::start());
    tokio::spawn(server::run(app.clone()));
    tokio::spawn(discovery::run(app.clone()));
    tokio::spawn(show_devices(app.clone()));
    while let Some(command) = commands.next().await {
        handle(&app, command);
    }
}

fn handle(app: &Arc<App>, command: Command) {
    match command {
        Command::Configure(config) => {
            let alias = config.alias(&app.computer);
            let renamed = alias != app.config.borrow().alias(&app.computer);
            app.link.send(Event::Ready { fingerprint: app.identity.fingerprint.clone(), alias, folder: config.folder() });
            app.config.send_replace(config);
            if renamed {
                app.scans.notify_one();
            }
        }
        Command::Scan => app.scans.notify_one(),
        Command::Send { device, paths } => app.outbox.send(app, &device, What::Files(paths)),
        Command::SendText { device, text } => app.outbox.send(app, &device, What::Text(text)),
        Command::Accept { id } => app.inbox.accept(&id),
        Command::Decline { id } => app.inbox.decline(&id),
        Command::Cancel { id } => {
            app.inbox.cancel(app, &id);
            app.outbox.cancel(&id);
        }
        Command::Pin { id, pin } => app.outbox.pin(&id, pin),
    }
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
