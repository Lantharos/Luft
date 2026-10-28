//! The app's session bus, relayed through the sandbox so it can answer
//! Flatpak's portal itself: `Spawn` starts processes in a sandbox nested in
//! the app's, which is how Chromium and Electron keep their own sandbox.

mod message;
mod relay;
mod spawn;
mod wire;

use std::collections::HashMap;
use std::os::unix::net::UnixListener;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};

use zbus::{Fd, Variant as Value};

use message::{Frame, Header, Outgoing};
use relay::{Client, PORTAL_NAME};
pub use spawn::Layout;

const PATH: &str = "/org/freedesktop/portal/Flatpak";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const PEER: &str = "org.freedesktop.DBus.Peer";
const INTROSPECTABLE: &str = "org.freedesktop.DBus.Introspectable";
const INTERFACE: &str = r#"<node>
  <interface name="org.freedesktop.portal.Flatpak">
    <method name="Spawn">
      <arg type="ay" name="cwd_path" direction="in"/>
      <arg type="aay" name="argv" direction="in"/>
      <arg type="a{uh}" name="fds" direction="in"/>
      <arg type="a{ss}" name="envs" direction="in"/>
      <arg type="u" name="flags" direction="in"/>
      <arg type="a{sv}" name="options" direction="in"/>
      <arg type="u" name="pid" direction="out"/>
    </method>
    <method name="SpawnSignal">
      <arg type="u" name="pid" direction="in"/>
      <arg type="u" name="signal" direction="in"/>
      <arg type="b" name="to_process_group" direction="in"/>
    </method>
    <signal name="SpawnStarted">
      <arg type="u" name="pid"/>
      <arg type="u" name="relpid"/>
    </signal>
    <signal name="SpawnExited">
      <arg type="u" name="pid"/>
      <arg type="u" name="exit_status"/>
    </signal>
    <property name="version" type="u" access="read"/>
    <property name="supports" type="u" access="read"/>
  </interface>
</node>"#;
const VERSION: u32 = 4;
const SUPPORTS_EXPOSE_PIDS: u32 = 1;
const UNKNOWN_METHOD: &str = "org.freedesktop.DBus.Error.UnknownMethod";
const UNKNOWN_PROPERTY: &str = "org.freedesktop.DBus.Error.UnknownProperty";
const INVALID_ARGS: &str = "org.freedesktop.DBus.Error.InvalidArgs";
const FAILED: &str = "org.freedesktop.DBus.Error.Failed";
const NO_SUCH_PROCESS: &str = "org.freedesktop.DBus.Error.UnixProcessIdUnknown";

type Reply = Result<Outgoing<'static>, (&'static str, String)>;

type SpawnArguments<'a> = (
    Vec<u8>,
    Vec<Vec<u8>>,
    HashMap<u32, Fd<'a>>,
    HashMap<String, String>,
    u32,
    HashMap<String, Value<'a>>,
);

struct Spawned {
    owner: u64,
    watch_bus: bool,
}

/// Flatpak's portal for one sandbox: what it may start and what runs.
pub struct Portal {
    layout: Layout,
    sandbox: OnceLock<u32>,
    spawned: Mutex<HashMap<u32, Spawned>>,
}

/// The app's bus socket, kept while the relay serves it.
pub struct Bus {
    socket: PathBuf,
    portal: Arc<Portal>,
}

impl Bus {
    pub fn start(socket: PathBuf, upstream: &Path, layout: Layout) -> Result<Self, String> {
        let listener = UnixListener::bind(&socket).map_err(|error| error.to_string())?;
        let portal = Arc::new(Portal {
            layout,
            sandbox: OnceLock::new(),
            spawned: Mutex::new(HashMap::new()),
        });
        relay::serve(listener, upstream, portal.clone());
        Ok(Self { socket, portal })
    }

    /// Hands the portal the app's sandbox, whose namespaces what it starts joins.
    pub fn sandbox_started(&self, pid: u32) {
        let _ = self.portal.sandbox.set(pid);
    }
}

impl Drop for Bus {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.socket);
    }
}

fn property(name: &str) -> Option<u32> {
    match name {
        "version" => Some(VERSION),
        "supports" => Some(SUPPORTS_EXPOSE_PIDS),
        _ => None,
    }
}

