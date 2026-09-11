use super::{NotificationItem, NotificationSnapshot, NotificationUpdates, NotificationUrgency};
use crate::services::notification_metadata::{
    action_pairs, clean_app_name, clean_icon_name, current_unix_time, strip_markup,
    urgency_from_hints,
};
use std::{
    collections::HashMap,
    sync::{
        Arc, Mutex,
        mpsc::{self, Receiver, Sender},
    },
    thread,
    time::{Duration, Instant},
};
use tracing::debug;
use zbus::{
    blocking::connection, fdo, interface, object_server::SignalEmitter, zvariant::OwnedValue,
};
const SERVICE: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const INTERFACE: &str = "org.freedesktop.Notifications";
const DEFAULT_TIMEOUT: Duration = Duration::from_secs(5);
const MAX_NOTIFICATIONS: usize = 256;

#[derive(Debug)]
pub(super) enum NotificationCommand {
    Changed,
    Stop,
    Close(u32),
    ClearAll,
    SetDoNotDisturb(bool),
    Invoke { id: u32, action_key: String },
}

#[derive(Debug)]
struct NotificationState {
    next_id: u32,
    do_not_disturb: bool,
    items: Vec<StoredNotification>,
    closed: Vec<(u32, u32)>,
}

#[derive(Debug, Clone)]
struct StoredNotification {
    item: NotificationItem,
    toast_until: Option<Instant>,
    toast_visible: bool,
    resident: bool,
    transient: bool,
    close_on_expiry: bool,
}

#[derive(Clone)]
struct NotificationShared {
    state: Arc<Mutex<NotificationState>>,
    changed: Sender<NotificationCommand>,
}

struct NotificationServer {
    shared: NotificationShared,
}

type Hints = HashMap<String, OwnedValue>;

struct NotificationRequest {
    app_name: String,
    replaces_id: u32,
    app_icon: String,
    summary: String,
    body: String,
    actions: Vec<String>,
    hints: Hints,
    expire_timeout: i32,
}

#[interface(name = "org.freedesktop.Notifications")]
impl NotificationServer {
    fn get_capabilities(&self) -> Vec<String> {
        ["actions", "body", "persistence"]
            .into_iter()
            .map(ToString::to_string)
            .collect()
    }

    fn get_server_information(&self) -> (String, String, String, String) {
        (
            "Luft".to_string(),
            "Luft".to_string(),
            env!("CARGO_PKG_VERSION").to_string(),
            "1.3".to_string(),
        )
    }

    #[allow(clippy::too_many_arguments)]
    fn notify(
        &self,
        app_name: String,
        replaces_id: u32,
        app_icon: String,
        summary: String,
        body: String,
        actions: Vec<String>,
        hints: Hints,
        expire_timeout: i32,
    ) -> u32 {
        self.shared.upsert(NotificationRequest {
            app_name,
            replaces_id,
            app_icon,
            summary,
            body,
            actions,
            hints,
            expire_timeout,
        })
    }

    async fn close_notification(
        &self,
        id: u32,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        if self.shared.remove(id) {
            let _ = self.shared.changed.send(NotificationCommand::Changed);
            emitter.notification_closed(id, 3).await?;
            Ok(())
        } else {
            Err(fdo::Error::Failed("notification not found".to_string()))
        }
    }

