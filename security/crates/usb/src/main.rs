mod error;
mod protection;
mod seat;
mod service;
mod store;
mod unlocked;
mod usb;

use std::sync::Arc;

use futures_util::StreamExt;
use seat::SignedIn;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::Mutex;
use tokio::sync::watch::Receiver;
use zbus::Connection;
use zbus::fdo::DBusProxy;

use protection::Protection;
use service::{NAME, PATH, UsbProtection};
use usb::Events;

const NO_OWNER: &str = "";

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    let events = Events::open()?;
    let connection = Connection::system().await?;
    let mut signed_in = seat::watch_signed_in(&connection).await?;
    let protection = Arc::new(Mutex::new(Protection::start(
        *signed_in.borrow_and_update(),
    )));
    serve(&connection, &protection, &events, signed_in).await?;
    protection.lock().await.stop();
    Ok(())
}

async fn serve(
    connection: &Connection,
    protection: &Arc<Mutex<Protection>>,
    events: &Events,
    mut signed_in: Receiver<Option<SignedIn>>,
) -> anyhow::Result<()> {
    let server = connection.object_server();
    server
        .at(PATH, UsbProtection::new(protection.clone()))
        .await?;
    connection.request_name(NAME).await?;
    let interface = server.interface::<_, UsbProtection>(PATH).await?;
    let mut departures = DBusProxy::new(connection)
        .await?
        .receive_name_owner_changed_with_args(&[(2, NO_OWNER)])
        .await?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    loop {
        let change = tokio::select! {
            changed = signed_in.changed() => {
                changed?;
                let now = *signed_in.borrow_and_update();
                protection.lock().await.switch(now)
            }
            Some(departure) = departures.next() => {
                let departure = departure.args()?;
                protection.lock().await.shell_left(departure.name.as_str())
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
    Ok(())
}