impl Portal {
    fn answer(self: &Arc<Self>, client: &Arc<Client>, header: &Header, frame: Frame) {
        if (header.interface.as_str(), header.member.as_str()) == (PORTAL_NAME, "Spawn") {
            self.answer_spawn(client, header, frame);
            return;
        }
        let reply = match (header.interface.as_str(), header.member.as_str()) {
            (PROPERTIES, "Get") => self.get(header, frame),
            (PROPERTIES, "GetAll") => Ok(Outgoing::reply(header, PORTAL_NAME).with_body(
                "a{sv}",
                &(HashMap::from([
                    ("version", Value::from(VERSION)),
                    ("supports", Value::from(SUPPORTS_EXPOSE_PIDS)),
                ]),),
            )),
            (PEER, "Ping") => Ok(Outgoing::reply(header, PORTAL_NAME)),
            (INTROSPECTABLE, "Introspect") => {
                Ok(Outgoing::reply(header, PORTAL_NAME).with_body("s", &(INTERFACE,)))
            }
            (PORTAL_NAME, "SpawnSignal") => self.signal(client, header, frame),
            _ => Err((
                UNKNOWN_METHOD,
                format!("{} isn't offered here", header.member),
            )),
        };
        if !header.wants_reply() {
            return;
        }
        match reply {
            Ok(reply) => client.send(&reply),
            Err((name, text)) => client.send(&Outgoing::error(header, PORTAL_NAME, name, &text)),
        }
    }

    /// Starts the process, answers with its ID and only then watches it, so
    /// the caller knows the ID before it hears the process started.
    fn answer_spawn(self: &Arc<Self>, client: &Arc<Client>, header: &Header, frame: Frame) {
        let started = match self.spawn(header, frame) {
            Ok(started) => started,
            Err((name, text)) => {
                eprintln!("The sandbox couldn't start a process for its app: {text}");
                client.send(&Outgoing::error(header, PORTAL_NAME, name, &text));
                return;
            }
        };
        let pid = started.pid;
        let spawned = Spawned {
            owner: client.id,
            watch_bus: started.watch_bus,
        };
        self.spawned
            .lock()
            .expect("spawned processes")
            .insert(pid, spawned);
        client.send(&Outgoing::reply(header, PORTAL_NAME).with_body("u", &(pid,)));
        let (portal, client) = (self.clone(), client.clone());
        std::thread::spawn(move || {
            started.watch(&client);
            portal.exited(pid);
        });
    }

    fn get(&self, header: &Header, frame: Frame) -> Reply {
        let body = header.body(frame);
        let ((_, name), _): ((String, String), _) = body
            .deserialize_for_signature("(ss)")
            .map_err(|error| (INVALID_ARGS, error.to_string()))?;
        let value = property(&name).ok_or((UNKNOWN_PROPERTY, name))?;
        Ok(Outgoing::reply(header, PORTAL_NAME).with_body("v", &(Value::from(value),)))
    }

    fn spawn(
        &self,
        header: &Header,
        frame: Frame,
    ) -> Result<spawn::Started, (&'static str, String)> {
        let sandbox = *self
            .sandbox
            .get()
            .ok_or((FAILED, "The sandbox is still starting.".to_owned()))?;
        let body = header.body(frame);
        let ((directory, argv, fds, environment, flags, options), _): (SpawnArguments<'_>, _) =
            body.deserialize_for_signature("(ayaaya{uh}a{ss}ua{sv})")
                .map_err(|error| (INVALID_ARGS, error.to_string()))?;
        let request = spawn::Request::read(directory, argv, &fds, environment, flags, &options)
            .map_err(|error| (INVALID_ARGS, error))?;
        spawn::start(&self.layout, sandbox, request).map_err(|error| (FAILED, error))
    }

    fn signal(&self, client: &Client, header: &Header, frame: Frame) -> Reply {
        let body = header.body(frame);
        let ((pid, signal, group), _): ((u32, u32, bool), _) = body
            .deserialize_for_signature("(uub)")
            .map_err(|error| (INVALID_ARGS, error.to_string()))?;
        let spawned = self.spawned.lock().expect("spawned processes");
        if spawned
            .get(&pid)
            .is_none_or(|spawned| spawned.owner != client.id)
        {
            return Err((NO_SUCH_PROCESS, "No such process".to_owned()));
        }
        spawn::signal(pid, signal as i32, group);
        Ok(Outgoing::reply(header, PORTAL_NAME))
    }

    fn exited(&self, pid: u32) {
        self.spawned.lock().expect("spawned processes").remove(&pid);
    }

    fn disconnected(&self, client: u64) {
        let spawned = self.spawned.lock().expect("spawned processes");
        for (pid, _) in spawned
            .iter()
            .filter(|(_, spawned)| spawned.owner == client && spawned.watch_bus)
        {
            spawn::signal(*pid, libc::SIGINT, true);
        }
    }
}
