use super::nested_timing::{host_refresh_millihertz, refresh_interval};
use crate::{
    client::ClientState,
    frame_clock::FrameClock,
    input::handle_input_event,
    ipc::IpcServer,
    output::NestedOutput,
    render::{NestedFrameRenderer, SceneFrameInput},
    scanout::{collect_pointer_elements, send_frame_callbacks, update_primary_scanout_output},
    session_services,
    shell::ShellProcess,
    state::{KestrelState, idle::IdleRuntime, refresh_space},
    xwayland::XwaylandSatellite,
};
use calloop::{
    EventLoop, LoopSignal, PostAction,
    generic::Generic,
    timer::{TimeoutAction, Timer},
};
use luft_config::LuftConfig;
use luft_ipc::{ShellStatus, shell_socket_path};
use smithay::reexports::wayland_server::{Display, DisplayHandle};
use smithay::{
    backend::{
        renderer::gles::GlesRenderer,
        winit::{self, WinitEvent, WinitGraphicsBackend},
    },
    input::{Seat, keyboard::KeyboardHandle, pointer::PointerHandle},
    wayland::socket::ListeningSocketSource,
};
use std::{
    path::PathBuf,
    sync::Arc,
    time::{Duration, Instant},
};
use thiserror::Error;
use tracing::{debug, info, warn};

const REFRESH_CHECK_INTERVAL: Duration = Duration::from_millis(500);
const PENDING_REFRESH_CHECK_INTERVAL: Duration = Duration::from_millis(50);
const PROCESS_CHECK_INTERVAL: Duration = Duration::from_millis(250);

pub struct NestedOptions {
    pub config: LuftConfig,
    pub socket_name: Option<String>,
}

struct NestedLoopState {
    state: KestrelState,
    display_handle: DisplayHandle,
    backend: WinitGraphicsBackend<GlesRenderer>,
    scene_renderer: NestedFrameRenderer,
    output: NestedOutput,
    frame_clock: FrameClock,
    ipc: IpcServer,
    shell: Option<ShellProcess>,
    shell_control_socket: PathBuf,
    xwayland: XwaylandSatellite,
    keyboard: KeyboardHandle<KestrelState>,
    pointer: PointerHandle<KestrelState>,
    socket_name: String,
    loop_signal: LoopSignal,
    host_refresh_known: bool,
    host_frame_presented: bool,
    idle_runtime: IdleRuntime,
}

pub fn run(options: NestedOptions) -> Result<(), NestedError> {
    let mut event_loop = EventLoop::<NestedLoopState>::try_new()?;
    let loop_signal = event_loop.get_signal();
    let display: Display<KestrelState> = Display::new()?;
    let display_handle = display.handle();
    let (backend, winit) = winit::init::<GlesRenderer>()?;
    let mut compositor = NestedLoopState::new(options, display_handle, loop_signal, backend)?;
    register_sources(&mut event_loop, display, winit, &mut compositor)?;

    compositor.xwayland = XwaylandSatellite::start(
        compositor.state.config.compositor.xwayland,
        &compositor.socket_name,
    );
    compositor.state.xwayland_status = compositor.xwayland.status();
    compositor.state.xwayland_display = compositor.xwayland.display().map(str::to_string);

    session_services::start(
        &compositor.socket_name,
        compositor.state.xwayland_display.as_deref(),
    );

    compositor.shell = Some(ShellProcess::start(crate::shell::ShellLaunch {
        wayland_display: &compositor.socket_name,
        x11_display: compositor.state.xwayland_display.as_deref(),
        ipc_socket: compositor.ipc.path(),
        shell_socket: &compositor.shell_control_socket,
        output_refresh_millihertz: compositor.output.refresh_millihertz,
        output_width: compositor.output.size.w,
        output_height: compositor.output.size.h,
        skip_startup_apps: true,
    }));
    compositor.state.shell_status = compositor
        .shell
        .as_ref()
        .map(ShellProcess::status)
        .unwrap_or(ShellStatus::NotStarted);

    if compositor.state.shell_status == ShellStatus::Failed {
        eprintln!(
            "warning: luft-shell was not found; build it with `cargo build --bin luft-shell` and ensure it sits beside kestrel or is on PATH"
        );
    } else if compositor.state.shell_status != ShellStatus::Running {
        eprintln!(
            "warning: luft-shell did not start (status={:?}); check ~/.config/luft/logs/luft-shell.log",
            compositor.state.shell_status
        );
    }

    println!("Kestrel nested compositor is running");
    println!("WAYLAND_DISPLAY={}", compositor.socket_name);
    if let Some(display) = &compositor.state.xwayland_display {
        println!("DISPLAY={display}");
    }
    info!(
        wayland_display = %compositor.socket_name,
        ipc_socket = %compositor.ipc.path().display(),
        refresh_millihertz = compositor.output.refresh_millihertz,
        "nested compositor ready"
    );

    event_loop.run(None, &mut compositor, |_| {})?;
    Ok(())
}

