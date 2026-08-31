use std::{
    fs, io,
    os::unix::{fs::PermissionsExt, net::UnixListener},
    path::{Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicUsize, Ordering},
        mpsc::{self, SyncSender, TrySendError},
    },
    thread,
    time::Duration,
};

use luft_ipc::{
    ClientMessage, IpcRequest, IpcResponse, ServerMessage, ShellSnapshot, ensure_socket_parent,
    read_frame, write_frame,
};
use smithay::reexports::calloop::{Interest, LoopHandle, Mode, PostAction, generic::Generic, ping};
use tracing::warn;

use crate::state::{Backend, KestrelState};

#[derive(Debug)]
struct IpcCommand {
    id: u64,
    request: IpcRequest,
    reply: SyncSender<WriterEvent>,
    alive: Arc<AtomicBool>,
}

const MAX_CONNECTIONS: usize = 64;
const MAX_PENDING_COMMANDS: usize = 256;
const MAX_PENDING_RESPONSES: usize = 32;

#[derive(Debug)]
enum WriterEvent {
    Ordered(ServerMessage),
    Snapshot,
}

#[derive(Debug)]
struct Subscriber {
    sender: SyncSender<WriterEvent>,
    latest_snapshot: Arc<Mutex<Option<ShellSnapshot>>>,
    snapshot_pending: Arc<AtomicBool>,
    subscribed: Arc<AtomicBool>,
    alive: Arc<AtomicBool>,
}

#[derive(Debug)]
pub struct IpcSocket {
    path: PathBuf,
    subscribers: Arc<Mutex<Vec<Subscriber>>>,
    snapshot: Option<ShellSnapshot>,
}

impl IpcSocket {
    pub fn snapshot(&self) -> Option<ShellSnapshot> {
        self.snapshot.clone()
    }

    pub fn publish(&mut self, mut snapshot: ShellSnapshot) -> ShellSnapshot {
        if let Some(current) = &self.snapshot
            && current.without_revision_eq(&snapshot)
        {
            return current.clone();
        }
        snapshot.revision = self
            .snapshot
            .as_ref()
            .map_or(1, |current| current.revision.saturating_add(1));
        self.snapshot = Some(snapshot.clone());
        if let Ok(mut subscribers) = self.subscribers.lock() {
            subscribers.retain(|subscriber| {
                if !subscriber.alive.load(Ordering::Acquire)
                    || !subscriber.subscribed.load(Ordering::Acquire)
                {
                    return subscriber.alive.load(Ordering::Acquire);
                }
                if let Ok(mut latest) = subscriber.latest_snapshot.lock() {
                    *latest = Some(snapshot.clone());
                } else {
                    return false;
                }
                if subscriber.snapshot_pending.swap(true, Ordering::AcqRel) {
                    true
                } else {
                    enqueue(&subscriber.sender, WriterEvent::Snapshot, &subscriber.alive)
                }
            });
        }
        snapshot
    }

    pub fn send_shell_command(&mut self, command: luft_ipc::ShellCommand) {
        let message = ServerMessage::ShellCommand(command);
        if let Ok(mut subscribers) = self.subscribers.lock() {
            subscribers.retain(|subscriber| {
                subscriber.alive.load(Ordering::Acquire)
                    && (!subscriber.subscribed.load(Ordering::Acquire)
                        || enqueue(
                            &subscriber.sender,
                            WriterEvent::Ordered(message.clone()),
                            &subscriber.alive,
                        ))
            });
        }
    }
}

impl Drop for IpcSocket {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
    }
}

