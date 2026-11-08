mod apps;
mod error;
mod firewall;
mod listening;
mod network;
mod ports;
mod rules;
mod service;
mod store;

use std::sync::Arc;

use luft_dbus::objects::settle;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::Mutex;
use zbus::Connection;

use firewall::{Firewall, Followed};
use listening::Watcher;
use service::{NAME, PATH, Service};

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    let connection = Connection::system().await?;
    let mut changes = network::changes(&connection)
        .await
        .map_err(anyhow::Error::msg)?;
    let layout = network::read(&connection).await.unwrap_or_else(|error| {
        eprintln!("Couldn't read the networks yet: {error}");
        Default::default()
    });
    let mut watcher = Watcher::start()?;
    let firewall = Firewall::start(layout).await?;
    watcher.adopt(firewall.cookies())?;
    let firewall = Arc::new(Mutex::new(firewall));
    let server = connection.object_server();
    server.at(PATH, Service::new(firewall.clone())).await?;
    connection.request_name(NAME).await?;
    let interface = server.interface::<_, Service>(PATH).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    loop {
        let followed = tokio::select! {
            changed = settle(&mut changes) => {
                if !changed {
                    break;
                }
                match network::read(&connection).await {
                    Ok(layout) => firewall.lock().await.follow(layout).await,
                    Err(error) => {
                        eprintln!("Couldn't read the networks: {error}");
                        continue;
                    }
                }
            }
            bound = watcher.next() => Followed {
                reclassified: false,
                waiting: firewall.lock().await.observe(bound?).await,
            },
            _ = terminate.recv() => break,
            _ = interrupt.recv() => break,
        };
        let emitter = interface.signal_emitter();
        if followed.reclassified {
            interface.get().await.unclassified_changed(emitter).await?;
        }
        if followed.waiting {
            interface.get().await.waiting_changed(emitter).await?;
        }
    }
    Ok(())
}
