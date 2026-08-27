use std::{
    fs, io,
    os::unix::net::UnixListener,
    path::{Path, PathBuf},
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
        mpsc,
    },
    thread,
    time::Duration,
};

use luft_ipc::{ensure_socket_parent, read_request, write_response};
use smithay::reexports::calloop::{
    Interest, LoopHandle, Mode, PostAction,
    channel::{self, Event},
    generic::Generic,
};
use tracing::warn;

use crate::state::{Backend, KestrelState};

const MAX_PENDING_CONNECTIONS: usize = 32;

#[derive(Debug)]
pub struct IpcSocket {
    path: PathBuf,
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

    let (sender, receiver) = channel::channel::<(
        luft_ipc::IpcRequest,
        mpsc::SyncSender<luft_ipc::IpcResponse>,
    )>();
    let pending_connections = Arc::new(AtomicUsize::new(0));
    handle
        .insert_source(receiver, |event, _, state| {
            let Event::Msg((request, response_tx)) = event else {
                return;
            };
            let _ = response_tx.send(state.handle_ipc(request));
        })
        .map_err(|error| io::Error::other(error.to_string()))?;

    handle
        .insert_source(
            Generic::new(listener, Interest::READ, Mode::Level),
            move |_, listener, _state| {
                loop {
                    let (mut stream, _) = match listener.accept() {
                        Ok(connection) => connection,
                        Err(error) if error.kind() == io::ErrorKind::WouldBlock => break,
                        Err(error) => {
                            warn!(%error, "failed to accept Luft IPC connection");
                            break;
                        }
                    };
                    if pending_connections.fetch_add(1, Ordering::Relaxed)
                        >= MAX_PENDING_CONNECTIONS
                    {
                        pending_connections.fetch_sub(1, Ordering::Relaxed);
                        continue;
                    }
                    let sender = sender.clone();
                    let pending_connections = Arc::clone(&pending_connections);
                    thread::spawn(move || {
                        let _ = stream.set_read_timeout(Some(Duration::from_secs(2)));
                        let response = match read_request(&mut stream) {
                            Ok(request) => {
                                let (response_tx, response_rx) = mpsc::sync_channel(1);
                                if sender.send((request, response_tx)).is_err() {
                                    luft_ipc::IpcResponse::Error {
                                        message: "compositor IPC channel closed".to_string(),
                                    }
                                } else {
                                    response_rx
                                        .recv_timeout(Duration::from_secs(2))
                                        .unwrap_or_else(|error| luft_ipc::IpcResponse::Error {
                                            message: format!(
                                                "compositor did not answer IPC request: {error}"
                                            ),
                                        })
                                }
                            }
                            Err(error) => luft_ipc::IpcResponse::Error {
                                message: error.to_string(),
                            },
                        };
                        let _ = stream.set_write_timeout(Some(Duration::from_secs(2)));
                        if let Err(error) = write_response(&mut stream, &response)
                            && error.kind() != io::ErrorKind::BrokenPipe
                        {
                            warn!(%error, "failed to write Luft IPC response");
                        }
                        pending_connections.fetch_sub(1, Ordering::Relaxed);
                    });
                }
                Ok(PostAction::Continue)
            },
        )
        .map_err(io::Error::other)?;

    Ok(IpcSocket { path })
}

fn remove_stale_socket(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}
