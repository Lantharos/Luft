mod error;
mod protection;
mod seat;
mod service;
mod store;
mod usb;

use std::sync::Arc;

use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::Mutex;
use zbus::Connection;

use protection::Protection;
use service::{NAME, PATH, UsbProtection};
use usb::Events;

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    let events = Events::open()?;
    let connection = Connection::system().await?;
    let mut unlocked = seat::watch_unlocked(&connection).await?;
    let protection = Arc::new(Mutex::new(Protection::start(*unlocked.borrow_and_update())));
    let server = connection.object_server();
    server
        .at(PATH, UsbProtection::new(protection.clone()))
        .await?;
    connection.request_name(NAME).await?;
    let interface = server.interface::<_, UsbProtection>(PATH).await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    loop {
        let change = tokio::select! {
            changed = unlocked.changed() => {
                changed?;
                let now = *unlocked.borrow_and_update();
                protection.lock().await.set_unlocked(now)
            }
            event = events.next() => protection.lock().await.handle(event?),
            _ = terminate.recv() => break,
            _ = interrupt.recv() => break,
        };
        let announced = interface
            .get()
            .await
            .announce(interface.signal_emitter(), change)
            .await;
        if let Err(error) = announced {
            eprintln!("Couldn't announce the USB protection state: {error}");
        }
    }
    protection.lock().await.stop();
    Ok(())
}
