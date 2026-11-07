mod files;

use std::collections::HashMap;
use std::io;
use std::net::IpAddr;
use std::path::PathBuf;
use std::sync::atomic::AtomicU64;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use files::Outgoing;
use futures_util::{StreamExt, TryStreamExt, stream};
use hyper::{Method, StatusCode};
use tokio::sync::{oneshot, watch};

use crate::app::{App, random_id};
use crate::client::{self, Connection, Target};
use crate::discovery::Device;
use crate::link::{Direction, Event, Outcome, Stage};
use crate::progress::Transfer;
use crate::protocol::{PrepareUpload, Prepared, Scheme};

const REACH_WITHIN: Duration = Duration::from_secs(5);
const FILES_AT_ONCE: usize = 3;

pub enum What {
    Files(Vec<PathBuf>),
    Text(String),
}

/// What's being sent right now, by id.
#[derive(Default)]
pub struct Outbox {
    sends: Mutex<HashMap<String, Arc<Sending>>>,
}

struct Sending {
    stop: watch::Sender<Option<Outcome>>,
    pin: Mutex<Option<oneshot::Sender<String>>>,
    receiver: Mutex<Option<(IpAddr, String)>>,
}

impl Outbox {
    /// Starts sending to the device `device`, and returns the transfer's id, or nothing when that device is gone.
    pub fn send(&self, app: &Arc<App>, device: &str, what: What) -> Option<String> {
        let device = app.devices.get(device)?;
        let id = random_id();
        let sending = Arc::new(Sending { stop: watch::Sender::new(None), pin: Mutex::default(), receiver: Mutex::default() });
        self.sends.lock().unwrap().insert(id.clone(), sending.clone());
        let (app, transfer_id) = (app.clone(), id.clone());
        tokio::spawn(async move {
            let alias = device.peer.alias.clone();
            let outcome = run(&app, &transfer_id, &sending, &device, what).await;
            app.outbox.sends.lock().unwrap().remove(&transfer_id);
            app.link.send(Event::Finished { id: transfer_id, direction: Direction::Out, device: alias, outcome, saved: Vec::new() });
        });
        Some(id)
    }

    pub fn cancel(&self, id: &str) {
        if let Some(sending) = self.sends.lock().unwrap().get(id) {
            sending.stop.send_replace(Some(Outcome::Cancelled));
        }
    }

    pub fn pin(&self, id: &str, pin: String) {
        let waiting = self.sends.lock().unwrap().get(id).and_then(|sending| sending.pin.lock().unwrap().take());
        if let Some(waiting) = waiting {
            let _ = waiting.send(pin);
        }
    }

    /// The device at `from` stopped receiving `session`.
    pub fn cancel_from(&self, from: IpAddr, session: &str) {
        for sending in self.sends.lock().unwrap().values() {
            if sending.receiver.lock().unwrap().as_ref().is_some_and(|(ip, id)| *ip == from && id == session) {
                sending.stop.send_replace(Some(Outcome::CancelledThere));
            }
        }
    }
}

async fn run(app: &App, id: &str, sending: &Sending, device: &Device, what: What) -> Outcome {
    let files = match what {
        What::Files(paths) => match tokio::task::spawn_blocking(move || files::collect(&paths)).await {
            Ok(Ok(files)) if !files.is_empty() => files,
            _ => return Outcome::Failed,
        },
        What::Text(text) => vec![files::text(text)],
    };
    let transfer = Transfer {
        id: id.to_owned(),
        direction: Direction::Out,
        device: device.peer.alias.clone(),
        size: files.iter().map(|file| file.dto.size).sum(),
        files: files.len(),
        done: Arc::new(AtomicU64::new(0)),
    };
    let target = Target {
        address: device.address,
        scheme: device.scheme,
        fingerprint: (device.scheme == Scheme::Https).then_some(device.peer.id.as_str()),
    };
    let mut stop = sending.stop.subscribe();
    let prepared = tokio::select! {
        prepared = prepare(app, sending, &transfer, &target, &files) => prepared,
        outcome = stopped(&mut stop) => return outcome,
    };
    let prepared = match prepared {
        Ok(Some(prepared)) => prepared,
        Ok(None) => return Outcome::Done,
        Err(outcome) => return outcome,
    };
    *sending.receiver.lock().unwrap() = Some((device.address.ip(), prepared.session_id.clone()));
    transfer.tell(&app.link, Stage::Moving);
    let (_moving, never_stopped) = watch::channel(false);
    tokio::select! {
        uploaded = upload_all(app, &transfer, &target, &files, &prepared) => match uploaded {
            Ok(()) => Outcome::Done,
            Err(_) => Outcome::Failed,
        },
        _ = transfer.follow(&app.link, never_stopped) => Outcome::Failed,
        outcome = stopped(&mut stop) => {
            if outcome == Outcome::Cancelled {
                tell_receiver(app, &target, &prepared.session_id).await;
            }
            outcome
        }
    }
}

