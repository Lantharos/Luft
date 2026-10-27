mod clients;
mod end_session;
mod inhibitors;
mod peers;

use std::collections::HashSet;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use luft_identity::caller::{self, Caller};
use zbus::message::Header;
use zbus::names::UniqueName;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};
use zbus::{ObjectPath, OwnedObjectPath, Variant};

use crate::errors::Failure;
use crate::properties;
use crate::system::{self, Power};
use clients::Clients;
use end_session::{Action, Confirmation};
use inhibitors::Inhibitors;

pub const NAME: &str = "org.gnome.SessionManager";
pub const PATH: &str = "/org/gnome/SessionManager";
const INTERFACE: &str = "org.gnome.SessionManager";
const INHIBIT_LOGOUT: u32 = 1;
pub const INHIBIT_IDLE: u32 = 8;
const LOGOUT_NO_CONFIRMATION: u32 = 1;
const LOGOUT_FORCE: u32 = 2;

async fn property_changed(
    emitter: &SignalEmitter<'_>,
    name: &str,
    value: Variant<'_>,
) -> zbus::Result<()> {
    properties::changed(emitter, INTERFACE, name, value).await
}

pub fn sender<'h>(header: &'h Header<'_>) -> &'h UniqueName<'h> {
    header
        .sender()
        .expect("calls through the bus name their sender")
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub struct SessionState {
    pub active: bool,
    pub locked: bool,
}

/// The session's state, shared by the session manager's objects.
pub struct Session {
    connection: Connection,
    system: Connection,
    inhibitors: Inhibitors,
    clients: Clients,
    confirmation: Confirmation,
    peers: Mutex<HashSet<String>>,
    shell_running: AtomicBool,
    state: Mutex<SessionState>,
}

impl Session {
    pub fn new(connection: Connection, system: Connection) -> Arc<Self> {
        Arc::new(Self {
            inhibitors: Inhibitors::new(connection.clone()),
            clients: Clients::new(connection.clone()),
            confirmation: Confirmation::default(),
            peers: Mutex::default(),
            shell_running: AtomicBool::new(false),
            state: Mutex::new(SessionState {
                active: true,
                locked: false,
            }),
            connection,
            system,
        })
    }

    pub async fn inhibit(
        self: &Arc<Self>,
        owner: &UniqueName<'_>,
        app_id: &str,
        reason: &str,
        flags: u32,
    ) -> zbus::Result<u32> {
        self.watch(owner);
        self.inhibitors.add(owner, app_id, reason, flags).await
    }

    pub async fn uninhibit(&self, cookie: u32) -> zbus::Result<bool> {
        self.inhibitors.remove(cookie).await
    }

    pub fn inhibited(&self) -> u32 {
        self.inhibitors.flags()
    }

    pub fn set_shell_running(&self, running: bool) {
        self.shell_running.store(running, Ordering::Relaxed);
    }

    pub async fn set_state(&self, state: SessionState) -> zbus::Result<()> {
        let previous = std::mem::replace(&mut *self.state.lock().unwrap(), state);
        let emitter = self.emitter();
        if state.active != previous.active {
            property_changed(&emitter, "SessionIsActive", Variant::from(state.active)).await?;
        }
        if state.locked != previous.locked {
            property_changed(&emitter, "SessionIsLocked", Variant::from(state.locked)).await?;
        }
        Ok(())
    }

    pub async fn emit_running(&self) {
        if let Err(error) = Manager::session_running(&self.emitter()).await {
            eprintln!("Couldn't announce that the session runs: {error}");
        }
    }

    async fn emit_over(&self) {
        if let Err(error) = Manager::session_over(&self.emitter()).await {
            eprintln!("Couldn't announce that the session ends: {error}");
        }
    }

    fn emitter(&self) -> SignalEmitter<'static> {
        SignalEmitter::from_parts(
            self.connection.clone(),
            ObjectPath::from_static_str_unchecked(PATH),
        )
    }

    async fn forget(&self, peer: &str) -> zbus::Result<()> {
        self.inhibitors.remove_owner(peer).await?;
        self.clients.remove_owner(peer).await
    }

    fn end(self: &Arc<Self>, action: Action, mode: u32) {
        if mode & (LOGOUT_NO_CONFIRMATION | LOGOUT_FORCE) == 0 {
            self.confirm(action, self.inhibitors.paths(INHIBIT_LOGOUT));
            return;
        }
        let session = Arc::clone(self);
        tokio::spawn(async move { session.finish(action, mode & LOGOUT_FORCE == 0).await });
    }

    async fn sandboxed(&self, header: &Header<'_>) -> bool {
        caller::of_sender(&self.connection, header).await != Caller::You
    }
}