impl NestedLoopState {
    fn new(
        options: NestedOptions,
        display_handle: DisplayHandle,
        loop_signal: LoopSignal,
        backend: WinitGraphicsBackend<GlesRenderer>,
    ) -> Result<Self, NestedError> {
        let state = KestrelState::new(&display_handle, options.config);
        let ipc = IpcServer::bind()?;
        let shell_control_socket = shell_socket_path(ipc.path());
        let mut output = NestedOutput::default();

        backend.window().set_decorations(true);
        backend.window().set_cursor_visible(false);

        let size = backend.window_size();
        output.resize(size);
        let mut state = state;
        state.set_output_size(output.size);
        state.set_primary_output_scale(backend.scale_factor());
        state.shell_control_path = Some(shell_control_socket.clone());

        let host_refresh_known = host_refresh_millihertz(backend.window()).is_some();
        if let Some(refresh) = host_refresh_millihertz(backend.window()) {
            output.set_refresh(refresh);
        }
        state.set_output_refresh(output.refresh_millihertz);

        let keyboard = state.seat.add_keyboard(Default::default(), 200, 200)?;
        state.keyboard = Some(keyboard.clone());
        let pointer = state.seat.add_pointer();
        let idle_runtime = IdleRuntime::new(&mut state)?;

        let socket_name = options.socket_name.unwrap_or_default();

        let scene_renderer = NestedFrameRenderer::new(state.output());

        Ok(Self {
            state,
            display_handle,
            backend,
            scene_renderer,
            output,
            frame_clock: FrameClock::new(refresh_interval(output.refresh_millihertz)),
            ipc,
            shell: None,
            shell_control_socket,
            xwayland: XwaylandSatellite::start(false, "pending"),
            keyboard,
            pointer,
            socket_name,
            loop_signal,
            host_refresh_known,
            host_frame_presented: false,
            idle_runtime,
        })
    }

    fn handle_resized(
        &mut self,
        size: smithay::utils::Size<i32, smithay::utils::Physical>,
        scale_factor: f64,
    ) {
        let size_changed = self.output.resize(size);
        if size_changed {
            self.state.set_output_size(self.output.size);
        }
        let scale_changed = self.state.set_primary_output_scale(scale_factor);
        if size_changed || scale_changed {
            self.scene_renderer.reset_buffers(&self.state);
            self.request_redraw();
        }
    }

    fn request_redraw(&self) {
        self.backend.window().request_redraw();
    }

    fn process_maintenance(&mut self) {
        if let Err(error) = self.idle_runtime.dispatch(&mut self.state) {
            warn!(%error, "idle timer dispatch failed");
        }
        let frame_started = Instant::now();

        self.state.remove_dead_windows();
        self.state.send_finished_window_closes();
        self.state.cleanup_layers();
        self.state.cleanup_output();
        refresh_space(&mut self.state);

        self.xwayland.reap(&self.socket_name);
        let xwayland_status = self.xwayland.status();
        if self.state.xwayland_status != xwayland_status {
            self.state.xwayland_status = xwayland_status;
            self.state.mark_scene_content_dirty();
            self.request_redraw();
        }
        let xwayland_display = self.xwayland.display().map(str::to_string);
        if self.state.xwayland_display != xwayland_display {
            self.state.xwayland_display = xwayland_display;
            self.state.mark_scene_content_dirty();
            self.request_redraw();
        }
        if self.xwayland.restart_due(frame_started) {
            self.request_redraw();
        }

        if self
            .ipc
            .handle_pending(&mut self.state, &self.keyboard)
            .unwrap_or(false)
        {
            self.state.mark_scene_structural_dirty();
            self.request_redraw();
        }

        if self.state.take_shell_restart_requested() {
            if let Some(shell) = &mut self.shell {
                shell.restart();
            }
        } else if let Some(shell) = &mut self.shell {
            shell.reap(&mut self.state.config);
            let shell_status = shell.status();
            if self.state.shell_status != shell_status {
                self.state.shell_status = shell_status;
                if shell_status != ShellStatus::Running {
                    self.scene_renderer.reset_buffers(&self.state);
                }
                self.state.mark_scene_dirty();
                self.request_redraw();
            }
        }
    }