    #[zbus(signal)]
    async fn notification_closed(
        emitter: &SignalEmitter<'_>,
        id: u32,
        reason: u32,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn action_invoked(
        emitter: &SignalEmitter<'_>,
        id: u32,
        action_key: &str,
    ) -> zbus::Result<()>;
}

impl NotificationShared {
    fn upsert(&self, request: NotificationRequest) -> u32 {
        let mut state = self.state.lock().expect("notification state poisoned");
        let id = if request.replaces_id > 0
            && state
                .items
                .iter()
                .any(|notification| notification.item.id == request.replaces_id)
        {
            request.replaces_id
        } else {
            let id = state.next_id;
            loop {
                state.next_id = state.next_id.wrapping_add(1).max(1);
                if !state
                    .items
                    .iter()
                    .any(|notification| notification.item.id == state.next_id)
                {
                    break;
                }
            }
            id
        };
        let urgency = urgency_from_hints(&request.hints);
        let item = NotificationItem {
            id,
            app_name: clean_app_name(&request.app_name),
            app_icon: clean_icon_name(&request.app_icon),
            received_at: current_unix_time(),
            summary: strip_markup(&request.summary),
            body: strip_markup(&request.body),
            urgency,
            actions: action_pairs(request.actions),
        };
        let toast_visible = !state.do_not_disturb || urgency == NotificationUrgency::Critical;
        let transient = hint_enabled(&request.hints, "transient");
        let stored = StoredNotification {
            resident: hint_enabled(&request.hints, "resident"),
            transient,
            close_on_expiry: transient || request.expire_timeout > 0,
            item,
            toast_until: expiration_for(request.expire_timeout, urgency),
            toast_visible,
        };

        if let Some(existing) = state
            .items
            .iter_mut()
            .find(|notification| notification.item.id == id)
        {
            *existing = stored;
        } else {
            state.items.insert(0, stored);
        }
        if state.items.len() > MAX_NOTIFICATIONS {
            let removed = state.items.pop().unwrap();
            state.closed.push((removed.item.id, 4));
        }
        let _ = self.changed.send(NotificationCommand::Changed);
        id
    }

    fn remove(&self, id: u32) -> bool {
        let mut state = self.state.lock().expect("notification state poisoned");
        let Some(index) = state
            .items
            .iter()
            .position(|notification| notification.item.id == id)
        else {
            return false;
        };
        state.items.remove(index);
        true
    }

    fn snapshot(&self) -> NotificationSnapshot {
        let now = Instant::now();
        let state = self.state.lock().expect("notification state poisoned");
        NotificationSnapshot {
            do_not_disturb: state.do_not_disturb,
            items: state
                .items
                .iter()
                .filter(|notification| !notification.transient)
                .map(|notification| notification.item.clone())
                .collect(),
            toast_items: state
                .items
                .iter()
                .filter(|notification| notification.toast_visible)
                .filter(|notification| {
                    notification
                        .toast_until
                        .is_none_or(|expires_at| expires_at > now)
                })
                .map(|notification| notification.item.clone())
                .collect(),
        }
    }

    fn expire_toasts(&self) -> bool {
        let now = Instant::now();
        let mut state = self.state.lock().expect("notification state poisoned");
        let mut changed = false;
        let mut closed = Vec::new();
        state.items.retain_mut(|notification| {
            if notification
                .toast_until
                .is_some_and(|deadline| deadline <= now)
            {
                notification.toast_until = None;
                notification.toast_visible = false;
                changed = true;
                if notification.close_on_expiry {
                    closed.push((notification.item.id, 1));
                    return false;
                }
            }
            true
        });
        state.closed.extend(closed);
        changed
    }