pub struct Manager(pub Arc<Session>);

#[interface(name = "org.gnome.SessionManager")]
impl Manager {
    async fn setenv(
        &self,
        name: &str,
        value: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Failure> {
        if self.0.sandboxed(&header).await {
            return Err(Failure::access_denied(
                "Sandboxed apps cannot change the session environment",
            ));
        }
        if self.0.shell_running.load(Ordering::Relaxed) {
            return Err(Failure::not_in_initialization(
                "The session environment can only change while the session starts",
            ));
        }
        system::export_environment(&self.0.connection, name, value).await;
        Ok(())
    }

    fn get_locale(&self, _category: i32) -> String {
        std::env::var("LANG").unwrap_or_else(|_| "C".into())
    }

    async fn register_client(
        &self,
        _app_id: &str,
        _startup_id: &str,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<OwnedObjectPath, Failure> {
        let owner = sender(&header);
        self.0.watch(owner);
        Ok(self.0.clients.register(owner).await?)
    }

    async fn unregister_client(&self, path: ObjectPath<'_>) -> Result<(), Failure> {
        Ok(self.0.clients.unregister(&path).await?)
    }

    async fn inhibit(
        &self,
        app_id: &str,
        _toplevel_xid: u32,
        reason: &str,
        flags: u32,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<u32, Failure> {
        if flags == 0 {
            return Err(Failure::general("Nothing to inhibit"));
        }
        Ok(self
            .0
            .inhibit(sender(&header), app_id, reason, flags)
            .await?)
    }

    async fn uninhibit(&self, cookie: u32) -> Result<(), Failure> {
        match self.0.uninhibit(cookie).await? {
            true => Ok(()),
            false => Err(Failure::general("Unknown inhibitor")),
        }
    }

    fn is_inhibited(&self, flags: u32) -> bool {
        self.0.inhibited() & flags != 0
    }

    fn get_inhibitors(&self) -> Vec<OwnedObjectPath> {
        self.0.inhibitors.paths(u32::MAX)
    }

    fn is_session_running(&self) -> bool {
        true
    }

    async fn logout(&self, mode: u32, #[zbus(header)] header: Header<'_>) {
        let mode = if self.0.sandboxed(&header).await {
            0
        } else {
            mode
        };
        self.0.end(Action::Logout, mode);
    }

    fn shutdown(&self) {
        self.0.end(Action::Shutdown, 0);
    }

    fn reboot(&self) {
        self.0.end(Action::Reboot, 0);
    }

    async fn suspend(&self) -> Result<(), Failure> {
        system::perform(&self.0.system, Power::Suspend)
            .await
            .map_err(general)
    }

    async fn can_shutdown(&self) -> Result<u32, Failure> {
        system::availability(&self.0.system, Power::Off)
            .await
            .map_err(general)
    }

    async fn can_reboot(&self) -> Result<u32, Failure> {
        system::availability(&self.0.system, Power::Reboot)
            .await
            .map_err(general)
    }

    async fn can_suspend(&self) -> Result<u32, Failure> {
        system::availability(&self.0.system, Power::Suspend)
            .await
            .map_err(general)
    }

    #[zbus(property)]
    fn session_name(&self) -> &str {
        "kestrel"
    }

    #[zbus(property)]
    fn session_class(&self) -> &str {
        "user"
    }

    #[zbus(property)]
    fn session_is_active(&self) -> bool {
        self.0.state.lock().unwrap().active
    }

    #[zbus(property)]
    fn session_is_locked(&self) -> bool {
        self.0.state.lock().unwrap().locked
    }

    #[zbus(property)]
    fn inhibited_actions(&self) -> u32 {
        self.0.inhibited()
    }

    #[zbus(property)]
    fn restore_supported(&self) -> bool {
        false
    }

    #[zbus(signal)]
    async fn client_added(emitter: &SignalEmitter<'_>, path: ObjectPath<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn client_removed(emitter: &SignalEmitter<'_>, path: ObjectPath<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn inhibitor_added(emitter: &SignalEmitter<'_>, path: ObjectPath<'_>)
    -> zbus::Result<()>;

    #[zbus(signal)]
    async fn inhibitor_removed(
        emitter: &SignalEmitter<'_>,
        path: ObjectPath<'_>,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn session_running(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn session_over(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}

fn general(error: zbus::Error) -> Failure {
    Failure::general(error.to_string())
}
