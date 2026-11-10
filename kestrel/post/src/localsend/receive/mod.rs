mod save;

use std::collections::HashMap;
use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;
use std::sync::atomic::AtomicU64;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use hyper::body::Incoming;
use hyper::{Method, Request, StatusCode};
use save::Failure;
use tokio::sync::{oneshot, watch};

use crate::app::{App, random_id};
use crate::localsend::client::{self, Target};
use crate::events::{Direction, Event, Offered as OfferedFile, Outcome, Peer, Stage};
use crate::progress::Transfer;
use crate::localsend::protocol::{FileDto, PrepareUpload, Prepared, Presence, Scheme};
use crate::localsend::server::{self, Answer, Caller};

const PIN_ATTEMPTS: u32 = 3;
const TELL_SENDER_WITHIN: Duration = Duration::from_secs(5);

#[derive(Default)]
pub struct Inbox {
    slot: Mutex<Option<Session>>,
    pin_attempts: Mutex<HashMap<IpAddr, u32>>,
}

enum Session {
    Offered { id: String, from: IpAddr, decide: oneshot::Sender<Decision> },
    Active(Arc<Active>),
}

enum Decision {
    Accept,
    Decline,
    Withdrawn,
}

struct Active {
    transfer: Transfer,
    from: IpAddr,
    sender: Target<'static>,
    sender_fingerprint: Option<String>,
    folder: PathBuf,
    files: Mutex<HashMap<String, Entry>>,
    stop: watch::Sender<bool>,
    saved: Mutex<Vec<PathBuf>>,
}

