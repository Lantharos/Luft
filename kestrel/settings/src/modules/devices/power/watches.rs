use std::collections::HashMap;

use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::proxy::OwnerChangedStream;

use super::proxies::{IdleMonitorProxy, WatchFiredStream};

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Watch {
    Dim,
    Blank,
    Sleep,
    Warning,
    Activity,
}

pub struct Watches {
    monitor: IdleMonitorProxy<'static>,
    ids: HashMap<Watch, u32>,
    present: bool,
}

impl Watches {
    pub async fn connect(session: &Connection) -> zbus::Result<Self> {
        let monitor = IdleMonitorProxy::new(session).await?;
        let present = DBusProxy::new(session)
            .await?
            .name_has_owner(monitor.inner().destination().as_ref())
            .await?;
        Ok(Self {
            monitor,
            ids: HashMap::new(),
            present,
        })
    }

    pub async fn fired(&self) -> zbus::Result<WatchFiredStream> {
        self.monitor.receive_watch_fired().await
    }

    pub async fn owner_changes(&self) -> zbus::Result<OwnerChangedStream<'static>> {
        self.monitor.inner().receive_owner_changed().await
    }

    pub fn which(&self, id: u32) -> Option<Watch> {
        self.ids
            .iter()
            .find(|(_, watched)| **watched == id)
            .map(|(watch, _)| *watch)
    }

    pub async fn add(&mut self, watch: Watch, seconds: u32) {
        if !self.present {
            return;
        }
        match self.monitor.add_idle_watch(u64::from(seconds) * 1000).await {
            Ok(id) => {
                self.ids.insert(watch, id);
            }
            Err(error) => eprintln!("Couldn't watch for inactivity: {error}"),
        }
    }

    pub async fn clear(&mut self, watch: Watch) {
        if let Some(id) = self.ids.remove(&watch)
            && let Err(error) = self.monitor.remove_watch(id).await
        {
            eprintln!("Couldn't stop watching for inactivity: {error}");
        }
    }

    pub async fn watch_activity(&mut self) {
        if !self.present || self.ids.contains_key(&Watch::Activity) {
            return;
        }
        match self.monitor.add_user_active_watch().await {
            Ok(id) => {
                self.ids.insert(Watch::Activity, id);
            }
            Err(error) => eprintln!("Couldn't watch for activity: {error}"),
        }
    }

    pub fn forget_activity(&mut self) {
        self.ids.remove(&Watch::Activity);
    }

    pub fn restart(&mut self, present: bool) {
        self.ids.clear();
        self.present = present;
    }
}