pub fn install<BackendData: Backend + 'static>(
    handle: &LoopHandle<'static, KestrelState<BackendData>>,
    path: PathBuf,
) -> io::Result<IpcSocket> {
    ensure_socket_parent(&path)?;
    if let Some(parent) = path.parent() {
        fs::set_permissions(parent, fs::Permissions::from_mode(0o700))?;
    }
    remove_stale_socket(&path)?;
    let listener = UnixListener::bind(&path)?;
    fs::set_permissions(&path, fs::Permissions::from_mode(0o600))?;
    listener.set_nonblocking(true)?;

    let subscribers = Arc::new(Mutex::new(Vec::new()));
    let connection_count = Arc::new(AtomicUsize::new(0));
    let (sender, receiver) = mpsc::sync_channel::<IpcCommand>(MAX_PENDING_COMMANDS);
    let (command_ping, command_source) = ping::make_ping()?;
    handle
        .insert_source(command_source, move |(), _, state| {
            while let Ok(command) = receiver.try_recv() {
                let subscribing = command.request == IpcRequest::SubscribeShell;
                let mut response = state.handle_ipc(command.request);
                let snapshot = state.sync_shell_state();
                response = if subscribing {
                    IpcResponse::ShellSnapshot(snapshot.clone())
                } else if matches!(response, IpcResponse::Accepted { .. }) {
                    IpcResponse::Accepted {
                        revision: snapshot.revision,
                    }
                } else {
                    response
                };
                let _ = enqueue(
                    &command.reply,
                    WriterEvent::Ordered(ServerMessage::Response {
                        id: command.id,
                        response,
                    }),
                    &command.alive,
                );
            }
        })
        .map_err(|error| io::Error::other(error.to_string()))?;

    let connection_subscribers = Arc::clone(&subscribers);
    let listener_connection_count = Arc::clone(&connection_count);
    handle
        .insert_source(
            Generic::new(listener, Interest::READ, Mode::Level),
            move |_, listener, _state| {
                loop {
                    let (stream, _) = match listener.accept() {
                        Ok(connection) => connection,
                        Err(error) if error.kind() == io::ErrorKind::WouldBlock => break,
                        Err(error) => {
                            warn!(%error, "failed to accept Luft IPC connection");
                            break;
                        }
                    };
                    if !peer_is_current_user(&stream) {
                        warn!("rejected Luft IPC connection from another user");
                        continue;
                    }
                    if listener_connection_count.fetch_add(1, Ordering::AcqRel) >= MAX_CONNECTIONS {
                        listener_connection_count.fetch_sub(1, Ordering::AcqRel);
                        continue;
                    }
                    let read_stream = match stream.try_clone() {
                        Ok(stream) => stream,
                        Err(error) => {
                            listener_connection_count.fetch_sub(1, Ordering::AcqRel);
                            warn!(%error, "failed to clone Luft IPC connection");
                            continue;
                        }
                    };
                    let (outgoing, incoming) = mpsc::sync_channel(MAX_PENDING_RESPONSES);
                    let subscribed = Arc::new(AtomicBool::new(false));
                    let alive = Arc::new(AtomicBool::new(true));
                    let latest_snapshot = Arc::new(Mutex::new(None));
                    let snapshot_pending = Arc::new(AtomicBool::new(false));
                    if let Ok(mut subscribers) = connection_subscribers.lock() {
                        subscribers.push(Subscriber {
                            sender: outgoing.clone(),
                            latest_snapshot: Arc::clone(&latest_snapshot),
                            snapshot_pending: Arc::clone(&snapshot_pending),
                            subscribed: Arc::clone(&subscribed),
                            alive: Arc::clone(&alive),
                        });
                    }
                    spawn_writer(
                        stream,
                        incoming,
                        latest_snapshot,
                        snapshot_pending,
                        Arc::clone(&alive),
                    );
                    spawn_reader(
                        read_stream,
                        sender.clone(),
                        command_ping.clone(),
                        outgoing,
                        subscribed,
                        alive,
                        Arc::clone(&listener_connection_count),
                    );
                }
                Ok(PostAction::Continue)
            },
        )
        .map_err(io::Error::other)?;

    Ok(IpcSocket {
        path,
        subscribers,
        snapshot: None,
    })
}

fn spawn_reader(
    mut stream: std::os::unix::net::UnixStream,
    commands: SyncSender<IpcCommand>,
    command_ping: ping::Ping,
    reply: SyncSender<WriterEvent>,
    subscribed: Arc<AtomicBool>,
    alive: Arc<AtomicBool>,
    connection_count: Arc<AtomicUsize>,
) {
    thread::spawn(move || {
        loop {
            let message = match read_frame::<ClientMessage>(&mut stream) {
                Ok(message) => message,
                Err(error)
                    if matches!(
                        error.kind(),
                        io::ErrorKind::UnexpectedEof
                            | io::ErrorKind::ConnectionReset
                            | io::ErrorKind::BrokenPipe
                    ) =>
                {
                    break;
                }
                Err(error) => {
                    warn!(%error, "failed to read Luft IPC request");
                    break;
                }
            };
            let ClientMessage::Request { id, request } = message;
            if request == IpcRequest::SubscribeShell {
                subscribed.store(true, Ordering::Release);
            }
            match commands.try_send(IpcCommand {
                id,
                request,
                reply: reply.clone(),
                alive: Arc::clone(&alive),
            }) {
                Ok(()) => command_ping.ping(),
                Err(TrySendError::Full(_)) | Err(TrySendError::Disconnected(_)) => break,
            }
        }
        alive.store(false, Ordering::Release);
        connection_count.fetch_sub(1, Ordering::AcqRel);
    });
}

fn spawn_writer(
    mut stream: std::os::unix::net::UnixStream,
    incoming: mpsc::Receiver<WriterEvent>,
    latest_snapshot: Arc<Mutex<Option<ShellSnapshot>>>,
    snapshot_pending: Arc<AtomicBool>,
    alive: Arc<AtomicBool>,
) {
    thread::spawn(move || {
        while alive.load(Ordering::Acquire) {
            let event = match incoming.recv_timeout(Duration::from_secs(1)) {
                Ok(event) => event,
                Err(mpsc::RecvTimeoutError::Timeout) => continue,
                Err(mpsc::RecvTimeoutError::Disconnected) => break,
            };
            let message = match event {
                WriterEvent::Ordered(message) => message,
                WriterEvent::Snapshot => {
                    snapshot_pending.store(false, Ordering::Release);
                    let Ok(mut latest) = latest_snapshot.lock() else {
                        break;
                    };
                    let Some(snapshot) = latest.take() else {
                        continue;
                    };
                    ServerMessage::ShellUpdate(snapshot)
                }
            };
            if write_frame(&mut stream, &message).is_err() {
                break;
            }
        }
        alive.store(false, Ordering::Release);
    });
}

fn enqueue(sender: &SyncSender<WriterEvent>, event: WriterEvent, alive: &AtomicBool) -> bool {
    match sender.try_send(event) {
        Ok(()) => true,
        Err(TrySendError::Full(_)) | Err(TrySendError::Disconnected(_)) => {
            alive.store(false, Ordering::Release);
            false
        }
    }
}

fn peer_is_current_user(stream: &std::os::unix::net::UnixStream) -> bool {
    rustix::net::sockopt::socket_peercred(stream)
        .is_ok_and(|credentials| credentials.uid == rustix::process::getuid())
}

fn remove_stale_socket(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}