    fn next_expiration(&self) -> Option<Duration> {
        self.state
            .lock()
            .expect("notification state poisoned")
            .items
            .iter()
            .filter_map(|notification| notification.toast_until)
            .min()
            .map(|deadline| deadline.saturating_duration_since(Instant::now()))
    }
}

fn hint_enabled(hints: &Hints, name: &str) -> bool {
    hints
        .get(name)
        .and_then(|value| bool::try_from(value).ok())
        .unwrap_or(false)
}

pub(super) fn run_notification_worker(
    updates: NotificationUpdates,
    events: Sender<NotificationCommand>,
    commands: Receiver<NotificationCommand>,
    wake: thread::Thread,
) -> Result<(), Box<dyn std::error::Error>> {
    let shared = NotificationShared {
        state: Arc::new(Mutex::new(NotificationState {
            next_id: 1,
            do_not_disturb: false,
            items: Vec::new(),
            closed: Vec::new(),
        })),
        changed: events,
    };
    let connection = connection::Builder::session()?
        .name(SERVICE)?
        .serve_at(
            PATH,
            NotificationServer {
                shared: shared.clone(),
            },
        )?
        .build()?;

    debug!("desktop notification server ready");
    let mut dirty = true;
    loop {
        dirty |= shared.expire_toasts();
        let closed = std::mem::take(
            &mut shared
                .state
                .lock()
                .expect("notification state poisoned")
                .closed,
        );
        for (id, reason) in closed {
            emit_closed(&connection, id, reason);
        }
        if dirty {
            *updates.lock().expect("notification update poisoned") = Some(shared.snapshot());
            wake.unpark();
        }
        let command = match shared.next_expiration() {
            Some(timeout) => match commands.recv_timeout(timeout) {
                Ok(command) => Some(command),
                Err(mpsc::RecvTimeoutError::Timeout) => None,
                Err(mpsc::RecvTimeoutError::Disconnected) => return Ok(()),
            },
            None => match commands.recv() {
                Ok(command) => Some(command),
                Err(_) => return Ok(()),
            },
        };
        dirty = false;
        if let Some(command) = command {
            if matches!(command, NotificationCommand::Stop) {
                return Ok(());
            }
            dirty |= handle_command(&connection, &shared, command);
        }
        while let Ok(command) = commands.try_recv() {
            if matches!(command, NotificationCommand::Stop) {
                return Ok(());
            }
            dirty |= handle_command(&connection, &shared, command);
        }
    }
}

fn handle_command(
    connection: &zbus::blocking::Connection,
    shared: &NotificationShared,
    command: NotificationCommand,
) -> bool {
    match command {
        NotificationCommand::Changed => true,
        NotificationCommand::Stop => false,
        NotificationCommand::Close(id) => {
            if shared.remove(id) {
                emit_closed(connection, id, 2);
                return true;
            }
            false
        }
        NotificationCommand::ClearAll => {
            let ids = {
                let mut state = shared.state.lock().expect("notification state poisoned");
                let ids = state
                    .items
                    .iter()
                    .map(|notification| notification.item.id)
                    .collect::<Vec<_>>();
                state.items.clear();
                ids
            };
            for id in ids {
                emit_closed(connection, id, 2);
            }
            true
        }
        NotificationCommand::SetDoNotDisturb(enabled) => {
            {
                let mut state = shared.state.lock().expect("notification state poisoned");
                state.do_not_disturb = enabled;
                if enabled {
                    for notification in &mut state.items {
                        if notification.item.urgency != NotificationUrgency::Critical {
                            notification.toast_visible = false;
                        }
                    }
                }
            }
            true
        }
        NotificationCommand::Invoke { id, action_key } => {
            let mut state = shared.state.lock().expect("notification state poisoned");
            let Some(index) = state.items.iter().position(|notification| {
                notification.item.id == id
                    && notification
                        .item
                        .actions
                        .iter()
                        .any(|action| action.key == action_key)
            }) else {
                return false;
            };
            let close = !state.items[index].resident;
            if close {
                state.items.remove(index);
            }
            drop(state);
            emit_action(connection, id, &action_key);
            if close {
                emit_closed(connection, id, 2);
            }
            close
        }
    }
}

fn emit_closed(connection: &zbus::blocking::Connection, id: u32, reason: u32) {
    let _ = connection.emit_signal::<&str, _, _, _, _>(
        None,
        PATH,
        INTERFACE,
        "NotificationClosed",
        &(id, reason),
    );
}

fn emit_action(connection: &zbus::blocking::Connection, id: u32, action_key: &str) {
    let _ = connection.emit_signal::<&str, _, _, _, _>(
        None,
        PATH,
        INTERFACE,
        "ActionInvoked",
        &(id, action_key),
    );
}

fn expiration_for(timeout: i32, urgency: NotificationUrgency) -> Option<Instant> {
    if timeout == 0 || urgency == NotificationUrgency::Critical {
        return None;
    }

    let timeout = if timeout < 0 {
        DEFAULT_TIMEOUT
    } else {
        Duration::from_millis(timeout as u64)
    };
    Some(Instant::now() + timeout)
}