    fn dispatch_frame_callbacks(
        &mut self,
        render_element_states: &smithay::backend::renderer::element::RenderElementStates,
    ) {
        let frame_time = self.frame_clock.next_frame();
        update_primary_scanout_output(&self.state, self.state.output(), render_element_states);
        self.state.refresh_idle_inhibition();
        send_frame_callbacks(
            &self.state,
            self.state.output(),
            frame_time.sequence() as u32,
            frame_time.time(),
        );
    }

    fn render_frame(&mut self) {
        let frame_target = smithay::utils::Clock::<smithay::utils::Monotonic>::new().now()
            + self.frame_clock.next_presentation_delay();
        self.state.signal_commit_timers(frame_target);
        let removed_windows = self.state.remove_dead_windows();
        let finished_window_closes = self.state.send_finished_window_closes();
        let content_render_needed = self.scene_renderer.content_render_needed(
            &self.state,
            removed_windows,
            finished_window_closes,
            false,
        );

        if !content_render_needed {
            if self.state.has_pending_frame_callbacks() {
                self.dispatch_frame_callbacks(
                    &smithay::backend::renderer::element::RenderElementStates::default(),
                );
            }
            if self.state.animations_active() || self.state.scene_needs_frame() {
                self.request_redraw();
            }
            return;
        }

        refresh_space(&mut self.state);

        let frame_input = SceneFrameInput {
            state: &self.state,
            removed_windows,
            finished_window_closes,
            force_full_damage: false,
            target_transform: smithay::utils::Transform::Normal,
        };

        if self
            .scene_renderer
            .prepare(self.backend.renderer(), frame_input)
            .is_err()
        {
            warn!("nested prepare failed");
            if self.state.has_pending_frame_callbacks() {
                self.dispatch_frame_callbacks(
                    &smithay::backend::renderer::element::RenderElementStates::default(),
                );
            }
            self.request_redraw();
            return;
        }

        let output_name = self.state.output().name();
        if self
            .state
            .has_pending_capture_for_output_mode(&output_name, false)
        {
            let mapping = self
                .scene_renderer
                .capture_without_cursor(&self.state, self.backend.renderer());
            self.state
                .finish_captures(&output_name, false, self.backend.renderer(), mapping);
        }
        let pointer =
            collect_pointer_elements(&self.state, self.state.output(), self.backend.renderer());
        if self
            .scene_renderer
            .compose(&self.state, self.backend.renderer(), &pointer)
            .is_err()
        {
            warn!("nested scene composition failed");
            self.scene_renderer.reset_buffers(&self.state);
            self.request_redraw();
            return;
        }
        if self
            .state
            .has_pending_capture_for_output_mode(&output_name, true)
        {
            let mapping = self
                .scene_renderer
                .capture_with_cursor(self.backend.renderer());
            self.state
                .finish_captures(&output_name, true, self.backend.renderer(), mapping);
        }

        let render_result = self.backend.bind_with_buffer_age().and_then(
            |(renderer, mut framebuffer, buffer_age)| {
                Ok(self
                    .scene_renderer
                    .present(renderer, &mut framebuffer, buffer_age)?)
            },
        );

        match render_result {
            Ok(output) => {
                let submitted = if let Some(damage) = output.damage.as_deref() {
                    if self.backend.submit(Some(damage)).is_err() {
                        warn!("nested submit failed");
                        self.scene_renderer.reset_buffers(&self.state);
                        self.request_redraw();
                        return;
                    }
                    true
                } else {
                    false
                };
                if submitted {
                    if std::env::var_os("KESTREL_RENDER_DIAGNOSTICS").is_some() {
                        eprintln!("host submit complete");
                    }
                    self.host_frame_presented = true;
                    let output_name = self.state.output().name();
                    self.state.session_lock_frame_queued(&output_name);
                    self.state.session_lock_presented(&output_name);
                }
                self.backend.window().set_cursor_visible(false);
                self.state.signal_fifo_barriers();
                self.dispatch_frame_callbacks(&output.states);
                let output_name = self.state.output().name();
                self.state.acknowledge_redraw(&output_name);
                refresh_space(&mut self.state);
            }
            Err(err) => {
                warn!("nested render error: {err}");
                self.request_redraw();
                return;
            }
        }

        if self.state.animations_active() || self.state.scene_needs_frame() {
            self.request_redraw();
        }
    }
}