async fn stopped(stop: &mut watch::Receiver<Option<Outcome>>) -> Outcome {
    stop.wait_for(Option::is_some).await.ok().and_then(|outcome| *outcome).unwrap_or(Outcome::Cancelled)
}

/// Offers the files, asking for the receiver's PIN as often as it wants one. `None` means it needs nothing more,
/// as with text.
async fn prepare(app: &App, sending: &Sending, transfer: &Transfer, target: &Target<'_>, files: &[Outgoing]) -> Result<Option<Prepared>, Outcome> {
    let offer = PrepareUpload {
        info: app.presence(None),
        files: files.iter().map(|file| (file.dto.id.clone(), file.dto.clone())).collect(),
    };
    transfer.tell(&app.link, Stage::Waiting);
    let mut pin: Option<String> = None;
    loop {
        let mut connection = client::connect(&app.identity, target, REACH_WITHIN).await.map_err(|_| Outcome::Unreachable)?;
        let route = match &pin {
            Some(pin) => format!("prepare-upload?{}", query(&[("pin", pin)])),
            None => "prepare-upload".into(),
        };
        let response = connection.post_json(&route, &offer).await.map_err(|_| Outcome::Failed)?;
        match response.status() {
            StatusCode::OK => return client::json(response).await.map(Some).map_err(|_| Outcome::Failed),
            StatusCode::NO_CONTENT => return Ok(None),
            StatusCode::UNAUTHORIZED => {
                transfer.tell(&app.link, if pin.is_some() { Stage::WrongPin } else { Stage::Pin });
                let (answer, answered) = oneshot::channel();
                *sending.pin.lock().unwrap() = Some(answer);
                pin = Some(answered.await.map_err(|_| Outcome::Cancelled)?);
                transfer.tell(&app.link, Stage::Waiting);
            }
            StatusCode::FORBIDDEN => return Err(Outcome::Declined),
            StatusCode::CONFLICT => return Err(Outcome::Busy),
            _ => return Err(Outcome::Failed),
        }
    }
}

async fn upload_all(app: &App, transfer: &Transfer, target: &Target<'_>, files: &[Outgoing], prepared: &Prepared) -> io::Result<()> {
    let uploads: Vec<_> = files
        .iter()
        .filter_map(|file| Some(upload(app, transfer, target, file, &prepared.session_id, prepared.files.get(&file.dto.id)?)))
        .collect();
    stream::iter(uploads)
        .buffer_unordered(FILES_AT_ONCE)
        .try_collect()
        .await
}

async fn upload(app: &App, transfer: &Transfer, target: &Target<'_>, file: &Outgoing, session: &str, token: &str) -> io::Result<()> {
    let mut connection: Connection = client::connect(&app.identity, target, REACH_WITHIN).await?;
    let route = format!("upload?{}", query(&[("sessionId", session), ("fileId", &file.dto.id), ("token", token)]));
    let body = files::body(&file.source, transfer.done.clone());
    let response = connection.send(Method::POST, &route, body, Some(file.dto.size)).await?;
    match response.status() {
        StatusCode::OK => Ok(()),
        status => Err(client::failed(status)),
    }
}

async fn tell_receiver(app: &App, target: &Target<'_>, session: &str) {
    if let Ok(mut connection) = client::connect(&app.identity, target, REACH_WITHIN).await {
        let _ = connection.send(Method::POST, &format!("cancel?{}", query(&[("sessionId", session)])), client::empty(), None).await;
    }
}

fn query(pairs: &[(&str, &str)]) -> String {
    url::form_urlencoded::Serializer::new(String::new()).extend_pairs(pairs).finish()
}