struct Entry {
    file: FileDto,
    token: String,
    state: State,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum State {
    Waiting,
    Moving,
    Saved,
    Failed,
}

pub async fn prepare(app: &Arc<App>, caller: &Caller, query: &HashMap<String, String>, request: Request<Incoming>) -> Answer {
    let Ok(PrepareUpload { info, files }) = server::read::<PrepareUpload>(request).await else {
        return server::status(StatusCode::BAD_REQUEST);
    };
    if files.is_empty() {
        return server::status(StatusCode::BAD_REQUEST);
    }
    let from = sender(caller, &info);
    let known = from.verified && app.trusts(&from.id);
    let paired = match app.inbox.check_pin(app, caller.address.ip(), known, query.get("pin")) {
        Ok(paired) => paired && from.verified,
        Err(refused) => return server::status(refused),
    };
    if paired {
        app.stop_pairing();
        app.link.send(Event::Paired { device: from.clone() });
    }
    let trusted = known || paired;
    if let Some(text) = FileDto::message(&files) {
        app.link.send(Event::Text { from, text: text.to_owned(), trusted });
        return server::status(StatusCode::NO_CONTENT);
    }
    let id = random_id();
    let (decide, decision) = oneshot::channel();
    {
        let mut slot = app.inbox.slot.lock().unwrap();
        if slot.is_some() {
            return server::status(StatusCode::CONFLICT);
        }
        *slot = Some(Session::Offered { id: id.clone(), from: caller.address.ip(), decide });
    }
    let waiting = WithdrawOnHangUp { app, id: &id, armed: true };
    let size = files.values().map(|file| file.size).sum();
    if trusted {
        app.inbox.decide(&id, Decision::Accept);
    } else {
        let mut offered: Vec<OfferedFile> = files.values().map(|file| OfferedFile { name: file.file_name.clone(), size: file.size, kind: file.file_type.clone() }).collect();
        offered.sort_by(|a, b| a.name.cmp(&b.name));
        app.link.send(Event::Offer { id: id.clone(), from: from.clone(), files: offered, size });
    }
    let decision = decision.await.unwrap_or(Decision::Withdrawn);
    waiting.disarm();
    match decision {
        Decision::Accept => accept(app, caller, &info, from, id, files, size),
        Decision::Decline | Decision::Withdrawn => server::status(StatusCode::FORBIDDEN),
    }
}

fn sender(caller: &Caller, info: &Presence) -> Peer {
    Peer {
        id: caller.fingerprint.clone().unwrap_or_else(|| info.info.fingerprint.to_ascii_uppercase()),
        alias: info.info.alias.clone(),
        kind: info.info.device_type.clone().unwrap_or_else(|| "desktop".into()),
        model: info.info.device_model.clone().unwrap_or_default(),
        verified: caller.fingerprint.is_some(),
    }
}

fn accept(app: &Arc<App>, caller: &Caller, info: &Presence, from: Peer, id: String, files: HashMap<String, FileDto>, size: u64) -> Answer {
    let tokens: HashMap<String, String> = files.keys().map(|file| (file.clone(), random_id())).collect();
    let entries = files
        .into_iter()
        .map(|(key, file)| {
            let token = tokens[&key].clone();
            (key, Entry { file, token, state: State::Waiting })
        })
        .collect::<HashMap<_, _>>();
    let active = Arc::new(Active {
        transfer: Transfer {
            id: id.clone(),
            direction: Direction::In,
            device: from.alias,
            size,
            files: entries.len(),
            done: Arc::new(AtomicU64::new(0)),
        },
        from: caller.address.ip(),
        sender: Target { address: SocketAddr::new(caller.address.ip(), info.port), scheme: info.protocol, fingerprint: None },
        sender_fingerprint: (info.protocol == Scheme::Https).then_some(from.id),
        folder: app.config.borrow().folder(),
        files: Mutex::new(entries),
        stop: watch::Sender::new(false),
        saved: Mutex::default(),
    });
    *app.inbox.slot.lock().unwrap() = Some(Session::Active(active.clone()));
    active.transfer.tell(&app.link, Stage::Moving);
    let (watcher, app_for_watcher) = (active.clone(), app.clone());
    tokio::spawn(async move {
        if !watcher.transfer.report_until_stopped_or_stalled(&app_for_watcher.link, watcher.stop.subscribe()).await {
            app_for_watcher.inbox.end_once(&app_for_watcher, &watcher, Outcome::Failed);
        }
    });
    server::json(&Prepared { session_id: id, files: tokens })
}

pub async fn upload(app: &Arc<App>, caller: &Caller, query: &HashMap<String, String>, request: Request<Incoming>) -> Answer {
    let (Some(session), Some(file), Some(token)) = (query.get("sessionId"), query.get("fileId"), query.get("token")) else {
        return server::status(StatusCode::BAD_REQUEST);
    };
    let Some((active, dto)) = app.inbox.start_file(caller.address.ip(), session, file, token) else {
        return server::status(StatusCode::FORBIDDEN);
    };
    let saved = save::save(&active.folder, &dto, request.into_body(), &active.transfer.done, active.stop.subscribe()).await;
    let answer = match &saved {
        Ok(_) => StatusCode::OK,
        Err(Failure::Checksum) => StatusCode::UNPROCESSABLE_ENTITY,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    };
    let state = if saved.is_ok() { State::Saved } else { State::Failed };
    if let Ok(path) = saved {
        active.saved.lock().unwrap().push(path);
    }
    let finished = {
        let mut files = active.files.lock().unwrap();
        files.get_mut(file).expect("the file was offered").state = state;
        files.values().all(|entry| matches!(entry.state, State::Saved | State::Failed))
            .then(|| files.values().all(|entry| entry.state == State::Saved))
    };
    match finished {
        Some(true) => app.inbox.end_once(app, &active, Outcome::Done),
        Some(false) => app.inbox.end_once(app, &active, Outcome::Failed),
        None => {}
    }
    server::status(answer)
}

struct WithdrawOnHangUp<'a> {
    app: &'a App,
    id: &'a str,
    armed: bool,
}

impl WithdrawOnHangUp<'_> {
    fn disarm(mut self) {
        self.armed = false;
    }
}

impl Drop for WithdrawOnHangUp<'_> {
    fn drop(&mut self) {
        if self.armed && self.app.inbox.decide(self.id, Decision::Withdrawn) {
            withdrawn(self.app, self.id);
        }
    }
}

fn withdrawn(app: &App, id: &str) {
    app.link.send(Event::Finished {
        id: id.to_owned(),
        direction: Direction::In,
        device: String::new(),
        outcome: Outcome::CancelledThere,
        saved: Vec::new(),
    });
}

