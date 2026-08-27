use super::{
    DrmError, DrmOptions, device, estimated_vblank,
    frame::{FrameResult, SessionFrameRenderer},
};
use crate::{
    client::ClientState,
    input::handle_input_event,
    ipc::IpcServer,
    scanout::send_frame_callbacks,
    session_services,
    shell::{ShellLaunch, ShellProcess},
    state::{KestrelState, idle::IdleRuntime},
    xwayland::XwaylandSatellite,
};
use calloop::{
    EventLoop,
    signals::{Signal, Signals},
};
use luft_ipc::{ShellStatus, shell_socket_path};
use smithay::{
    backend::{drm::DrmEvent, input::InputEvent, renderer::ImportDma, udev::UdevEvent},
    reexports::wayland_server::Display,
    utils::{Clock, Monotonic},
};
use std::{
    collections::BTreeMap,
    sync::Arc,
    time::{Duration, Instant},
};
use tracing::{debug, info, warn};

mod events;
mod output_config;
mod process;
mod support;
mod syncobj;
mod timing;

use events::{LoopEvents, VBlankEvent};
use output_config::{process_pending_output_apply, sync_runtime_outputs};
use process::process_timeout;
use support::{
    bind_socket, handle_session_events, queue_estimated_vblank, register_input_device,
    unregister_input_device, update_keyboard_leds, update_xwayland_state,
};
use syncobj::{clear_ready_syncobj_blockers, register_syncobj_sources};
use timing::{presentation_time, refresh_interval};

const IDLE_DISPATCH: Duration = Duration::from_millis(16);

