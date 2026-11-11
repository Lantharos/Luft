//! Luft's crash reports service in each session. It takes the reports of
//! the person's crashes and the system's from the collector, asks through
//! Kestrel or follows the person's choice, and sends the agreed ones when
//! the connection allows.

mod bus;
mod config;
mod image;
mod network;
mod post;
mod state;

use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use anyhow::Context;
use futures_util::StreamExt;
use luft_crash_report::Crash;
use tokio::signal::unix::{SignalKind, signal};
use zbus::{Connection, Proxy};

use crate::bus::{NAME, PATH, Reports, Service, announce};
use crate::network::Network;
use crate::post::Outcome;
use crate::state::State;

const COLLECTOR: &str = "com.lantharos.CrashCollector1";
const COLLECTOR_PATH: &str = "/com/lantharos/CrashCollector1";
const IDLE: Duration = Duration::from_secs(24 * 3600);

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs())
}

async fn take(
    collector: &Proxy<'_>,
    service: &Service,
    session: &Connection,
) -> anyhow::Result<()> {
    let taken: Vec<String> = collector.call("Take", &()).await?;
    if config::inbox().is_none() {
        return Ok(());
    }
    let image = &service.image;
    let crashes: Vec<Crash> = taken
        .iter()
        .filter_map(|crash| serde_json::from_str::<Crash>(crash).ok())
        .map(|mut crash| {
            crash.report.image.clone_from(&image.version);
            crash.report.channel.clone_from(&image.channel);
            crash
        })
        .collect();
    service.state().take(crashes, &image.version, now());
    service.wake.notify_one();
    announce(session).await?;
    Ok(())
}

async fn follow_collector(
    system: Connection,
    service: Arc<Service>,
    session: Connection,
) -> anyhow::Result<()> {
    let collector = Proxy::new(&system, COLLECTOR, COLLECTOR_PATH, COLLECTOR).await?;
    let mut collected = collector.receive_signal("Collected").await?;
    loop {
        if let Err(error) = take(&collector, &service, &session).await {
            eprintln!("Couldn't take crash reports: {error:#}");
        }
        if collected.next().await.is_none() {
            return Ok(());
        }
    }
}

/// Sends what is queued, oldest first, and says how long to wait before
/// trying again when Pult or the network asked for a pause.
async fn send_queued(
    service: &Service,
    network: &Network,
    session: &Connection,
) -> Option<Duration> {
    let inbox = config::inbox()?;
    if !network.allows_sending().await {
        return None;
    }
    let image = &service.image.version;
    loop {
        let (signature, body) = {
            let state = service.state();
            if state.is_blocked(image) {
                return None;
            }
            let crash = state.queue().first()?;
            (
                crash.report.signature.clone(),
                serde_json::to_vec(&state.body(crash)).expect("a report always serializes"),
            )
        };
        let inbox = inbox.clone();
        let outcome = tokio::task::spawn_blocking(move || post::send(&inbox, &body))
            .await
            .ok()?;
        match outcome {
            Outcome::Taken => service.state().sent(&signature),
            Outcome::Refused => service.state().drop_queued(&signature),
            Outcome::Closed => {
                service.state().block(image);
                return None;
            }
            Outcome::Limited(wait) | Outcome::Unreachable(wait) => return Some(wait),
        }
        let _ = announce(session).await;
    }
}

async fn send(service: Arc<Service>, mut network: Network, session: Connection) {
    loop {
        let wait = send_queued(&service, &network, &session)
            .await
            .unwrap_or(IDLE);
        tokio::select! {
            () = service.wake.notified() => {}
            () = network.changed() => {}
            () = tokio::time::sleep(wait) => {}
        }
    }
}

async fn serve() -> anyhow::Result<()> {
    let folder = dirs::state_dir().context("there's no state folder")?;
    let session = Connection::session().await?;
    let system = Connection::system().await?;
    let service = Arc::new(Service::new(
        State::open(&folder),
        image::running(&system).await,
    ));
    session
        .object_server()
        .at(
            PATH,
            Reports {
                service: service.clone(),
            },
        )
        .await?;
    session.request_name(NAME).await?;
    let network = Network::watch(&system).await?;
    tokio::spawn(follow_collector(system, service.clone(), session.clone()));
    tokio::spawn(send(service, network, session));
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
    }
    Ok(())
}

fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(serve())
}
