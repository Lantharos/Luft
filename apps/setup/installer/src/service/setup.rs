use std::os::fd::AsFd;
use std::path::Path;
use std::sync::Arc;

use futures_util::StreamExt;
use luft_dbus::idle::Idle;
use tokio::sync::Notify;
use tokio::task::JoinHandle;
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::names::BusName;
use zbus::object_server::SignalEmitter;

use super::error::Error;
use super::interface::Installer;
use crate::first_boot::caller;
use crate::first_boot::fingerprint::Enrolling;
use crate::first_boot::window;
use crate::phase;

pub struct Enrollment {
    stop: Arc<Notify>,
    task: JoinHandle<()>,
}

impl Enrollment {
    pub async fn end(self) {
        self.stop.notify_one();
        let _ = self.task.await;
    }
}

pub async fn setup_app_user(
    connection: &Connection,
    header: &Header<'_>,
    state_dir: &Path,
    setup_app: &Path,
    uid_of: impl FnOnce(&str) -> Option<u32>,
) -> Result<String, Error> {
    let user = phase::pending_user(state_dir)
        .filter(|_| window::is_open(state_dir))
        .ok_or_else(Error::not_authorized)?;
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    let credentials = DBusProxy::new(connection)
        .await?
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await?;
    let from_user =
        credentials.unix_user_id().is_some() && credentials.unix_user_id() == uid_of(&user);
    let from_setup = credentials
        .process_fd()
        .is_some_and(|pidfd| caller::runs(pidfd.as_fd(), setup_app));
    if from_user && from_setup {
        Ok(user)
    } else {
        Err(Error::not_authorized())
    }
}

pub async fn follow(
    connection: &Connection,
    header: &Header<'_>,
    enrolling: Enrolling,
    emitter: SignalEmitter<'static>,
    idle: Arc<Idle>,
) -> Result<Enrollment, Error> {
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    let gone = DBusProxy::new(connection)
        .await?
        .receive_name_owner_changed_with_args(&[(0, sender.as_str())])
        .await?;
    let stop = Arc::new(Notify::new());
    let task = tokio::spawn(relay(enrolling, gone, stop.clone(), emitter, idle));
    Ok(Enrollment { stop, task })
}

async fn relay(
    mut enrolling: Enrolling,
    mut gone: impl futures_util::Stream + Unpin,
    stop: Arc<Notify>,
    emitter: SignalEmitter<'static>,
    idle: Arc<Idle>,
) {
    let _activity = idle.hold();
    loop {
        tokio::select! {
            () = stop.notified() => break,
            _ = gone.next() => break,
            status = enrolling.statuses.next() => {
                let Some(status) = status else { break };
                let Ok((result, done)) = status.body().deserialize::<(String, bool)>() else {
                    continue;
                };
                let _ = Installer::fingerprint_status(&emitter, &result, done).await;
                if done {
                    break;
                }
            }
        }
    }
    enrolling.stop().await;
}
