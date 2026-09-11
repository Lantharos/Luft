use std::{
    sync::{
        Arc, Mutex,
        mpsc::{self, Sender},
    },
    thread,
};
use tracing::warn;
mod server;
use server::{NotificationCommand, run_notification_worker};

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct NotificationSnapshot {
    pub items: Vec<NotificationItem>,
    pub toast_items: Vec<NotificationItem>,
    pub do_not_disturb: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NotificationItem {
    pub id: u32,
    pub app_name: String,
    pub app_icon: Option<String>,
    pub received_at: u64,
    pub summary: String,
    pub body: String,
    pub urgency: NotificationUrgency,
    pub actions: Vec<NotificationAction>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NotificationAction {
    pub key: String,
    pub label: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NotificationUrgency {
    Low,
    Normal,
    Critical,
}

type NotificationUpdates = Arc<Mutex<Option<NotificationSnapshot>>>;

#[derive(Debug)]
pub struct NotificationService {
    snapshot: NotificationSnapshot,
    updates: NotificationUpdates,
    commands: Sender<NotificationCommand>,
}

impl NotificationService {
    pub fn start() -> Self {
        let updates = Arc::new(Mutex::new(None));
        let worker_updates = updates.clone();
        let (commands_tx, commands_rx) = mpsc::channel();
        let server_commands = commands_tx.clone();
        let wake = thread::current();

        thread::Builder::new()
            .name("luft-notificationd".to_string())
            .spawn(move || {
                if let Err(error) =
                    run_notification_worker(worker_updates, server_commands, commands_rx, wake)
                {
                    warn!(%error, "desktop notifications disabled");
                }
            })
            .ok();

        Self {
            snapshot: NotificationSnapshot::default(),
            updates,
            commands: commands_tx,
        }
    }

    pub fn refresh(&mut self) -> bool {
        let Some(snapshot) = self
            .updates
            .lock()
            .expect("notification update poisoned")
            .take()
        else {
            return false;
        };
        if self.snapshot == snapshot {
            return false;
        }
        self.snapshot = snapshot;
        true
    }

    pub fn snapshot(&self) -> &NotificationSnapshot {
        &self.snapshot
    }

    pub fn close(&mut self, id: u32) {
        self.snapshot.items.retain(|item| item.id != id);
        self.snapshot.toast_items.retain(|item| item.id != id);
        let _ = self.commands.send(NotificationCommand::Close(id));
    }

    pub fn clear_all(&mut self) {
        self.snapshot.items.clear();
        self.snapshot.toast_items.clear();
        let _ = self.commands.send(NotificationCommand::ClearAll);
    }

    pub fn invoke(&mut self, id: u32, action_key: String) {
        let _ = self
            .commands
            .send(NotificationCommand::Invoke { id, action_key });
    }

    pub fn set_do_not_disturb(&mut self, enabled: bool) {
        self.snapshot.do_not_disturb = enabled;
        if enabled {
            self.snapshot
                .toast_items
                .retain(|item| item.urgency == NotificationUrgency::Critical);
        }
        let _ = self
            .commands
            .send(NotificationCommand::SetDoNotDisturb(enabled));
    }
}

impl Drop for NotificationService {
    fn drop(&mut self) {
        let _ = self.commands.send(NotificationCommand::Stop);
    }
}
