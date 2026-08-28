use super::model::WebShellSurface;
use sabine::{ShellSurfaceMargin, WindowRegion};
use std::time::Duration;

pub(super) fn close_animation_duration(kind: WebShellSurface) -> Option<Duration> {
    match kind {
        WebShellSurface::StartMenu => Some(Duration::from_millis(170)),
        WebShellSurface::QuickSettings | WebShellSurface::DateCenter => {
            Some(Duration::from_millis(170))
        }
        WebShellSurface::PanelMenu | WebShellSurface::NotificationToast => {
            Some(Duration::from_millis(170))
        }
        WebShellSurface::SessionMenu => Some(Duration::from_millis(140)),
        WebShellSurface::Panel => None,
    }
}

pub(super) fn open_animation_duration(kind: WebShellSurface) -> Option<Duration> {
    match kind {
        WebShellSurface::StartMenu => Some(Duration::from_millis(190)),
        WebShellSurface::QuickSettings | WebShellSurface::DateCenter => {
            Some(Duration::from_millis(190))
        }
        WebShellSurface::PanelMenu | WebShellSurface::NotificationToast => {
            Some(Duration::from_millis(190))
        }
        WebShellSurface::SessionMenu => Some(Duration::from_millis(150)),
        WebShellSurface::Panel => None,
    }
}

pub(super) fn surface_margin_animates(kind: WebShellSurface) -> bool {
    matches!(
        kind,
        WebShellSurface::StartMenu
            | WebShellSurface::QuickSettings
            | WebShellSurface::DateCenter
            | WebShellSurface::PanelMenu
            | WebShellSurface::SessionMenu
            | WebShellSurface::NotificationToast
    )
}

pub(super) fn hidden_process_ttl(kind: WebShellSurface) -> Option<Duration> {
    match kind {
        WebShellSurface::StartMenu
        | WebShellSurface::QuickSettings
        | WebShellSurface::DateCenter
        | WebShellSurface::PanelMenu
        | WebShellSurface::SessionMenu
        | WebShellSurface::NotificationToast
        | WebShellSurface::Panel => None,
    }
}

pub(super) fn hidden_shell_margin(
    kind: WebShellSurface,
    base: ShellSurfaceMargin,
    size: (i32, i32),
) -> ShellSurfaceMargin {
    let mut margin = base;
    match kind {
        WebShellSurface::QuickSettings => {
            margin.bottom = -(size.1 + 8);
        }
        WebShellSurface::StartMenu => {
            margin.bottom = -(size.1 + 58);
        }
        WebShellSurface::PanelMenu => {
            margin.bottom = -(size.1 + 8);
        }
        WebShellSurface::SessionMenu => {
            margin.right = -(size.0 + 8);
        }
        WebShellSurface::NotificationToast => {
            margin.right = -(size.0 + 12);
        }
        WebShellSurface::DateCenter => {
            margin.right = -(size.0 + 8);
        }
        _ => {}
    }
    margin
}

pub(super) fn shell_blur_region(kind: WebShellSurface, _width: i32, _height: i32) -> WindowRegion {
    match kind {
        WebShellSurface::QuickSettings
        | WebShellSurface::DateCenter
        | WebShellSurface::SessionMenu => WindowRegion::adaptive_rounded_rect(26),
        WebShellSurface::NotificationToast => WindowRegion::adaptive_rounded_rect(22),
        WebShellSurface::StartMenu => WindowRegion::adaptive_rounded_rect(24),
        _ => WindowRegion::adaptive_full(),
    }
}