fn register_sources(
    event_loop: &mut EventLoop<NestedLoopState>,
    display: Display<KestrelState>,
    winit: smithay::backend::winit::WinitEventLoop,
    compositor: &mut NestedLoopState,
) -> Result<(), NestedError> {
    let handle = event_loop.handle();

    let listening = if compositor.socket_name.is_empty() {
        ListeningSocketSource::new_auto().map_err(NestedError::Socket)?
    } else {
        ListeningSocketSource::with_name(&compositor.socket_name).map_err(NestedError::Socket)?
    };
    compositor.socket_name = listening.socket_name().to_string_lossy().into_owned();

    handle
        .insert_source(listening, |client_stream, _, nested| {
            let _ = nested
                .display_handle
                .insert_client(client_stream, Arc::new(ClientState::default()));
            debug!("accepted wayland client");
        })
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    handle
        .insert_source(
            Generic::new(display, calloop::Interest::READ, calloop::Mode::Level),
            |_, display, nested| {
                unsafe {
                    display.get_mut().dispatch_clients(&mut nested.state)?;
                    display.get_mut().flush_clients()?;
                }
                if nested.state.scene_needs_frame() {
                    nested.request_redraw();
                }
                Ok(PostAction::Continue)
            },
        )
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    let refresh_interval = if compositor.host_refresh_known {
        REFRESH_CHECK_INTERVAL
    } else {
        PENDING_REFRESH_CHECK_INTERVAL
    };
    handle
        .insert_source(
            Timer::from_duration(refresh_interval),
            move |_, _, nested| {
                if let Some(refresh) = host_refresh_millihertz(nested.backend.window()) {
                    nested.host_refresh_known = true;
                    if nested.output.set_refresh(refresh) {
                        nested
                            .frame_clock
                            .set_refresh(super::nested_timing::refresh_interval(refresh));
                        nested.state.set_output_refresh(refresh);
                        nested.request_redraw();
                    }
                }
                TimeoutAction::ToDuration(refresh_interval)
            },
        )
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    handle
        .insert_source(
            Timer::from_duration(PROCESS_CHECK_INTERVAL),
            |_, _, nested| {
                nested.process_maintenance();
                TimeoutAction::ToDuration(PROCESS_CHECK_INTERVAL)
            },
        )
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    handle
        .insert_source(
            Timer::from_duration(Duration::from_millis(16)),
            |_, _, nested| {
                if nested.host_frame_presented {
                    return TimeoutAction::Drop;
                }
                nested.request_redraw();
                TimeoutAction::ToDuration(Duration::from_millis(16))
            },
        )
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    handle
        .insert_source(winit, |event, _, nested| match event {
            WinitEvent::Resized { size, scale_factor } => {
                nested.handle_resized(size, scale_factor);
            }
            WinitEvent::Input(input) => {
                handle_input_event(
                    &mut nested.state,
                    &nested.keyboard,
                    &nested.pointer,
                    input,
                    nested.output.size,
                );
                if nested.state.scene_needs_frame() {
                    nested.request_redraw();
                }
            }
            WinitEvent::Focus(focused) => debug!(focused, "nested host focus changed"),
            WinitEvent::CloseRequested => nested.loop_signal.stop(),
            WinitEvent::Redraw => nested.render_frame(),
        })
        .map_err(|error| NestedError::EventSource(error.to_string()))?;

    Ok(())
}

#[derive(Debug, Error)]
pub enum NestedError {
    #[error("failed to create wayland display: {0}")]
    Display(#[from] smithay::reexports::wayland_server::backend::InitError),
    #[error("failed to initialize nested event loop: {0}")]
    Calloop(#[from] calloop::Error),
    #[error("failed to initialize nested winit backend: {0}")]
    Winit(#[from] smithay::backend::winit::Error),
    #[error("failed to initialize keyboard seat: {0}")]
    Keyboard(#[from] smithay::input::keyboard::Error),
    #[error("failed to bind wayland socket: {0}")]
    Socket(#[from] smithay::reexports::wayland_server::BindError),
    #[error("failed to register nested event source: {0}")]
    EventSource(String),
    #[error("failed to swap nested compositor buffer: {0}")]
    Swap(#[from] smithay::backend::SwapBuffersError),
    #[error("failed to render nested compositor frame: {0}")]
    Render(#[from] smithay::backend::renderer::gles::GlesError),
    #[error("nested compositor I/O failed: {0}")]
    Io(#[from] std::io::Error),
}

fn _keep_seat_type(_: &Seat<KestrelState>) {}
