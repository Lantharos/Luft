use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct RuntimeOptions {
    pub wayland_socket: Option<String>,
    pub ipc_socket: PathBuf,
    pub start_shell: bool,
    pub nested: bool,
}

impl RuntimeOptions {
    pub fn new(wayland_socket: Option<String>, start_shell: bool, nested: bool) -> Self {
        Self {
            wayland_socket,
            ipc_socket: luft_ipc::socket_path(),
            start_shell,
            nested,
        }
    }
}