impl Inbox {
    pub fn forget_attempts(&self) {
        self.pin_attempts.lock().unwrap().clear();
    }

    fn check_pin(&self, app: &App, from: IpAddr, known: bool, given: Option<&String>) -> Result<bool, StatusCode> {
        let Some(pin) = app.pairing_pin().filter(|_| !known) else {
            return Ok(false);
        };
        let mut attempts = self.pin_attempts.lock().unwrap();
        let tried = attempts.entry(from).or_default();
        if *tried >= PIN_ATTEMPTS {
            return Err(StatusCode::TOO_MANY_REQUESTS);
        }
        match given {
            Some(given) if *given == pin => {
                attempts.remove(&from);
                Ok(true)
            }
            Some(_) => {
                *tried += 1;
                Err(StatusCode::UNAUTHORIZED)
            }
            None => Err(StatusCode::UNAUTHORIZED),
        }
    }

    fn decide(&self, id: &str, decision: Decision) -> bool {
        let mut slot = self.slot.lock().unwrap();
        if !matches!(&*slot, Some(Session::Offered { id: offered, .. }) if offered == id) {
            return false;
        }
        let Some(Session::Offered { decide, .. }) = slot.take() else { unreachable!() };
        let _ = decide.send(decision);
        true
    }

    pub fn accept(&self, id: &str) {
        self.decide(id, Decision::Accept);
    }

    pub fn decline(&self, id: &str) {
        self.decide(id, Decision::Decline);
    }

    pub fn cancel(&self, app: &Arc<App>, id: &str) {
        if self.decide(id, Decision::Decline) {
            return;
        }
        let Some(active) = self.active(id, None) else { return };
        self.end_once(app, &active, Outcome::Cancelled);
        let app = app.clone();
        tokio::spawn(async move {
            let target = Target { fingerprint: active.sender_fingerprint.as_deref(), ..active.sender.clone() };
            if let Ok(mut connection) = client::connect(&app.identity, &target, TELL_SENDER_WITHIN).await {
                let _ = connection.send(Method::POST, &format!("cancel?sessionId={}", active.transfer.id), client::empty(), None).await;
            }
        });
    }

    pub fn cancel_from(&self, app: &App, from: IpAddr, session: &str) -> bool {
        let offered = matches!(&*self.slot.lock().unwrap(), Some(Session::Offered { id, from: there, .. }) if id == session && *there == from);
        if offered && self.decide(session, Decision::Withdrawn) {
            withdrawn(app, session);
            return true;
        }
        let Some(active) = self.active(session, Some(from)) else { return false };
        self.end_once(app, &active, Outcome::CancelledThere);
        true
    }

    fn active(&self, id: &str, from: Option<IpAddr>) -> Option<Arc<Active>> {
        match &*self.slot.lock().unwrap() {
            Some(Session::Active(active)) if active.transfer.id == id && from.is_none_or(|from| from == active.from) => Some(active.clone()),
            _ => None,
        }
    }

    fn start_file(&self, from: IpAddr, session: &str, file: &str, token: &str) -> Option<(Arc<Active>, FileDto)> {
        let active = self.active(session, Some(from))?;
        let dto = {
            let mut files = active.files.lock().unwrap();
            let entry = files.get_mut(file).filter(|entry| entry.token == token && entry.state == State::Waiting)?;
            entry.state = State::Moving;
            entry.file.clone()
        };
        Some((active, dto))
    }

    fn end_once(&self, app: &App, active: &Arc<Active>, outcome: Outcome) {
        {
            let mut slot = self.slot.lock().unwrap();
            if !matches!(&*slot, Some(Session::Active(current)) if Arc::ptr_eq(current, active)) {
                return;
            }
            *slot = None;
        }
        active.stop.send_replace(true);
        app.link.send(Event::Finished {
            id: active.transfer.id.clone(),
            direction: Direction::In,
            device: active.transfer.device.clone(),
            outcome,
            saved: active.saved.lock().unwrap().clone(),
        });
    }
}
