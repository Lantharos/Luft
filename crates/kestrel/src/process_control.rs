use crate::{
    ClientState,
    shell::WindowElement,
    state::{Backend, KestrelState},
};
use luft_ipc::WindowId;
use smithay::reexports::wayland_server::{Resource, backend::DisconnectReason};

pub(crate) fn can_force_quit(window: &WindowElement) -> bool {
    window
        .wl_surface()
        .and_then(|surface| surface.client())
        .is_some_and(|client| {
            client.get_data::<ClientState>().is_some_and(|state| {
                !state.privileged && !state.capture_privileged && !state.xwayland_bridge
            })
        })
}

impl<B: Backend> KestrelState<B> {
    pub(crate) fn force_quit_window(&mut self, id: WindowId) -> Result<(), String> {
        let window = self.windows.get(&id).ok_or("window no longer exists")?;
        if !can_force_quit(window) {
            return Err("this window uses a shared display connection and cannot be force-quit independently".into());
        }
        let client = window
            .wl_surface()
            .and_then(|surface| surface.client())
            .ok_or("window connection is closed")?;
        self.display_handle
            .backend_handle()
            .kill_client(client.id(), DisconnectReason::ConnectionClosed);
        Ok(())
    }
}
