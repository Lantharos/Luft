use super::{LoopEvents, device::SessionDevice};
use crate::{
    backend::drm::{DrmError, estimated_vblank},
    session_services,
    state::KestrelState,
    xwayland::XwaylandSatellite,
};
use ::input::{Device as LibinputDevice, DeviceCapability as LibinputDeviceCapability};
use calloop::{
    EventLoop,
    timer::{TimeoutAction, Timer},
};
use smithay::{
    backend::session::Event as SessionEvent, reexports::wayland_server::ListeningSocket,
};
use std::time::Duration;
use tracing::info;

pub(super) fn register_input_device(
    devices: &mut Vec<LibinputDevice>,
    mut device: LibinputDevice,
    led_state: smithay::input::keyboard::LedState,
) {
    info!(
        name = %device.name(),
        sysname = %device.sysname(),
        keyboard = device.has_capability(LibinputDeviceCapability::Keyboard),
        pointer = device.has_capability(LibinputDeviceCapability::Pointer),
        touch = device.has_capability(LibinputDeviceCapability::Touch),
        "registered libinput device"
    );
    if !device.has_capability(LibinputDeviceCapability::Keyboard) {
        return;
    }
    device.led_update(led_state.into());
    devices.push(device);
}

pub(super) fn unregister_input_device(devices: &mut Vec<LibinputDevice>, device: &LibinputDevice) {
    info!(
        name = %device.name(),
        sysname = %device.sysname(),
        "removed libinput device"
    );
    devices.retain(|current| current.sysname() != device.sysname());
}

pub(super) fn update_keyboard_leds(
    devices: &mut [LibinputDevice],
    led_state: smithay::input::keyboard::LedState,
) {
    let leds = led_state.into();
    for device in devices {
        device.led_update(leds);
    }
}

pub(super) fn handle_session_events(
    events: &mut LoopEvents,
    device: &mut SessionDevice,
    active: &mut bool,
) -> Result<(), DrmError> {
    for event in events.session.drain(..) {
        match event {
            SessionEvent::PauseSession => {
                *active = false;
                device.pause();
                info!("paused DRM session");
            }
            SessionEvent::ActivateSession => {
                device.activate()?;
                *active = true;
                device.queue_full_redraws();
                info!("reactivated DRM session");
            }
        }
    }

    Ok(())
}

pub(super) fn update_xwayland_state(
    state: &mut KestrelState,
    xwayland: &XwaylandSatellite,
    socket_name: &str,
) {
    let xwayland_status = xwayland.status();
    if state.xwayland_status != xwayland_status {
        state.xwayland_status = xwayland_status;
        state.mark_scene_dirty();
    }
    let xwayland_display = xwayland.display().map(str::to_string);
    if state.xwayland_display != xwayland_display {
        state.xwayland_display = xwayland_display;
        session_services::sync_activation_environment(
            socket_name,
            state.xwayland_display.as_deref(),
        );
        state.mark_scene_dirty();
    }
}

pub(super) fn bind_socket(socket_name: Option<&str>) -> Result<ListeningSocket, DrmError> {
    match socket_name {
        Some(name) => ListeningSocket::bind(name),
        None => ListeningSocket::bind_auto("luft", 1..33),
    }
    .map_err(|error| DrmError::Unsupported(format!("failed to bind Wayland socket: {error}")))
}

pub(super) fn queue_estimated_vblank(
    device: &mut SessionDevice,
    event_loop: &EventLoop<LoopEvents>,
    output_name: &str,
    delay: Duration,
) -> Result<(), DrmError> {
    let Some(session_output) = device.output_by_name_mut(output_name) else {
        return Ok(());
    };
    if estimated_vblank::should_skip_queue(session_output) {
        return Ok(());
    }

    let output_name = output_name.to_string();
    let timer = Timer::from_duration(delay.max(Duration::from_micros(1)));
    let token = event_loop
        .handle()
        .insert_source(timer, move |_, _, events| {
            events.pending_estimated_vblanks.push(output_name.clone());
            TimeoutAction::Drop
        })
        .map_err(|error| {
            DrmError::Unsupported(format!(
                "failed to register estimated vblank timer: {error}"
            ))
        })?;
    estimated_vblank::mark_waiting(session_output, token);
    Ok(())
}
