use crate::output::DEFAULT_REFRESH_MILLIHERTZ;
use smithay::reexports::winit::window::Window as WinitWindow;
use std::time::Duration;

pub(super) fn host_refresh_millihertz(window: &WinitWindow) -> Option<i32> {
    window
        .current_monitor()
        .and_then(|monitor| monitor.refresh_rate_millihertz())
        .and_then(|refresh| i32::try_from(refresh).ok())
        .filter(|refresh| *refresh > 0)
}

pub(super) fn refresh_interval(refresh_millihertz: i32) -> Duration {
    let refresh = u64::try_from(refresh_millihertz)
        .ok()
        .filter(|refresh| *refresh > 0)
        .unwrap_or(DEFAULT_REFRESH_MILLIHERTZ as u64);
    Duration::from_nanos((1_000_000_000_000u64 + refresh / 2) / refresh)
}
