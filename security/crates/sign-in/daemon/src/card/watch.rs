use std::collections::HashMap;
use std::sync::{Arc, Mutex, PoisonError};

use luft_dbus::idle::Idle;
use zbus::Connection;

use super::pcsc::{Change, Readers, reader_named};
use crate::sessions;

/// The readers whose card someone signed in or unlocked with. Taking the card
/// out, or the reader with it, locks every session of theirs.
#[derive(Default)]
pub struct Watches {
    armed: Mutex<HashMap<u32, Arc<Readers>>>,
}

impl Watches {
    pub fn arm(
        self: &Arc<Self>,
        uid: u32,
        reader: String,
        connection: Connection,
        idle: Arc<Idle>,
    ) {
        let Some(readers) = Readers::connect().map(Arc::new) else {
            eprintln!("Couldn't reach pcscd to notice the card coming out");
            return;
        };
        let Some(reader) = reader_named(&readers.names(), &reader).cloned() else {
            return;
        };
        if let Some(earlier) = self.armed().insert(uid, readers.clone()) {
            earlier.stop();
        }
        let watches = self.clone();
        tokio::spawn(async move {
            let _activity = idle.hold();
            let waiting = readers.clone();
            let change =
                tokio::task::spawn_blocking(move || waiting.wait_for_removal(&reader)).await;
            {
                let mut armed = watches.armed();
                if armed
                    .get(&uid)
                    .is_some_and(|current| Arc::ptr_eq(current, &readers))
                {
                    armed.remove(&uid);
                }
            }
            if matches!(change, Ok(Change::CardGone | Change::ReaderGone))
                && let Err(error) = sessions::lock(&connection, uid).await
            {
                eprintln!("Couldn't lock the screen after the card came out: {error}");
            }
        });
    }

    fn armed(&self) -> std::sync::MutexGuard<'_, HashMap<u32, Arc<Readers>>> {
        self.armed.lock().unwrap_or_else(PoisonError::into_inner)
    }
}
