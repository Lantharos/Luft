use std::{
    fs, io,
    os::unix::net::UnixListener,
    path::{Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicUsize, Ordering},
        mpsc,
    },
    thread,
};

use luft_ipc::{
    ClientMessage, IpcRequest, IpcResponse, ServerMessage, ShellSnapshot, ensure_socket_parent,
    read_frame, write_frame,
};
use smithay::reexports::calloop::{
    Interest, LoopHandle, Mode, PostAction,
    channel::{self, Event},
    generic::Generic,
};
use tracing::warn;

use crate::state::{Backend, KestrelState};

#[derive(Debug)]
struct IpcCommand {
    id: u64,
    request: IpcRequest,
    reply: mpsc::Sender<ServerMessage>,
}

const MAX_CONNECTIONS: usize = 64;

#[derive(Debug)]
struct Subscriber {
    sender: mpsc::Sender<ServerMessage>,
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
        let update = ServerMessage::ShellUpdate(snapshot.clone());
        if let Ok(mut subscribers) = self.subscribers.lock() {
            subscribers.retain(|subscriber| {
                subscriber.alive.load(Ordering::Acquire)
                    && (!subscriber.subscribed.load(Ordering::Acquire)
                        || subscriber.sender.send(update.clone()).is_ok())
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
                        || subscriber.sender.send(message.clone()).is_ok())
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
    remove_stale_socket(&path)?;
    let listener = UnixListener::bind(&path)?;
    listener.set_nonblocking(true)?;

    let subscribers = Arc::new(Mutex::new(Vec::new()));
    let connection_count = Arc::new(AtomicUsize::new(0));
    let (sender, receiver) = channel::channel::<IpcCommand>();
    handle
        .insert_source(receiver, |event, _, state| {
            let Event::Msg(command) = event else {
                return;
            };
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
            let _ = command.reply.send(ServerMessage::Response {
                id: command.id,
                response,
            });
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
                    let (outgoing, incoming) = mpsc::channel();
                    let subscribed = Arc::new(AtomicBool::new(false));
                    let alive = Arc::new(AtomicBool::new(true));
                    if let Ok(mut subscribers) = connection_subscribers.lock() {
                        subscribers.push(Subscriber {
                            sender: outgoing.clone(),
                            subscribed: Arc::clone(&subscribed),
                            alive: Arc::clone(&alive),
                        });
                    }
                    spawn_writer(stream, incoming);
                    spawn_reader(
                        read_stream,
                        sender.clone(),
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
    commands: channel::Sender<IpcCommand>,
    reply: mpsc::Sender<ServerMessage>,
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
            if commands
                .send(IpcCommand {
                    id,
                    request,
                    reply: reply.clone(),
                })
                .is_err()
            {
                break;
            }
        }
        alive.store(false, Ordering::Release);
        connection_count.fetch_sub(1, Ordering::AcqRel);
    });
}

fn spawn_writer(
    mut stream: std::os::unix::net::UnixStream,
    incoming: mpsc::Receiver<ServerMessage>,
) {
    thread::spawn(move || {
        for message in incoming {
            if write_frame(&mut stream, &message).is_err() {
                break;
            }
        }
    });
}

fn remove_stale_socket(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}
