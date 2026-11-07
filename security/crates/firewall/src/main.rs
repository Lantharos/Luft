mod error;
mod firewall;
mod network;
mod ports;
mod rules;
mod service;

use std::sync::Arc;

use luft_dbus::objects::settle;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::Mutex;
use zbus::Connection;

use firewall::Firewall;
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
    let firewall = Arc::new(Mutex::new(Firewall::start(layout).await?));
    let server = connection.object_server();
    server.at(PATH, Service::new(firewall.clone())).await?;
    connection.request_name(NAME).await?;
    let interface = server.interface::<_, Service>(PATH).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    loop {
        tokio::select! {
            changed = settle(&mut changes) => {
                if !changed {
                    break;
                }
            }
            _ = terminate.recv() => break,
            _ = interrupt.recv() => break,
        }
        let layout = match network::read(&connection).await {
            Ok(layout) => layout,
            Err(error) => {
                eprintln!("Couldn't read the networks: {error}");
                continue;
            }
        };
        if firewall.lock().await.follow(layout).await {
            let emitter = interface.signal_emitter();
            interface.get().await.unclassified_changed(emitter).await?;
        }
    }
    Ok(())
}
