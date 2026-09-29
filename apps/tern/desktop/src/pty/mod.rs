mod budget;
mod output;
mod session;
mod spawn;

use std::collections::HashMap;
use std::process::Command;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};

use luft_app::Events;
use parking_lot::RwLock;

use budget::Budget;
use session::Session;
pub use spawn::Size;

#[derive(Clone, Default)]
pub struct Sessions {
    next: Arc<AtomicU32>,
    open: Arc<RwLock<HashMap<u32, Arc<Session>>>>,
    budget: Arc<Budget>,
}

impl Sessions {
    pub fn start(&self, command: Command, size: Size, events: Events) -> Result<u32, String> {
        let id = self.next.fetch_add(1, Ordering::Relaxed) + 1;
        let session = Session::start(id, command, size, events, self.budget.clone())
            .map_err(|error| format!("Could not start the shell: {error}"))?;
        self.open.write().insert(id, Arc::new(session));
        Ok(id)
    }

    pub fn attach(&self, id: u32) {
        if let Some(session) = self.get(id) {
            session.output().attach();
        }
    }

    pub fn write(&self, id: u32, bytes: Vec<u8>) {
        if let Some(session) = self.get(id) {
            session.write(bytes);
        }
    }

    pub fn acknowledge(&self, id: u32) {
        if let Some(session) = self.get(id) {
            session.output().acknowledge();
        }
    }

    pub fn resize(&self, id: u32, size: Size) -> Result<(), String> {
        match self.get(id) {
            Some(session) => session.resize(size).map_err(|error| error.to_string()),
            None => Ok(()),
        }
    }

    pub fn foreground(&self, id: u32) -> Option<String> {
        self.get(id)?.foreground()
    }

    pub fn close(&self, id: u32) {
        self.open.write().remove(&id);
    }

    fn get(&self, id: u32) -> Option<Arc<Session>> {
        self.open.read().get(&id).cloned()
    }
}
