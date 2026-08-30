use serde::{Deserialize, Serialize};
use std::{
    env, fs, io,
    io::{Read, Write},
    os::unix::net::UnixStream,
    path::{Path, PathBuf},
};

mod layout;

pub use layout::{
    Arrangement, LayoutEngine, LayoutError, Rect, WindowId, WindowInfo, WindowState, Workspace,
    WorkspaceId,
};

pub const SOCKET_ENV: &str = "LUFT_IPC_SOCKET";
const MAX_FRAME_BYTES: usize = 8 * 1024 * 1024;

pub fn socket_path() -> PathBuf {
    if let Some(path) = env::var_os(SOCKET_ENV) {
        return PathBuf::from(path);
    }

    runtime_dir().join("luft").join("kestrel.sock")
}

pub fn ensure_socket_parent(path: &Path) -> io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

pub fn send_request(request: &IpcRequest) -> io::Result<IpcResponse> {
    send_request_to(&socket_path(), request)
}

pub fn send_request_to(path: &Path, request: &IpcRequest) -> io::Result<IpcResponse> {
    let mut stream = UnixStream::connect(path)?;
    stream.set_read_timeout(Some(std::time::Duration::from_secs(2)))?;
    stream.set_write_timeout(Some(std::time::Duration::from_secs(2)))?;
    write_frame(
        &mut stream,
        &ClientMessage::Request {
            id: 1,
            request: request.clone(),
        },
    )?;
    loop {
        match read_frame(&mut stream)? {
            ServerMessage::Response { id: 1, response } => return Ok(response),
            ServerMessage::Response { .. }
            | ServerMessage::ShellUpdate(_)
            | ServerMessage::ShellCommand(_) => {}
        }
    }
}

fn runtime_dir() -> PathBuf {
    env::var_os("XDG_RUNTIME_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| env::temp_dir().join(format!("luft-{}", current_user())))
}

fn current_user() -> String {
    env::var("USER").unwrap_or_else(|_| "user".to_string())
}

pub fn read_frame<T: for<'de> Deserialize<'de>>(stream: &mut impl Read) -> io::Result<T> {
    let mut length = [0_u8; 4];
    stream.read_exact(&mut length)?;
    let length = u32::from_be_bytes(length) as usize;
    if length > MAX_FRAME_BYTES {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Luft IPC frame exceeds maximum size",
        ));
    }
    let mut payload = vec![0; length];
    stream.read_exact(&mut payload)?;
    serde_json::from_slice(&payload).map_err(json_error)
}

pub fn write_frame<T: Serialize>(stream: &mut impl Write, value: &T) -> io::Result<()> {
    let payload = serde_json::to_vec(value).map_err(json_error)?;
    let length = u32::try_from(payload.len())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Luft IPC frame is too large"))?;
    stream.write_all(&length.to_be_bytes())?;
    stream.write_all(&payload)?;
    stream.flush()
}

fn json_error(error: serde_json::Error) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, error)
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum IpcRequest {
    SubscribeShell,
    Reload,
    ListOutputs,
    ActivateWindow {
        window: WindowId,
    },
    CloseWindow {
        window: WindowId,
    },
    MinimizeWindow {
        window: WindowId,
    },
    ToggleMaximizeWindow {
        window: WindowId,
    },
    MoveWindowToWorkspace {
        window: WindowId,
        workspace: WorkspaceId,
    },
    SwitchWorkspace {
        workspace: WorkspaceId,
    },
    SwitchRelativeWorkspace {
        offset: i32,
    },
    SetOutputScale {
        output: Option<String>,
        scale: f64,
    },
    RestartShell,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DefaultAppKind {
    Terminal,
    FileManager,
    Browser,
    Settings,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum IpcResponse {
    ShellSnapshot(ShellSnapshot),
    Outputs { outputs: Vec<OutputSummary> },
    Accepted { revision: u64 },
    Error { message: String },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ShellSnapshot {
    pub revision: u64,
    pub status: StatusPayload,
    pub outputs: Vec<OutputSummary>,
    pub workspaces: Vec<WorkspaceSummary>,
    pub windows: Vec<WindowSummary>,
}

impl ShellSnapshot {
    pub fn without_revision_eq(&self, other: &Self) -> bool {
        self.status == other.status
            && self.outputs == other.outputs
            && self.workspaces == other.workspaces
            && self.windows == other.windows
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum ClientMessage {
    Request { id: u64, request: IpcRequest },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum ServerMessage {
    Response { id: u64, response: IpcResponse },
    ShellUpdate(ShellSnapshot),
    ShellCommand(ShellCommand),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ShellCommand {
    Lock,
    Suspend,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StatusPayload {
    pub compositor: String,
    pub shell: ShellStatus,
    pub xwayland: XwaylandStatus,
    pub xwayland_display: Option<String>,
    pub active_workspace: WorkspaceId,
    pub nested: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OutputSummary {
    pub name: String,
    pub make: String,
    pub model: String,
    pub width: i32,
    pub height: i32,
    pub logical_width: i32,
    pub logical_height: i32,
    pub refresh_millihertz: i32,
    pub scale: f64,
    pub primary: bool,
    pub enabled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ShellStatus {
    NotStarted,
    Running,
    Restarting,
    Failed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum XwaylandStatus {
    Disabled,
    Unavailable,
    Running,
    Restarting,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceSummary {
    pub id: WorkspaceId,
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindowSummary {
    pub id: WindowId,
    pub title: Option<String>,
    pub app_id: Option<String>,
    pub pid: Option<u32>,
    pub workspace: WorkspaceId,
    pub state: WindowState,
    pub geometry: Rect,
    pub is_active: bool,
    pub is_visible: bool,
    pub icon_uri: Option<String>,
    pub icon_name: Option<String>,
}
