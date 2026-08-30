use super::{
    lazy_surface::LazyWebSurface,
    web_surface::{WebSurface, WebSurfaceConfig},
};

use super::actions::WebShellAction;
use super::{
    model::{WebShellSnapshot, WebShellSurface},
    surface_layout::{PANEL_HEIGHT, PANEL_WIDTH_HINT},
    surface_sizing::{
        date_center_size, notification_toast_size, panel_menu_size, quick_settings_size,
        session_menu_size,
    },
};
use std::{
    error::Error,
    sync::mpsc::Sender,
    time::{Duration, Instant},
};

const START_MENU_WIDTH: i32 = 720;
const START_MENU_HEIGHT: i32 = 640;

pub struct WebSurfaces {
    pub start_menu: LazyWebSurface,
    pub quick: LazyWebSurface,
    pub date: LazyWebSurface,
    pub notification_toast: LazyWebSurface,
    panel_menu: LazyWebSurface,
    session_menu: LazyWebSurface,
    panel: WebSurface,
    prewarm_index: usize,
    prewarm_at: Instant,
}

impl WebSurfaces {
    pub fn new(
        actions_tx: Sender<WebShellAction>,
        snapshot: &WebShellSnapshot,
        frame_rate: u32,
    ) -> Result<Self, Box<dyn Error>> {
        let panel_snapshot = snapshot.project_for(WebShellSurface::Panel);
        let panel_menu_snapshot = snapshot.project_for(WebShellSurface::PanelMenu);
        let session_menu_snapshot = snapshot.project_for(WebShellSurface::SessionMenu);
        let start_menu_snapshot = snapshot.project_for(WebShellSurface::StartMenu);
        let quick_snapshot = snapshot.project_for(WebShellSurface::QuickSettings);
        let date_snapshot = snapshot.project_for(WebShellSurface::DateCenter);
        let toast_snapshot = snapshot.project_for(WebShellSurface::NotificationToast);
        let mut surfaces = Self {
            panel: WebSurface::new(WebSurfaceConfig {
                kind: WebShellSurface::Panel,
                size: (PANEL_WIDTH_HINT, PANEL_HEIGHT),
                visible: true,
                keep_alive_when_hidden: false,
                panel_menu_x: None,
                session_menu_qs_height: None,
                actions_tx: &actions_tx,
                snapshot: &panel_snapshot,
                frame_rate,
            })?,
            panel_menu: LazyWebSurface::new(
                WebShellSurface::PanelMenu,
                panel_menu_size(snapshot),
                &actions_tx,
                &panel_menu_snapshot,
                frame_rate,
            ),
            session_menu: LazyWebSurface::new(
                WebShellSurface::SessionMenu,
                session_menu_size(),
                &actions_tx,
                &session_menu_snapshot,
                frame_rate,
            ),
            start_menu: LazyWebSurface::new(
                WebShellSurface::StartMenu,
                (START_MENU_WIDTH, START_MENU_HEIGHT),
                &actions_tx,
                &start_menu_snapshot,
                frame_rate,
            ),
            quick: LazyWebSurface::new(
                WebShellSurface::QuickSettings,
                quick_settings_size(snapshot),
                &actions_tx,
                &quick_snapshot,
                frame_rate,
            ),
            date: LazyWebSurface::new(
                WebShellSurface::DateCenter,
                date_center_size(snapshot),
                &actions_tx,
                &date_snapshot,
                frame_rate,
            ),
            notification_toast: LazyWebSurface::new(
                WebShellSurface::NotificationToast,
                notification_toast_size(snapshot),
                &actions_tx,
                &toast_snapshot,
                frame_rate,
            ),
            prewarm_index: 0,
            prewarm_at: Instant::now() + Duration::from_secs(1),
        };
        surfaces
            .session_menu
            .set_session_menu_qs_height(Some(quick_settings_size(snapshot).1));
        Ok(surfaces)
    }

    pub fn evaluate_snapshot(&mut self, snapshot: &WebShellSnapshot) {
        let quick_settings_size = quick_settings_size(snapshot);
        self.panel
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::Panel));
        self.panel_menu.resize(panel_menu_size(snapshot));
        self.panel_menu
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::PanelMenu));
        self.session_menu
            .set_session_menu_qs_height(Some(quick_settings_size.1));
        self.session_menu
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::SessionMenu));
        self.start_menu
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::StartMenu));
        self.quick.resize(quick_settings_size);
        self.quick
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::QuickSettings));
        self.date.resize(date_center_size(snapshot));
        self.date
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::DateCenter));
        self.notification_toast
            .resize(notification_toast_size(snapshot));
        self.notification_toast
            .evaluate_snapshot(&snapshot.project_for(WebShellSurface::NotificationToast));
    }

    pub fn set_frame_rate(&mut self, frame_rate: u32) {
        self.panel.set_frame_rate(frame_rate);
        self.panel_menu.set_frame_rate(frame_rate);
        self.session_menu.set_frame_rate(frame_rate);
        self.start_menu.set_frame_rate(frame_rate);
        self.quick.set_frame_rate(frame_rate);
        self.date.set_frame_rate(frame_rate);
        self.notification_toast.set_frame_rate(frame_rate);
    }

    pub fn set_panel_visible(&mut self, visible: bool) {
        self.panel.set_visible(visible);
    }

    pub fn set_panel_menu_visible(&mut self, visible: bool) {
        self.panel_menu.set_visible(visible);
    }

    pub fn set_session_menu_visible(&mut self, visible: bool) {
        self.session_menu.set_visible(visible);
    }

    pub fn set_panel_menu_x(&mut self, x: Option<i32>) {
        self.panel_menu.set_panel_menu_x(x);
    }

    pub fn set_notification_toast_visible(&mut self, visible: bool) {
        self.notification_toast.set_visible(visible);
    }

    pub fn tick(&mut self) {
        self.prewarm_next_surface();
        self.panel.tick_visibility();
        self.panel_menu.tick();
        self.session_menu.tick();
        self.start_menu.tick();
        self.quick.tick();
        self.date.tick();
        self.notification_toast.tick();
    }

    fn prewarm_next_surface(&mut self) {
        let now = Instant::now();
        if now < self.prewarm_at {
            return;
        }
        let surface = match self.prewarm_index {
            0 => &mut self.start_menu,
            1 => &mut self.quick,
            2 => &mut self.date,
            3 => &mut self.panel_menu,
            4 => &mut self.session_menu,
            5 => &mut self.notification_toast,
            _ => return,
        };
        surface.prewarm();
        self.prewarm_index += 1;
        self.prewarm_at = now + Duration::from_secs(1);
    }

    pub fn is_animating(&self) -> bool {
        self.panel_menu.is_animating()
            || self.session_menu.is_animating()
            || self.start_menu.is_animating()
            || self.quick.is_animating()
            || self.date.is_animating()
            || self.notification_toast.is_animating()
    }
}
