mod desktop;
mod program;

use std::collections::HashMap;
use std::os::fd::{AsFd, BorrowedFd};
use std::sync::Mutex;

use luft_identity::caller;
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;

pub use luft_identity::caller::Caller;

const SABINE_HOST: &str = "sabine-host";
/// Prefixes the owner of items, and the app secrets, of an app in a sandbox.
pub const SANDBOXED: &str = "flatpak:";
const YOU: &str = "you";
const UNKNOWN: &str = "unknown";

/// Marks items the Chromium that Sabine apps share created. They are yours
/// like any other, only kept out of other programs' searches.
pub const SABINE: &str = "sabine";

/// Which items a requester's searches show. Your browser and the Chromium
/// Sabine apps share both keep their key under `application=chromium`, so
/// each must only find its own.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum View {
    Everything,
    SabineChromium,
}

#[derive(Debug, Clone)]
pub struct Requester {
    pub caller: Caller,
    pub connection: Option<String>,
    pub program: String,
    pub view: View,
}

impl Requester {
    pub fn unknown(connection: Option<String>) -> Self {
        Self {
            caller: Caller::Unknown,
            connection,
            program: String::new(),
            view: View::Everything,
        }
    }

    pub async fn of_process(
        bus: &Connection,
        connection: Option<String>,
        pidfd: BorrowedFd<'_>,
    ) -> Self {
        let caller = caller::of_process(bus, pidfd).await;
        let program = program::file_name(pidfd).unwrap_or_default();
        let view = if caller == Caller::You && program == SABINE_HOST {
            View::SabineChromium
        } else {
            View::Everything
        };
        Self {
            caller,
            connection,
            program,
            view,
        }
    }

    pub fn is_you(&self) -> bool {
        self.caller == Caller::You
    }

    pub fn sandboxed_app(&self) -> Option<&str> {
        self.caller.app()
    }

    /// The owner recorded on items it creates.
    pub fn owner(&self) -> Option<String> {
        match (&self.caller, self.view) {
            (Caller::App(id), _) => Some(format!("{SANDBOXED}{id}")),
            (Caller::You, View::SabineChromium) => Some(SABINE.to_owned()),
            _ => None,
        }
    }

    /// How prompts name it, mid-sentence: sandboxed apps by name, any other
    /// program without guessing what it is.
    pub fn named(&self) -> String {
        match &self.caller {
            Caller::App(id) => app_name(id),
            Caller::You => "an app on this computer".into(),
            Caller::Unknown => "an app".into(),
        }
    }

    /// The same at the start of a sentence.
    pub fn named_first(&self) -> String {
        let named = self.named();
        let mut characters = named.chars();
        characters.next().map_or(named.clone(), |first| {
            first.to_uppercase().chain(characters).collect()
        })
    }

    pub fn icon(&self) -> &str {
        self.sandboxed_app().unwrap_or_default()
    }

    /// Who the access history files it under.
    pub fn principal(&self) -> String {
        match &self.caller {
            Caller::App(id) => format!("{SANDBOXED}{id}"),
            Caller::You => YOU.into(),
            Caller::Unknown => UNKNOWN.into(),
        }
    }

    /// What the access history shows for it. For your own programs that is
    /// the program's file name, which only labels the entry.
    pub fn label(&self) -> String {
        match &self.caller {
            Caller::App(id) => app_name(id),
            Caller::You => self.program.clone(),
            Caller::Unknown => String::new(),
        }
    }
}

pub fn app_name(id: &str) -> String {
    desktop::name(id).unwrap_or_else(|| id.to_owned())
}

/// The sandboxed app an item owner or app store key names, when it is one's.
pub fn sandboxed_app_of(key: &str) -> Option<&str> {
    key.strip_prefix(SANDBOXED)
}

#[derive(Default)]
pub struct Requesters {
    known: Mutex<HashMap<String, Requester>>,
}

impl Requesters {
    pub async fn identify(&self, bus: &Connection, sender: &str) -> Requester {
        if let Some(requester) = self.known.lock().expect("requesters").get(sender) {
            return requester.clone();
        }
        let requester = identify(bus, sender).await;
        self.known
            .lock()
            .expect("requesters")
            .insert(sender.to_owned(), requester.clone());
        requester
    }

    pub fn forget(&self, sender: &str) {
        self.known.lock().expect("requesters").remove(sender);
    }

    pub fn forget_all(&self) {
        self.known.lock().expect("requesters").clear();
    }
}

async fn identify(bus: &Connection, sender: &str) -> Requester {
    let connection = Some(sender.to_owned());
    let Ok(name) = BusName::try_from(sender) else {
        return Requester::unknown(connection);
    };
    let credentials = match DBusProxy::new(bus).await {
        Ok(proxy) => proxy.get_connection_credentials(name).await.ok(),
        Err(_) => None,
    };
    match credentials.as_ref().and_then(|found| found.process_fd()) {
        Some(pidfd) => Requester::of_process(bus, connection, pidfd.as_fd()).await,
        None => Requester::unknown(connection),
    }
}
