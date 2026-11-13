use std::collections::HashMap;
use std::os::fd::{AsFd, OwnedFd};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use luft_i18n::t;
use luft_software::apps::places::Drive;
use zbus::Connection;

use crate::L10N;
use crate::drives::{Asked, Turn, ask, due};
use crate::escalate::{Asking, offer_action};
use crate::request::Request;

/// Asks you, once for each drive, whether the app may use a drive it looked
/// inside, and offers to restart it once it may.
pub struct Wanted {
    app: Asking,
    process: Option<Arc<OwnedFd>>,
    server: PathBuf,
    turns: Arc<Mutex<HashMap<String, Turn>>>,
    restart: Arc<AtomicBool>,
}

fn named(drive: &Drive, app: &str) -> String {
    if drive.label.is_empty() {
        t!(L10N, "sandbox-drive-given-unnamed", app = app)
    } else {
        t!(
            L10N,
            "sandbox-drive-given",
            app = app,
            drive = drive.label.as_str()
        )
    }
}

impl Wanted {
    pub fn new(app: Asking, process: Option<OwnedFd>, server: PathBuf) -> Self {
        Self {
            app,
            process: process.map(Arc::new),
            server,
            turns: Arc::default(),
            restart: Arc::default(),
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
        let (app, turns, restart, server) = (
            self.app.clone(),
            self.turns.clone(),
            self.restart.clone(),
            self.server.clone(),
        );
        std::thread::spawn(move || {
            let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
            else {
                return;
            };
            let asked = runtime.block_on(async {
                let connection = Connection::session().await.ok()?;
                let asked = ask(&connection, &app.id, process.as_fd(), &drive).await;
                if asked == Asked::Allowed {
                    let summary = named(&drive, &app.name);
                    let body = t!(L10N, "sandbox-drive-restart-body");
                    let action = t!(L10N, "sandbox-restart");
                    if offer_action(&connection, &app, &summary, &body, &action)
                        .await
                        .unwrap_or(false)
                    {
                        restart.store(true, Ordering::Relaxed);
                        let _ = UnixStream::connect(&server)
                            .and_then(|stream| Request::Quit.send(stream));
                    }
                }
                Some(asked)
            });
            turns.lock().unwrap().insert(drive.uuid, Turn::after(asked));
        });
    }

    /// Whether you asked for the app to open again once it has closed.
    pub fn restart(&self) -> bool {
        self.restart.load(Ordering::Relaxed)
    }
}
