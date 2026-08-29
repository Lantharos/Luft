use super::model::{WebPanelApp, WebShellSnapshot, WebWindow};
use crate::apps::normalize_launch_command;

pub(crate) const QUICK_SETTINGS_WIDTH: i32 = 420;
pub(crate) const NOTIFICATION_TOAST_WIDTH: i32 = 380;
pub(crate) const NOTIFICATION_TOAST_BASE_HEIGHT: i32 = 96;
pub(crate) const NOTIFICATION_TOAST_BODY_HEIGHT: i32 = 116;
pub(crate) const NOTIFICATION_TOAST_ACTION_HEIGHT: i32 = 140;
pub(crate) const DOCK_MENU_WIDTH: i32 = 228;
pub(crate) const SESSION_MENU_WIDTH: i32 = 188;
pub(crate) const SESSION_MENU_HEIGHT: i32 = 172;
pub(crate) const SESSION_MENU_RIGHT_MARGIN: i32 = 16;
pub(crate) const SESSION_MENU_TOP_OFFSET: i32 = 60;
pub(crate) const DATE_CENTER_WIDTH: i32 = 360;
const DATE_CENTER_COMPACT_HEIGHT: i32 = 560;
const DATE_CENTER_VERTICAL_MARGIN: i32 = 80;

pub(crate) fn quick_settings_size(snapshot: &WebShellSnapshot) -> (i32, i32) {
    let status_tiles = 1
        + i32::from(snapshot.status.network.is_some())
        + i32::from(snapshot.status.battery.is_some());
    let status_rows = (status_tiles + 1) / 2;
    let sliders = i32::from(snapshot.status.audio.is_some())
        + i32::from(snapshot.status.brightness.is_some());
    let mut height = 32 + 36 + 13 + status_rows * 58 + (status_rows - 1) * 10;
    if sliders > 0 {
        height += 13 + sliders * 58 + (sliders - 1) * 10;
    }
    (
        QUICK_SETTINGS_WIDTH,
        height.max(SESSION_MENU_TOP_OFFSET + SESSION_MENU_HEIGHT),
    )
}

pub(crate) fn session_menu_size() -> (i32, i32) {
    (SESSION_MENU_WIDTH, SESSION_MENU_HEIGHT)
}

pub(crate) fn notification_toast_size(snapshot: &WebShellSnapshot) -> (i32, i32) {
    let height = snapshot.toast_notifications.first().map_or(
        NOTIFICATION_TOAST_BASE_HEIGHT,
        |notification| {
            if !notification.actions.is_empty() {
                NOTIFICATION_TOAST_ACTION_HEIGHT
            } else if notification.body.trim().is_empty() {
                NOTIFICATION_TOAST_BASE_HEIGHT
            } else {
                NOTIFICATION_TOAST_BODY_HEIGHT
            }
        },
    );
    (NOTIFICATION_TOAST_WIDTH, height)
}

pub(crate) fn date_center_size(snapshot: &WebShellSnapshot) -> (i32, i32) {
    if snapshot.notifications.is_empty() {
        return (DATE_CENTER_WIDTH, DATE_CENTER_COMPACT_HEIGHT);
    }
    let output_height = std::env::var("LUFT_OUTPUT_HEIGHT")
        .ok()
        .and_then(|value| value.parse::<i32>().ok())
        .unwrap_or(DATE_CENTER_COMPACT_HEIGHT + DATE_CENTER_VERTICAL_MARGIN);
    (
        DATE_CENTER_WIDTH,
        (output_height - DATE_CENTER_VERTICAL_MARGIN).max(DATE_CENTER_COMPACT_HEIGHT),
    )
}

pub(crate) fn panel_menu_size(snapshot: &WebShellSnapshot) -> (i32, i32) {
    let Some(command) = &snapshot.panel_menu_command else {
        return (DOCK_MENU_WIDTH, 128);
    };
    let Some(app) = snapshot.panel_apps.iter().find(|entry| {
        normalize_launch_command(&entry.command) == normalize_launch_command(command)
    }) else {
        return (DOCK_MENU_WIDTH, 128);
    };
    let window = matched_window(app, &snapshot.windows);
    let can_launch = can_launch_app(app);
    let can_pin = app.pinned || can_launch;
    let (actions, groups) = if let Some(window) = window {
        let primary = i32::from(!window.active) + i32::from(can_launch);
        (
            primary + 3 + i32::from(can_pin) + 1,
            i32::from(primary > 0) + 1 + i32::from(can_pin) + 1,
        )
    } else {
        let primary = i32::from(can_launch);
        let danger = i32::from(app.running);
        (
            primary + i32::from(can_pin) + danger,
            i32::from(primary > 0) + i32::from(can_pin) + i32::from(danger > 0),
        )
    };
    (DOCK_MENU_WIDTH, panel_menu_height(actions, groups))
}

fn panel_menu_height(actions: i32, groups: i32) -> i32 {
    let row_gaps = (actions - groups).max(0) * 2;
    let group_separators = (groups - 1).max(0) * 13;
    66 + actions * 36 + row_gaps + group_separators
}

fn matched_window<'a>(app: &WebPanelApp, windows: &'a [WebWindow]) -> Option<&'a WebWindow> {
    windows
        .iter()
        .find(|window| window.active && window.visible && window_matches_app(window, app))
        .or_else(|| {
            windows
                .iter()
                .find(|window| window.visible && window_matches_app(window, app))
        })
        .or_else(|| {
            windows
                .iter()
                .find(|window| window_matches_app(window, app))
        })
}

fn window_matches_app(window: &WebWindow, app: &WebPanelApp) -> bool {
    if app.window_ids.contains(&window.id) {
        return true;
    }
    if app.window_id.is_some_and(|id| id == window.id) {
        return true;
    }
    let command = command_name(&app.command);
    let label = app.label.to_lowercase();
    [window.app_id.as_deref(), Some(window.title.as_str())]
        .into_iter()
        .flatten()
        .map(str::to_lowercase)
        .any(|text| {
            !text.is_empty()
                && ((!command.is_empty() && text.contains(&command))
                    || (!label.is_empty() && text.contains(&label)))
        })
}

fn can_launch_app(app: &WebPanelApp) -> bool {
    !app.command.starts_with("window:") && !app.command.starts_with("window-group:")
}

fn command_name(command: &str) -> String {
    command
        .split_whitespace()
        .next()
        .and_then(|value| value.rsplit('/').next())
        .unwrap_or_default()
        .trim_matches(['\'', '"'])
        .to_lowercase()
}
