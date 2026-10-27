use std::sync::{Arc, Mutex};
use std::time::Duration;

use futures_util::StreamExt;
use tokio::task::AbortHandle;
use zbus::OwnedObjectPath;
use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};

use super::Session;
use crate::system::{self, Power};

const FAREWELL: Duration = Duration::from_millis(250);
const CONFIRM_SECONDS: u32 = 60;

#[derive(Clone, Copy)]
pub enum Action {
    Logout,
    Shutdown,
    Reboot,
}

impl Action {
    fn dialog_type(self) -> u32 {
        match self {
            Self::Logout => 0,
            Self::Shutdown => 1,
            Self::Reboot => 2,
        }
    }

    fn confirmed_by(signal: &str) -> Option<Self> {
        match signal {
            "ConfirmedLogout" => Some(Self::Logout),
            "ConfirmedShutdown" => Some(Self::Shutdown),
            "ConfirmedReboot" => Some(Self::Reboot),
            _ => None,
        }
    }
}

#[proxy(
    interface = "org.gnome.SessionManager.EndSessionDialog",
    default_service = "org.gnome.Shell",
    default_path = "/org/gnome/SessionManager/EndSessionDialog"
)]
trait Dialog {
    fn open(
        &self,
        kind: u32,
        timestamp: u32,
        seconds_to_stay_open: u32,
        inhibitors: &[OwnedObjectPath],
    ) -> zbus::Result<()>;
}

/// Kestrel's confirmation for ending the session, while one is open.
#[derive(Default)]
pub struct Confirmation(Mutex<Option<AbortHandle>>);

impl Confirmation {
    fn replace(&self, waiting: Option<AbortHandle>) {
        if let Some(previous) = std::mem::replace(&mut *self.0.lock().unwrap(), waiting) {
            previous.abort();
        }
    }
}

async fn confirmed(
    connection: &Connection,
    action: Action,
    inhibitors: &[OwnedObjectPath],
) -> zbus::Result<Option<Action>> {
    let dialog = DialogProxy::builder(connection)
        .cache_properties(CacheProperties::No)
        .build()
        .await?;
    let mut answers = dialog.inner().receive_all_signals().await?;
    dialog
        .open(action.dialog_type(), 0, CONFIRM_SECONDS, inhibitors)
        .await?;
    while let Some(answer) = answers.next().await {
        let header = answer.header();
        let Some(member) = header.member() else {
            continue;
        };
        if member.as_str() != "Closed" {
            return Ok(Action::confirmed_by(member.as_str()));
        }
    }
    Ok(None)
}

impl Session {
    /// Asks you in Kestrel before ending the session, listing what holds it up.
    pub fn confirm(self: &Arc<Self>, action: Action, inhibitors: Vec<OwnedObjectPath>) {
        let session = Arc::clone(self);
        let waiting = tokio::spawn(async move {
            match confirmed(&session.connection, action, &inhibitors).await {
                Ok(Some(action)) => {
                    drop(tokio::spawn(
                        async move { session.finish(action, true).await },
                    ))
                }
                Ok(None) => {}
                Err(error) => eprintln!("Could not ask to end the session: {error}"),
            }
        });
        self.confirmation.replace(Some(waiting.abort_handle()));
    }

    /// Ends the session, after asking registered apps when `ask_clients`.
    pub async fn finish(&self, action: Action, ask_clients: bool) {
        if ask_clients {
            self.clients.end().await;
        }
        self.emit_over().await;
        tokio::time::sleep(FAREWELL).await;
        let ended = match action {
            Action::Logout => system::stop_session(&self.connection).await,
            Action::Shutdown => system::perform(&self.system, Power::Off).await,
            Action::Reboot => system::perform(&self.system, Power::Reboot).await,
        };
        if let Err(error) = ended {
            eprintln!("Could not end the session: {error}");
            self.emit_running().await;
        }
    }
}
