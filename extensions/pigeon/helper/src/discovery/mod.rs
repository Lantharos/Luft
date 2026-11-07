mod devices;
mod interfaces;
mod multicast;

use std::io;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};

pub use devices::{Device, Devices};
use futures_util::StreamExt;
use futures_util::stream;
use hyper::{Method, StatusCode};
use multicast::Multicast;
use tokio::time::{interval, sleep};

use crate::app::App;
use crate::client::{self, Target};
use crate::link::Event;
use crate::protocol::{Info, PORT, Presence, Scheme};

/// Announcements go out three times, since a single datagram is easily lost.
const ANNOUNCE_AFTER: [Duration; 3] = [Duration::from_millis(100), Duration::from_millis(500), Duration::from_millis(2000)];
const ANSWERS_WITHIN: Duration = Duration::from_secs(3);
const CONNECTIONS_CHECKED_EVERY: Duration = Duration::from_secs(10);
const REACH_WITHIN: Duration = Duration::from_secs(2);
const SCAN_AT_ONCE: usize = 64;

/// Finds devices: by multicast, and by asking every address nearby when multicast finds nothing.
pub async fn run(app: Arc<App>) {
    let multicast = match Multicast::bind() {
        Ok(multicast) => Some(Arc::new(multicast)),
        Err(error) => {
            eprintln!("pigeon: can't listen for announcements: {error}");
            None
        }
    };
    if let Some(multicast) = &multicast {
        multicast.join_new();
        tokio::spawn(hear(app.clone(), multicast.clone()));
    }
    let mut connections = interval(CONNECTIONS_CHECKED_EVERY);
    let mut scanned = false;
    loop {
        tokio::select! {
            () = app.scans.notified() => scan(&app, multicast.as_deref()).await,
            _ = connections.tick() => {
                let joined = multicast.as_ref().is_some_and(|multicast| multicast.join_new());
                if joined || !scanned {
                    scanned = true;
                    scan(&app, multicast.as_deref()).await;
                }
            }
        }
    }
}

/// Asks every device to answer, then forgets the ones that didn't.
async fn scan(app: &App, multicast: Option<&Multicast>) {
    let since = Instant::now();
    app.link.send(Event::Scanning { scanning: true });
    let message = serde_json::to_vec(&app.presence(Some(true))).expect("presence serializes");
    let announce = async {
        if let Some(multicast) = multicast {
            for delay in ANNOUNCE_AFTER {
                sleep(delay).await;
                multicast.send(&message).await;
            }
        }
    };
    let ask_around = async {
        sleep(ANSWERS_WITHIN).await;
        if app.devices.is_empty_since(since) {
            ask_neighbours(app).await;
        }
    };
    tokio::join!(announce, ask_around);
    app.devices.forget_older(since);
    app.link.send(Event::Scanning { scanning: false });
}

async fn hear(app: Arc<App>, multicast: Arc<Multicast>) {
    let mut buffer = vec![0u8; 65536];
    loop {
        let Ok((length, source)) = multicast.receive(&mut buffer).await else {
            continue;
        };
        let Ok(presence) = serde_json::from_slice::<Presence>(&buffer[..length]) else {
            continue;
        };
        if presence.info.fingerprint == app.identity.fingerprint {
            continue;
        }
        tokio::spawn(answer(app.clone(), multicast.clone(), presence, source));
    }
}

/// Answers an announcement the way the protocol asks: by registering over HTTP, or over multicast when that fails.
/// While receiving is off, this computer only looks the device up, so it doesn't show up there.
async fn answer(app: Arc<App>, multicast: Arc<Multicast>, presence: Presence, source: SocketAddr) {
    let address = SocketAddr::new(source.ip(), presence.port);
    let expected = (presence.protocol == Scheme::Https).then_some(presence.info.fingerprint.as_str());
    match reach(&app, address, presence.protocol, expected).await {
        Ok(device) => app.devices.heard(device),
        Err(_) if presence.announce != Some(false) && app.receiving() => {
            let reply = serde_json::to_vec(&app.presence(Some(false))).expect("presence serializes");
            multicast.send(&reply).await;
        }
        Err(_) => {}
    }
}

/// Connects to the server at `address` and learns who's there.
pub async fn reach(app: &App, address: SocketAddr, scheme: Scheme, expected: Option<&str>) -> io::Result<Device> {
    let target = Target { address, scheme, fingerprint: expected };
    let mut connection = client::connect(&app.identity, &target, REACH_WITHIN).await?;
    let response = if app.receiving() {
        connection.post_json("register", &app.presence(None)).await?
    } else {
        connection.send(Method::GET, "info", client::empty(), None).await?
    };
    if response.status() != StatusCode::OK {
        return Err(client::failed(response.status()));
    }
    let info: Info = client::json(response).await?;
    let fingerprint = connection.fingerprint.unwrap_or_else(|| info.fingerprint.clone());
    if fingerprint == app.identity.fingerprint {
        return Err(io::Error::other("that's this computer"));
    }
    let presence = Presence { info, port: address.port(), protocol: scheme, announce: None };
    Ok(Device::new(&presence, fingerprint, address, scheme == Scheme::Https))
}

async fn ask_neighbours(app: &App) {
    let addresses = interfaces::addresses().into_iter().flat_map(interfaces::neighbours);
    stream::iter(addresses)
        .map(|address| reach(app, SocketAddr::new(address.into(), PORT), Scheme::Https, None))
        .buffer_unordered(SCAN_AT_ONCE)
        .for_each(|reached| async {
            if let Ok(device) = reached {
                app.devices.heard(device);
            }
        })
        .await;
}
