use std::os::fd::{AsFd, OwnedFd};
use std::os::unix::net::UnixListener;
use std::path::Path;

use wayland_client::globals::{GlobalListContents, registry_queue_init};
use wayland_client::protocol::wl_registry::WlRegistry;
use wayland_client::{Connection, Dispatch, QueueHandle, delegate_noop};
use wayland_protocols::wp::security_context::v1::client::wp_security_context_manager_v1::WpSecurityContextManagerV1;
use wayland_protocols::wp::security_context::v1::client::wp_security_context_v1::WpSecurityContextV1;

const ENGINE: &str = "com.lantharos.Sandbox";

struct State;

impl Dispatch<WlRegistry, GlobalListContents> for State {
    fn event(
        _: &mut Self,
        _: &WlRegistry,
        _: <WlRegistry as wayland_client::Proxy>::Event,
        _: &GlobalListContents,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
    }
}

delegate_noop!(State: ignore WpSecurityContextManagerV1);
delegate_noop!(State: ignore WpSecurityContextV1);

/// A Wayland socket of the app's own. The compositor tags every client that
/// connects through it with the app's ID until this is dropped.
pub struct SecurityContext {
    _closed_when_dropped: OwnedFd,
}

impl SecurityContext {
    /// Opens the app's socket at `socket`. Without a Wayland compositor that
    /// can tag clients, the app gets no Wayland socket and uses X11.
    pub fn create(socket: &Path, id: &str) -> Result<Option<Self>, String> {
        let Ok(connection) = Connection::connect_to_env() else {
            return Ok(None);
        };
        let (globals, mut queue) =
            registry_queue_init::<State>(&connection).map_err(|error| error.to_string())?;
        let handle = queue.handle();
        let Ok(manager) = globals.bind::<WpSecurityContextManagerV1, _, _>(&handle, 1..=1, ())
        else {
            eprintln!("The compositor can't tell sandboxed apps apart, so {id} only gets X11");
            return Ok(None);
        };
        let listener = UnixListener::bind(socket).map_err(|error| error.to_string())?;
        let (close_read, close_write) = crate::launch::fds::pipe()?;
        let context = manager.create_listener(listener.as_fd(), close_read.as_fd(), &handle, ());
        context.set_sandbox_engine(ENGINE.to_owned());
        context.set_app_id(id.to_owned());
        context.set_instance_id(std::process::id().to_string());
        context.commit();
        context.destroy();
        manager.destroy();
        queue
            .roundtrip(&mut State)
            .map_err(|error| error.to_string())?;
        Ok(Some(Self {
            _closed_when_dropped: close_write,
        }))
    }
}
