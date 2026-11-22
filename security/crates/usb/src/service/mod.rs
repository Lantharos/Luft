mod ask;
mod bolt;
mod error;
mod interface;
mod protection;
mod seat;
mod unlocked;

use std::sync::Arc;

use futures_util::StreamExt;
use portguard::usb::Events;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::mpsc::{self, UnboundedSender};
use tokio::sync::{Mutex, Notify};
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::object_server::InterfaceRef;

use interface::{NAME, PATH, UsbProtection};
use protection::{Answer, Protection, Question};

const NO_OWNER: &str = "";

type Answered = (Question, Answer);

pub async fn run() -> anyhow::Result<()> {
    let events = Events::open()?;
    let connection = Connection::system().await?;
    let mut signed_in = seat::watch_signed_in(&connection).await?;
    let protection = Arc::new(Mutex::new(Protection::start(
        *signed_in.borrow_and_update(),
    )));
    let changed = Arc::new(Notify::new());
    let server = connection.object_server();
    server
        .at(
            PATH,
            UsbProtection::new(protection.clone(), changed.clone()),
        )
        .await?;
    connection.request_name(NAME).await?;
    let interface = server.interface::<_, UsbProtection>(PATH).await?;
    let mut departures = DBusProxy::new(&connection)
        .await?
        .receive_name_owner_changed_with_args(&[(2, NO_OWNER)])
        .await?;
    let (answers, mut answered) = mpsc::unbounded_channel::<Answered>();
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    follow_up(&connection, &protection, &answers).await;
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
            Some((question, answer)) = answered.recv() => {
                protection.lock().await.answered(&question, answer)
            }
            () = changed.notified() => {
                follow_up(&connection, &protection, &answers).await;
                continue;
            }
            _ = terminate.recv() => break,
            _ = interrupt.recv() => break,
        };
        announce(&interface, change).await;
        follow_up(&connection, &protection, &answers).await;
    }
    protection.lock().await.stop();
    Ok(())
}

async fn announce(interface: &InterfaceRef<UsbProtection>, change: protection::Change) {
    let announced = interface
        .get()
        .await
        .announce(interface.signal_emitter(), change)
        .await;
    if let Err(error) = announced {
        eprintln!("Couldn't announce the USB protection state: {error}");
    }
}

/// Does what a change leaves to do outside the lock: taking back a question
/// whose device left, telling boltd about a new mode, and asking about the
/// next device that waits for approval.
async fn follow_up(
    connection: &Connection,
    protection: &Mutex<Protection>,
    answers: &UnboundedSender<Answered>,
) {
    let (cancelled, bolt, question) = {
        let mut protection = protection.lock().await;
        (
            protection.take_cancelled(),
            protection.take_bolt(),
            protection.next_question(),
        )
    };
    if let Some(serial) = cancelled {
        ask::cancel(connection, serial).await;
    }
    if let Some(mode) = bolt {
        bolt::follow(connection, mode).await;
    }
    if let Some(question) = question {
        let connection = connection.clone();
        let answers = answers.clone();
        tokio::spawn(async move {
            let answer = ask::ask(&connection, &question).await;
            let _ = answers.send((question, answer));
        });
    }
}
