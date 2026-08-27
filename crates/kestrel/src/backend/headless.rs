use crate::{
    client::ClientState,
    frame_clock::{FrameClock, send_surface_frame_tree},
    ipc::IpcServer,
    state::{KestrelState, idle::IdleRuntime},
};
use luft_config::LuftConfig;
use smithay::reexports::wayland_server::{Display, ListeningSocket};
use smithay::utils::{Clock, Monotonic};
use std::{sync::Arc, thread, time::Duration};
use thiserror::Error;
use tracing::{debug, info};

const FRAME_INTERVAL: Duration = Duration::from_millis(16);

pub struct HeadlessOptions {
    pub config: LuftConfig,
    pub socket_name: Option<String>,
}

pub fn run(options: HeadlessOptions) -> Result<(), HeadlessError> {
    let mut display: Display<KestrelState> = Display::new()?;
    let dh = display.handle();
    let mut state = KestrelState::new(&dh, options.config);
    let mut idle_runtime = IdleRuntime::new(&mut state)?;
    let ipc = IpcServer::bind()?;
    let listener = bind_socket(options.socket_name.as_deref())?;
    let socket_name = listener
        .socket_name()
        .and_then(|name| name.to_str())
        .unwrap_or("unknown")
        .to_string();
    let keyboard = state.seat.add_keyboard(Default::default(), 200, 200)?;
    state.keyboard = Some(keyboard.clone());
    let _pointer = state.seat.add_pointer();
    let mut frame_clock = FrameClock::new(Duration::from_nanos(16_666_667));
    let mut clients = Vec::new();

    println!("Kestrel headless compositor is running");
    println!("WAYLAND_DISPLAY={socket_name}");
    info!(
        wayland_display = %socket_name,
        ipc_socket = %ipc.path().display(),
        "headless compositor ready"
    );

    loop {
        state.remove_dead_windows();
        state.send_finished_window_closes();
        state.cleanup_layers();
        state.cleanup_output();
        let _ = ipc.handle_pending(&mut state, &keyboard)?;

        while let Some(stream) = listener.accept()? {
            let client = display
                .handle()
                .insert_client(stream, Arc::new(ClientState::default()))?;
            clients.push(client);
            debug!(connected_clients = clients.len(), "accepted wayland client");
        }

        display.dispatch_clients(&mut state)?;
        display.flush_clients()?;
        idle_runtime.dispatch(&mut state)?;

        let frame_target = Clock::<Monotonic>::new().now() + frame_clock.next_presentation_delay();
        state.signal_commit_timers(frame_target);
        let frame_time = frame_clock.next_frame();
        let output_name = state.output().name();
        state.session_lock_frame_queued(&output_name);
        state.session_lock_presented(&output_name);
        state.signal_fifo_barriers();
        for surface in state.frame_callback_surfaces() {
            send_surface_frame_tree(state.output(), &surface, frame_time);
        }

        thread::sleep(FRAME_INTERVAL);
    }
}

fn bind_socket(socket_name: Option<&str>) -> Result<ListeningSocket, HeadlessError> {
    match socket_name {
        Some(name) => Ok(ListeningSocket::bind(name)?),
        None => Ok(ListeningSocket::bind_auto("luft-headless", 1..33)?),
    }
}

#[derive(Debug, Error)]
pub enum HeadlessError {
    #[error("failed to create wayland display: {0}")]
    Display(#[from] smithay::reexports::wayland_server::backend::InitError),
    #[error("failed to initialize keyboard seat: {0}")]
    Keyboard(#[from] smithay::input::keyboard::Error),
    #[error("failed to bind wayland socket: {0}")]
    Socket(#[from] smithay::reexports::wayland_server::BindError),
    #[error("headless compositor I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("headless idle timer failed: {0}")]
    Calloop(#[from] calloop::Error),
}
