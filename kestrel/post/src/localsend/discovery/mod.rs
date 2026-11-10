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
use tokio::sync::Semaphore;
use tokio::time::{interval, sleep};

use crate::app::App;
use crate::config::Visibility;
use crate::localsend::client::{self, Target};
use crate::events::Event;
use crate::localsend::protocol::{Info, PORT, Presence, Scheme};

const REPEAT_ANNOUNCEMENT_AFTER: [Duration; 3] = [Duration::from_millis(100), Duration::from_millis(500), Duration::from_millis(2000)];
const ANSWERS_WITHIN: Duration = Duration::from_secs(3);
const CONNECTIONS_CHECKED_EVERY: Duration = Duration::from_secs(10);
const SCANNED_EVERY: Duration = Duration::from_secs(300);
const REACH_WITHIN: Duration = Duration::from_secs(2);
const SCAN_AT_ONCE: usize = 64;
const ANSWERS_AT_ONCE: usize = 16;

pub async fn run(app: Arc<App>) {
    let multicast = match Multicast::bind() {
        Ok(multicast) => Some(Arc::new(multicast)),
        Err(error) => {
            eprintln!("kestrel-post: can't listen for announcements: {error}");
            None
        }
    };
    if let Some(multicast) = &multicast {
        tokio::spawn(hear(app.clone(), multicast.clone()));
    }
    let follow = || multicast.as_ref().is_some_and(|multicast| multicast.follow(&app.home_interfaces.borrow()));
    let mut home = app.home_interfaces.subscribe();
    let mut connections = interval(CONNECTIONS_CHECKED_EVERY);
    let mut every = interval(SCANNED_EVERY);
    loop {
        tokio::select! {
            () = app.scans.notified() => {}
            _ = every.tick() => {}
            Ok(()) = home.changed() => {
                follow();
            }
            _ = connections.tick() => {
                if !follow() {
                    continue;
                }
            }
        }
        scan(&app, multicast.as_deref()).await;
        every.reset();
    }
}

async fn scan(app: &App, multicast: Option<&Multicast>) {
    let since = Instant::now();
    app.link.send(Event::Scanning { scanning: true });
    if app.announces_to_everyone() {
        let message = serde_json::to_vec(&app.presence(Some(true))).expect("presence serializes");
        let announce = async {
            if let Some(multicast) = multicast {
                for delay in REPEAT_ANNOUNCEMENT_AFTER {
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
    } else {
        ask_neighbours(app).await;
    }
    app.devices.forget_older(since);
    app.link.send(Event::Scanning { scanning: false });
}

async fn hear(app: Arc<App>, multicast: Arc<Multicast>) {
    let mut buffer = vec![0u8; 65536];
    let answers = Arc::new(Semaphore::new(ANSWERS_AT_ONCE));
    loop {
        let Ok((length, source)) = multicast.receive(&mut buffer).await else {
            continue;
        };
        let Ok(presence) = serde_json::from_slice::<Presence>(&buffer[..length]) else {
            continue;
        };
        if presence.info.fingerprint == app.identity.fingerprint || app.visibility() == Visibility::NoOne {
            continue;
        }
        let Ok(answering) = answers.clone().try_acquire_owned() else {
            continue;
        };
        let (app, multicast) = (app.clone(), multicast.clone());
        tokio::spawn(async move {
            answer(app, multicast, presence, source).await;
            drop(answering);
        });
    }
}

async fn answer(app: Arc<App>, multicast: Arc<Multicast>, presence: Presence, source: SocketAddr) {
    let address = SocketAddr::new(source.ip(), presence.port);
    let expected = (presence.protocol == Scheme::Https).then_some(presence.info.fingerprint.as_str());
    match reach(&app, address, presence.protocol, expected).await {
        Ok(device) => app.devices.heard(device),
        Err(_) if presence.announce != Some(false) && app.announces_to_everyone() => {
            let reply = serde_json::to_vec(&app.presence(Some(false))).expect("presence serializes");
            multicast.send(&reply).await;
        }
        Err(_) => {}
    }
}

pub async fn reach(app: &App, address: SocketAddr, scheme: Scheme, expected: Option<&str>) -> io::Result<Device> {
    let target = Target { address, scheme, fingerprint: expected };
    let mut connection = client::connect(&app.identity, &target, REACH_WITHIN).await?;
    let response = if app.admits(connection.fingerprint.as_deref()) {
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
    let addresses = interfaces::multicast_addresses(&app.home_interfaces.borrow()).into_iter().flat_map(interfaces::same_subnet_addresses);
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
