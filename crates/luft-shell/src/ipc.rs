use luft_ipc::{
    CaptureConsentPrompt, ClientMessage, IpcRequest, IpcResponse, OutputSummary,
    SHELL_CAPABILITY_ENV, ServerMessage, ShellSnapshot, WindowSummary, WorkspaceId,
    WorkspaceSummary, read_frame, socket_path, write_frame,
};
use std::{
    env,
    error::Error,
    os::unix::net::UnixStream,
    sync::{
        atomic::{AtomicU64, Ordering},
        mpsc::{self, Receiver, Sender},
    },
    thread,
    time::Duration,
};

#[derive(Debug, Clone)]
pub struct ShellModel {
    pub revision: u64,
    pub active_workspace: WorkspaceId,
    pub xwayland_display: Option<String>,
    pub outputs: Vec<OutputSummary>,
    pub workspaces: Vec<WorkspaceSummary>,
    pub windows: Vec<WindowSummary>,
    pub capture_prompts: Vec<CaptureConsentPrompt>,
}

impl From<ShellSnapshot> for ShellModel {
    fn from(snapshot: ShellSnapshot) -> Self {
        Self {
            revision: snapshot.revision,
            active_workspace: snapshot.status.active_workspace,
            xwayland_display: snapshot.status.xwayland_display,
            outputs: snapshot.outputs,
            workspaces: snapshot.workspaces,
            windows: snapshot.windows,
            capture_prompts: snapshot.capture_prompts,
        }
    }
}

impl ShellModel {
    pub fn primary_frame_rate(&self) -> u32 {
        self.outputs
            .iter()
            .find(|output| output.enabled && output.primary)
            .or_else(|| self.outputs.iter().find(|output| output.enabled))
            .map(|output| {
                u32::try_from(output.refresh_millihertz.max(1))
                    .unwrap_or(60_000)
                    .saturating_add(999)
                    / 1_000
            })
            .filter(|rate| *rate > 0)
            .unwrap_or(60)
    }

    pub fn animation_tick_interval(&self) -> Duration {
        let frame_rate = u64::from(self.primary_frame_rate().max(1));
        Duration::from_nanos((1_000_000_000 + frame_rate / 2) / frame_rate)
    }
}

pub struct ShellIpc {
    outgoing: Sender<ClientMessage>,
    incoming: Receiver<ServerMessage>,
    next_request: AtomicU64,
}

impl ShellIpc {
    pub fn connect() -> Result<(Self, ShellModel), Box<dyn Error>> {
        let capability = take_shell_capability()?;
        let stream = UnixStream::connect(socket_path())?;
        let read_stream = stream.try_clone()?;
        let (outgoing_tx, outgoing_rx) = mpsc::channel();
        let (incoming_tx, incoming_rx) = mpsc::channel();
        spawn_writer(stream, outgoing_rx);
        spawn_reader(read_stream, incoming_tx);

        let ipc = Self {
            outgoing: outgoing_tx,
            incoming: incoming_rx,
            next_request: AtomicU64::new(2),
        };
        ipc.outgoing
            .send(ClientMessage::Authenticate { capability })?;
        ipc.outgoing.send(ClientMessage::Request {
            id: 1,
            request: IpcRequest::SubscribeShell,
        })?;
        let deadline = std::time::Instant::now() + Duration::from_secs(2);
        loop {
            let remaining = deadline.saturating_duration_since(std::time::Instant::now());
            let message = ipc.incoming.recv_timeout(remaining)?;
            match message {
                ServerMessage::ShellUpdate(snapshot)
                | ServerMessage::Response {
                    response: IpcResponse::ShellSnapshot(snapshot),
                    ..
                } => return Ok((ipc, snapshot.into())),
                ServerMessage::Response {
                    response: IpcResponse::Error { message },
                    ..
                } => return Err(message.into()),
                ServerMessage::ShellCommand(_) => {}
                ServerMessage::Response { .. } => {}
            }
        }
    }

    pub fn send(&self, request: IpcRequest) -> Result<u64, mpsc::SendError<ClientMessage>> {
        let id = self.next_request.fetch_add(1, Ordering::Relaxed);
        self.outgoing.send(ClientMessage::Request { id, request })?;
        Ok(id)
    }

    pub fn drain(&self) -> impl Iterator<Item = ServerMessage> + '_ {
        self.incoming.try_iter()
    }
}

fn take_shell_capability() -> Result<String, Box<dyn Error>> {
    let capability =
        env::var(SHELL_CAPABILITY_ENV).map_err(|_| format!("missing {SHELL_CAPABILITY_ENV}"))?;
    unsafe {
        env::remove_var(SHELL_CAPABILITY_ENV);
    }
    Ok(capability)
}

fn spawn_reader(mut stream: UnixStream, incoming: Sender<ServerMessage>) {
    thread::spawn(move || {
        while let Ok(message) = read_frame(&mut stream) {
            if incoming.send(message).is_err() {
                break;
            }
        }
    });
}

fn spawn_writer(mut stream: UnixStream, outgoing: Receiver<ClientMessage>) {
    thread::spawn(move || {
        for message in outgoing {
            if write_frame(&mut stream, &message).is_err() {
                break;
            }
        }
    });
}
