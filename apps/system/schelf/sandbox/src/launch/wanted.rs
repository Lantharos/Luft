use std::collections::HashMap;
use std::os::fd::{AsFd, OwnedFd};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

use luft_software::apps::places::Drive;
use tokio::sync::watch;
use zbus::Connection;

use crate::drives::{Asked, Turn, ask, due, offer_restart};
use crate::escalate::Asking;
use crate::request::Request;

/// Asks you, once for each drive, whether the app may use a drive it looked
/// inside, and offers to restart it once it may.
pub struct Wanted {
    app: Asking,
    process: Option<Arc<OwnedFd>>,
    server: PathBuf,
    turns: Arc<Mutex<HashMap<String, Turn>>>,
    restart: Arc<AtomicBool>,
    closed: watch::Sender<bool>,
    asking: Mutex<Vec<JoinHandle<()>>>,
}

impl Wanted {
    pub fn new(app: Asking, process: Option<OwnedFd>, server: PathBuf) -> Self {
        Self {
            app,
            process: process.map(Arc::new),
            server,
            turns: Arc::default(),
            restart: Arc::default(),
            closed: watch::Sender::new(false),
            asking: Mutex::default(),
        }
    }

    pub fn ask(&self, drive: Drive) {
        let Some(process) = self.process.clone() else {
            return;
        };
        {
            let mut turns = self.turns.lock().unwrap();
            if !due(turns.get(&drive.uuid)) {
                return;
            }
            turns.insert(drive.uuid.clone(), Turn::Asking);
        }
        let (app, turns, restart, server, mut closed) = (
            self.app.clone(),
            self.turns.clone(),
            self.restart.clone(),
            self.server.clone(),
            self.closed.subscribe(),
        );
        let asking = std::thread::spawn(move || {
            let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
            else {
                return;
            };
            let asked = runtime.block_on(async {
                let connection = Connection::session().await.ok()?;
                let mut ending = closed.clone();
                let asked = tokio::select! {
                    asked = ask(&connection, &app.id, process.as_fd(), &drive) => asked,
                    _ = ending.wait_for(|closed| *closed) => return None,
                };
                let gone = async move {
                    let _ = closed.wait_for(|closed| *closed).await;
                };
                if asked == Asked::Allowed && offer_restart(&connection, &app, &drive, gone).await {
                    restart.store(true, Ordering::Relaxed);
                    let _ =
                        UnixStream::connect(&server).and_then(|stream| Request::Quit.send(stream));
                }
                Some(asked)
            });
            turns.lock().unwrap().insert(drive.uuid, Turn::after(asked));
        });
        self.asking.lock().unwrap().push(asking);
    }

    /// Whether you asked for the app to open again once it has closed. Any
    /// offer to restart it still showing goes away.
    pub fn ended(self) -> bool {
        self.closed.send_replace(true);
        for asking in self.asking.into_inner().unwrap() {
            let _ = asking.join();
        }
        self.restart.load(Ordering::Relaxed)
    }
}
