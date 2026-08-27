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
    ) -> Result<Self, Box<dyn Error>> {
        let surfaces = Self {
            panel: WebSurface::new(WebSurfaceConfig {
                kind: WebShellSurface::Panel,
                size: (PANEL_WIDTH_HINT, PANEL_HEIGHT),
                visible: true,
                keep_alive_when_hidden: false,
                panel_menu_x: None,
                session_menu_qs_height: None,
                actions_tx: &actions_tx,
                snapshot,
            })?,
            panel_menu: LazyWebSurface::new(
                WebShellSurface::PanelMenu,
                panel_menu_size(snapshot),
                &actions_tx,
                snapshot,
            ),
            session_menu: LazyWebSurface::new(
                WebShellSurface::SessionMenu,
                session_menu_size(),
                &actions_tx,
                snapshot,
            ),
            start_menu: LazyWebSurface::new(
                WebShellSurface::StartMenu,
                (START_MENU_WIDTH, START_MENU_HEIGHT),
                &actions_tx,
                snapshot,
            ),
            quick: LazyWebSurface::new(
                WebShellSurface::QuickSettings,
                quick_settings_size(snapshot),
                &actions_tx,
                snapshot,
            ),
            date: LazyWebSurface::new(
                WebShellSurface::DateCenter,
                date_center_size(snapshot),
                &actions_tx,
                snapshot,
            ),
            notification_toast: LazyWebSurface::new(
                WebShellSurface::NotificationToast,
                notification_toast_size(snapshot),
                &actions_tx,
                snapshot,
            ),
            prewarm_index: 0,
            prewarm_at: Instant::now() + Duration::from_secs(1),
        };
        Ok(surfaces)
    }

    pub fn evaluate_snapshot(&mut self, snapshot: &WebShellSnapshot, json: &str) {
        self.panel.evaluate_snapshot(snapshot, json);
        self.panel_menu.resize(panel_menu_size(snapshot));
        self.panel_menu.evaluate_snapshot(snapshot, json);
        self.session_menu.evaluate_snapshot(snapshot, json);
        self.start_menu.evaluate_snapshot(snapshot, json);
        self.quick.resize(quick_settings_size(snapshot));
        self.quick.evaluate_snapshot(snapshot, json);
        self.date.resize(date_center_size(snapshot));
        self.date.evaluate_snapshot(snapshot, json);
        self.notification_toast
            .resize(notification_toast_size(snapshot));
        self.notification_toast.evaluate_snapshot(snapshot, json);
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

    pub fn set_session_menu_qs_height(&mut self, height: Option<i32>) {
        self.session_menu.set_session_menu_qs_height(height);
    }

    pub fn set_notification_toast_visible(&mut self, visible: bool) {
        self.notification_toast.set_visible(visible);
    }

    pub fn tick(&mut self) {
        self.prewarm_next_surface();
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