pub fn run(options: DrmOptions) -> Result<(), DrmError> {
    let mut display: Display<KestrelState> = Display::new().map_err(|error| {
        DrmError::Unsupported(format!("failed to create Wayland display: {error}"))
    })?;
    let dh = display.handle();
    let opened = device::open(&dh, &options.config.display)?;
    let mut device = opened.device;
    let device::SessionSources {
        session_notifier,
        udev,
        drm_notifier,
        input,
    } = opened.sources;
    let mut state = KestrelState::new_for_outputs(&dh, options.config, device.descriptors());
    let mut idle_runtime = IdleRuntime::new(&mut state).map_err(|error| {
        DrmError::Unsupported(format!("idle timer initialization failed: {error}"))
    })?;
    device.link_compositor_outputs(&state);
    state.enable_dmabuf(
        device.dmabuf_main_device(),
        device.renderer.dmabuf_formats(),
    );
    state.enable_drm_syncobj(device.drm_device_fd());
    let ipc = IpcServer::bind()
        .map_err(|error| DrmError::Unsupported(format!("failed to bind IPC socket: {error}")))?;
    let shell_control_socket = shell_socket_path(ipc.path());
    state.shell_control_path = Some(shell_control_socket.clone());
    let listener = bind_socket(options.socket_name.as_deref())?;
    let socket_name = listener
        .socket_name()
        .and_then(|name| name.to_str())
        .unwrap_or("unknown")
        .to_string();
    let keyboard = state
        .seat
        .add_keyboard(Default::default(), 200, 200)
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to initialize keyboard seat: {error}"))
        })?;
    state.keyboard = Some(keyboard.clone());
    let pointer = state.seat.add_pointer();
    let mut keyboard_devices = Vec::new();
    let mut keyboard_led_state = keyboard.led_state();
    let mut frame_renderers = device
        .descriptors()
        .into_iter()
        .map(|descriptor| {
            (
                descriptor.name,
                SessionFrameRenderer::new(refresh_interval(descriptor.refresh_millihertz)),
            )
        })
        .collect::<BTreeMap<_, _>>();
    let presentation_clock = Clock::<Monotonic>::new();
    let mut clients = Vec::new();
    let mut active = true;
    let mut loop_events = LoopEvents::default();
    let mut event_loop = EventLoop::<LoopEvents>::try_new().map_err(|error| {
        DrmError::Unsupported(format!("failed to create session event loop: {error}"))
    })?;

    event_loop
        .handle()
        .insert_source(input, |event, _, data| data.input.push(event))
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to register libinput source: {error}"))
        })?;
    event_loop
        .handle()
        .insert_source(drm_notifier, |event, metadata, data| match event {
            DrmEvent::VBlank(crtc) => data.vblank.push(VBlankEvent {
                crtc,
                metadata: metadata.take(),
            }),
            DrmEvent::Error(error) => data.drm_errors.push(error.to_string()),
        })
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to register DRM source: {error}"))
        })?;
    event_loop
        .handle()
        .insert_source(udev, |event, _, data| data.udev.push(event))
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to register udev source: {error}"))
        })?;
    event_loop
        .handle()
        .insert_source(session_notifier, |event, _, data| data.session.push(event))
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to register libseat source: {error}"))
        })?;
    event_loop
        .handle()
        .insert_source(
            Signals::new(&[Signal::SIGCHLD]).map_err(|error| {
                DrmError::Unsupported(format!("failed to create SIGCHLD source: {error}"))
            })?,
            |event, _, data| {
                if event.signal() == Signal::SIGCHLD {
                    data.child_process_changed = true;
                }
            },
        )
        .map_err(|error| {
            DrmError::Unsupported(format!("failed to register SIGCHLD source: {error}"))
        })?;

    println!("Kestrel session compositor is running");
    println!("WAYLAND_DISPLAY={socket_name}");
    let mut xwayland = XwaylandSatellite::start(state.config.compositor.xwayland, &socket_name);
    state.xwayland_status = xwayland.status();
    state.xwayland_display = xwayland.display().map(str::to_string);
    if let Some(display) = &state.xwayland_display {
        println!("DISPLAY={display}");
    }
    session_services::start(&socket_name, state.xwayland_display.as_deref());
    let mut shell = ShellProcess::start(ShellLaunch {
        wayland_display: &socket_name,
        x11_display: state.xwayland_display.as_deref(),
        ipc_socket: ipc.path(),
        shell_socket: &shell_control_socket,
        output_refresh_millihertz: state.output_refresh_millihertz(),
        output_width: state.output_size().w,
        output_height: state.output_size().h,
        skip_startup_apps: false,
    });
    state.shell_status = shell.status();
    info!(
        wayland_display = %socket_name,
        ipc_socket = %ipc.path().display(),
        refresh_millihertz = state.output_refresh_millihertz(),
        outputs = device.descriptors().len(),
        "DRM session compositor ready"
    );

    loop {
        idle_runtime.dispatch(&mut state).map_err(|error| {
            DrmError::Unsupported(format!("idle timer dispatch failed: {error}"))
        })?;
        event_loop
            .dispatch(Some(Duration::ZERO), &mut loop_events)
            .map_err(|error| {
                DrmError::Unsupported(format!("session event dispatch failed: {error}"))
            })?;
        handle_session_events(&mut loop_events, &mut device, &mut active)?;
        if !active {
            device.discard_pending_frame();
        }
        clear_ready_syncobj_blockers(&mut loop_events, &mut state, &dh);
        for dmabuf in state.take_dmabuf_imports() {
            if let Err(error) = device.renderer.import_dmabuf(&dmabuf, None) {
                warn!(%error, "failed to import committed dmabuf");
            }
        }
        process_pending_output_apply(&mut state, &mut device, &mut frame_renderers);
        for event in loop_events.udev.drain(..) {
            if !device.handles_udev_event(&event) {
                continue;
            }
            match event {
                UdevEvent::Changed { .. } => {
                    if device.rescan_outputs(&state.config.display)? {
                        sync_runtime_outputs(&mut state, &mut device, &mut frame_renderers);
                        state.refresh_output_management();
                        if let Some(descriptor) = device.primary_descriptor() {
                            info!(
                                output = %descriptor.name,
                                width = descriptor.size.w,
                                height = descriptor.size.h,
                                outputs = device.descriptors().len(),
                                "DRM output graph changed"
                            );
                        } else {
                            info!("all DRM outputs disconnected; waiting for hotplug");
                        }
                    }
                }
                UdevEvent::Removed { .. } => {
                    return Err(DrmError::Unsupported(
                        "active DRM device was removed".to_string(),
                    ));
                }
                UdevEvent::Added { .. } => {}
            }
        }
        for error in loop_events.drm_errors.drain(..) {
            warn!(%error, "DRM event error");
        }
        for vblank in loop_events.vblank.drain(..) {
            let Some(mut submitted) = device.frame_submitted(vblank.crtc)? else {
                continue;
            };

            let (presentation, _presentation_instant) =
                presentation_time(&presentation_clock, vblank.metadata);
            let hardware_clock = presentation.is_some();
            if submitted.sequence == 1 {
                info!(
                    output = %submitted.descriptor_name,
                    sequence = submitted.sequence,
                    "presented first DRM scene frame"
                );
            } else {
                tracing::trace!(
                    output = %submitted.descriptor_name,
                    sequence = submitted.sequence,
                    "received DRM vblank"
                );
            }
            let Some(frame_time) = frame_renderers
                .get_mut(&submitted.descriptor_name)
                .map(|renderer| renderer.frame_presented(presentation))
            else {
                continue;
            };
            state.session_lock_presented(&submitted.descriptor_name);

            if state.outputs.output(&submitted.descriptor_name).is_some() {
                use smithay::reexports::wayland_protocols::wp::presentation_time::server::wp_presentation_feedback;
                let mut flags = wp_presentation_feedback::Kind::Vsync;
                if hardware_clock {
                    flags |= wp_presentation_feedback::Kind::HwClock
                        | wp_presentation_feedback::Kind::HwCompletion;
                }
                submitted.queued.presentation.presented(
                    frame_time.time(),
                    frame_time.refresh(),
                    frame_time.sequence(),
                    flags,
                );
            }

            if submitted.redraw_needed {
                device.queue_redraw(&submitted.descriptor_name);
            }
        }
        for output_name in loop_events.pending_estimated_vblanks.drain(..) {
            let animations_active = state.animations_active();
            {
                let Some(session_output) = device.output_by_name_mut(&output_name) else {
                    continue;
                };
                if let Some(token) = estimated_vblank::take_timer_token(session_output) {
                    event_loop.handle().remove(token);
                }
            };
            if animations_active {
                device.queue_redraw(&output_name);
            }
        }
        for event in loop_events.input.drain(..) {
            if active {
                match event {
                    InputEvent::DeviceAdded { device } => {
                        register_input_device(&mut keyboard_devices, device, keyboard_led_state);
                    }
                    InputEvent::DeviceRemoved { device } => {
                        unregister_input_device(&mut keyboard_devices, &device);
                    }
                    event => {
                        let output_size = state.output_size();
                        handle_input_event(&mut state, &keyboard, &pointer, event, output_size);
                        if let Some(led_state) = state.take_pending_keyboard_led_state() {
                            keyboard_led_state = led_state;
                            update_keyboard_leds(&mut keyboard_devices, keyboard_led_state);
                        }
                    }
                }
            }
        }

        let process_changed = loop_events.take_child_process_changed();
        let now = Instant::now();
        if process_changed || xwayland.restart_due(now) {
            xwayland.reap(&socket_name);
            update_xwayland_state(&mut state, &xwayland, &socket_name);
        }
        if state.take_shell_restart_requested() {
            shell.restart();
        } else if process_changed || shell.restart_due(now) {
            shell.reap(&mut state.config);
        }
        let shell_status = shell.status();
        if state.shell_status != shell_status {
            state.shell_status = shell_status;
            if shell_status != ShellStatus::Running {
                for renderer in frame_renderers.values_mut() {
                    renderer.reset_damage(&state);
                }
            }
            state.mark_scene_dirty();
        }
        if ipc
            .handle_pending(&mut state, &keyboard)
            .map_err(|error| DrmError::Unsupported(format!("IPC handling failed: {error}")))?
        {
            state.mark_scene_dirty();
        }

        while let Some(stream) = listener.accept().map_err(|error| {
            DrmError::Unsupported(format!("failed to accept Wayland client: {error}"))
        })? {
            let client = display
                .handle()
                .insert_client(stream, Arc::new(ClientState::default()))
                .map_err(|error| {
                    DrmError::Unsupported(format!("failed to insert Wayland client: {error}"))
                })?;
            clients.push(client);
            if clients.len() == 1 {
                info!("accepted first Wayland client");
            } else {
                debug!(connected_clients = clients.len(), "accepted wayland client");
            }
        }

        display
            .dispatch_clients(&mut state)
            .map_err(|error| DrmError::Unsupported(format!("Wayland dispatch failed: {error}")))?;
        register_syncobj_sources(&mut state, &event_loop)?;
        display
            .flush_clients()
            .map_err(|error| DrmError::Unsupported(format!("Wayland flush failed: {error}")))?;
        if active {
            for output in state.take_pending_redraws() {
                device.queue_redraw(&output);
            }
            if state.animations_active() {
                for output in device.output_names() {
                    device.queue_redraw(&output);
                }
            }
        }

        if active && device.any_output_should_render() {
            let mut results = Vec::new();
            for name in device.output_names() {
                let Some(output) = state.outputs.output(&name).cloned() else {
                    continue;
                };
                let Some(frame_renderer) = frame_renderers.get_mut(&name) else {
                    continue;
                };
                let frame_target =
                    presentation_clock.now() + frame_renderer.next_presentation_delay();
                state.set_render_output(Some(&name));
                state.signal_commit_timers(frame_target);
                let Some((renderer, session_output)) = device.renderer_and_output_by_name(&name)
                else {
                    state.set_render_output(None);
                    continue;
                };
                let force_full_damage = session_output.frame_state.force_full_damage();
                let result = frame_renderer.render(
                    &mut state,
                    renderer,
                    &output,
                    session_output,
                    force_full_damage,
                )?;
                let frame_callback_sequence = match &result {
                    FrameResult::Queued { .. } | FrameResult::NoDamage => {
                        Some(session_output.frame_state.frame_rendered())
                    }
                    FrameResult::Idle | FrameResult::Retry => None,
                };
                state.set_render_output(None);
                let estimated_vblank_delay = frame_renderer.next_presentation_delay();
                results.push((
                    name,
                    result,
                    estimated_vblank_delay,
                    frame_target,
                    frame_callback_sequence,
                ));
            }

            for (name, result, estimated_vblank_delay, frame_target, frame_callback_sequence) in
                results
            {
                if let Some(sequence) = frame_callback_sequence
                    && let Some(output) = state.outputs.output(&name).cloned()
                {
                    state.set_render_output(Some(&name));
                    state.signal_fifo_barriers();
                    state.set_render_output(None);
                    send_frame_callbacks(&state, &output, sequence, frame_target);
                }
                match result {
                    FrameResult::Queued {
                        cancel_estimated_vblank,
                    } => {
                        state.session_lock_frame_queued(&name);
                        if let Some(token) = cancel_estimated_vblank {
                            event_loop.handle().remove(token);
                        }
                    }
                    FrameResult::NoDamage => {
                        queue_estimated_vblank(
                            &mut device,
                            &event_loop,
                            &name,
                            estimated_vblank_delay,
                        )?;
                    }
                    FrameResult::Retry => {
                        queue_estimated_vblank(
                            &mut device,
                            &event_loop,
                            &name,
                            estimated_vblank_delay,
                        )?;
                    }
                    FrameResult::Idle => {}
                }
            }

            display.flush_clients().map_err(|error| {
                DrmError::Unsupported(format!("Wayland flush failed after frame: {error}"))
            })?;
        }

        if active && !device.frame_pending() {
            let now = Instant::now();
            let timeout = process_timeout(now, IDLE_DISPATCH, &shell, &xwayland);
            event_loop
                .dispatch(Some(timeout), &mut loop_events)
                .map_err(|error| {
                    DrmError::Unsupported(format!("session scheduled dispatch failed: {error}"))
                })?;
        } else if active {
            event_loop
                .dispatch(Some(IDLE_DISPATCH), &mut loop_events)
                .map_err(|error| {
                    DrmError::Unsupported(format!("session frame-pending dispatch failed: {error}"))
                })?;
        } else {
            let timeout = process_timeout(Instant::now(), IDLE_DISPATCH, &shell, &xwayland);
            event_loop
                .dispatch(Some(timeout), &mut loop_events)
                .map_err(|error| {
                    DrmError::Unsupported(format!("paused session dispatch failed: {error}"))
                })?;
        }
    }
}
