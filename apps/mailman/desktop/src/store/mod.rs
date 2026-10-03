mod accounts;
mod mail;
mod mailboxes;
mod migrate;
mod outbox;
mod queue;
mod senders;
mod settings;
mod templates;

use std::path::Path;
use std::sync::Arc;

use parking_lot::Mutex;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};

pub use mail::{Cursor, Fetched, Flag, Flags, Inserted, Located, NewMessage, Notable, View};
pub use mailboxes::{Mailbox, RemoteFolder};
pub use outbox::Outgoing;
pub use settings::Settings;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Inbox,
    Sent,
    Drafts,
    Archive,
    All,
    Trash,
    Junk,
}

impl Role {
    pub fn as_str(self) -> &'static str {
        match self {
            Role::Inbox => "inbox",
            Role::Sent => "sent",
            Role::Drafts => "drafts",
            Role::Archive => "archive",
            Role::All => "all",
            Role::Trash => "trash",
            Role::Junk => "junk",
        }
    }

    pub fn parse(role: &str) -> Option<Self> {
        Some(match role {
            "inbox" => Role::Inbox,
            "sent" => Role::Sent,
            "drafts" => Role::Drafts,
            "archive" => Role::Archive,
            "all" => Role::All,
            "trash" => Role::Trash,
            "junk" => Role::Junk,
            _ => return None,
        })
    }

    pub fn guess(name: &str) -> Option<Self> {
        Some(match name.to_lowercase().as_str() {
            "sent" | "sent items" | "sent mail" | "sent messages" => Role::Sent,
            "drafts" | "draft" => Role::Drafts,
            "trash" | "deleted" | "deleted items" | "deleted messages" | "bin" => Role::Trash,
            "junk" | "spam" | "junk e-mail" | "junk email" => Role::Junk,
            "archive" | "archives" => Role::Archive,
            _ => return None,
        })
    }
}

#[derive(Clone)]
pub struct Store {
    write: Arc<Mutex<Connection>>,
    read: Arc<Mutex<Connection>>,
}

impl Store {
    pub fn open(path: &Path) -> Result<Self, String> {
        if let Some(folder) = path.parent() {
            std::fs::create_dir_all(folder).map_err(|error| error.to_string())?;
        }
        let mut write = Connection::open(path).map_err(|error| error.to_string())?;
        write
            .execute_batch(
                "PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;
                 PRAGMA mmap_size = 1073741824; PRAGMA cache_size = -32768;",
            )
            .map_err(|error| error.to_string())?;
        migrate::migrate(&mut write).map_err(|error| error.to_string())?;
        write
            .execute_batch("PRAGMA analysis_limit = 1000; PRAGMA optimize = 0x10002;")
            .map_err(|error| error.to_string())?;
        let read = Connection::open(path).map_err(|error| error.to_string())?;
        read.execute_batch(
            "PRAGMA foreign_keys = ON; PRAGMA query_only = ON; PRAGMA mmap_size = 1073741824; PRAGMA cache_size = -32768;",
        )
            .map_err(|error| error.to_string())?;
        Ok(Self {
            write: Arc::new(Mutex::new(write)),
            read: Arc::new(Mutex::new(read)),
        })
    }

    pub fn optimize(&self) -> Result<(), String> {
        self.writing(|connection| connection.execute_batch("PRAGMA optimize;"))
    }

    pub(super) fn writing<T>(
        &self,
        work: impl FnOnce(&mut Connection) -> rusqlite::Result<T>,
    ) -> Result<T, String> {
        work(&mut self.write.lock()).map_err(|error| error.to_string())
    }

    pub(super) fn reading<T>(
        &self,
        work: impl FnOnce(&Connection) -> rusqlite::Result<T>,
    ) -> Result<T, String> {
        work(&self.read.lock()).map_err(|error| error.to_string())
    }
}

pub fn now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs() as i64)
        .unwrap_or(0)
}
