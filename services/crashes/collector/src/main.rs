//! Luft's crash collector. systemd starts it after every core dump, Luft's
//! programs wake it when they panic, and the crash reports service in each
//! session asks it for the reports that are theirs. It quits once nothing
//! has happened for half a minute.

mod accounts;
mod bus;
mod collector;
mod crashes;
mod journal;
mod poke;
mod scripts;
mod spool;
mod stack;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;
use zbus::object_server::SignalEmitter;

use crate::bus::{Bus, NAME, PATH};
use crate::collector::Collector;

const POKE: &str = "--poke";
const QUIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);

async fn serve() -> anyhow::Result<()> {
    let collector = Arc::new(Collector::open()?);
    let idle = Arc::new(Idle::default());
    let bus = Bus {
        collector: collector.clone(),
        idle: idle.clone(),
    };
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, bus)
        .name(NAME)
        .build()
        .await?;
    let emitter = SignalEmitter::new(&connection, PATH)?;
    let pokes = poke::socket()?;
    let mut found = bus::collect(&collector).await;
    loop {
        if found {
            Bus::collected(&emitter).await?;
        }
        let poked = async {
            match &pokes {
                Some(socket) => poke::next(socket).await,
                None => std::future::pending().await,
            }
        };
        tokio::select! {
            () = idle.wait(QUIT_WHEN_IDLE_FOR) => break,
            () = poked => {
                let _active = idle.hold();
                found = bus::collect(&collector).await;
            }
        }
    }
    connection.release_name(NAME).await?;
    Ok(())
}

fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    if std::env::args().nth(1).as_deref() == Some(POKE) {
        luft_dbus::panics::tell_collector();
        return Ok(());
    }
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(serve())
}
