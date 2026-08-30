use super::{
    actions::WebShellAction,
    model::{WebShellSnapshot, WebShellSurface},
    surface_motion::{
        close_animation_duration, hidden_process_ttl, hidden_shell_margin, open_animation_duration,
        surface_margin_animates,
    },
    web_surface::{WebSurface, WebSurfaceConfig},
};
use std::{sync::mpsc::Sender, time::Instant};
use tracing::warn;

pub(crate) struct LazyWebSurface {
    kind: WebShellSurface,
    size: (i32, i32),
    actions_tx: Sender<WebShellAction>,
    snapshot: WebShellSnapshot,
    visible: bool,
    show_at: Option<Instant>,
    hide_at: Option<Instant>,
    release_at: Option<Instant>,
    panel_menu_x: Option<i32>,
    session_menu_qs_height: Option<i32>,
    surface: Option<WebSurface>,
    frame_rate: u32,
}

impl LazyWebSurface {
    pub(super) fn new(
        kind: WebShellSurface,
        size: (i32, i32),
        actions_tx: &Sender<WebShellAction>,
        snapshot: &WebShellSnapshot,
        frame_rate: u32,
    ) -> Self {
        Self {
            kind,
            size,
            actions_tx: actions_tx.clone(),
            snapshot: snapshot.clone(),
            visible: false,
            show_at: None,
            hide_at: None,
            release_at: None,
            panel_menu_x: None,
            session_menu_qs_height: None,
            surface: None,
            frame_rate,
        }
    }

    pub(super) fn set_visible(&mut self, visible: bool) {
        if !visible {
            if !self.visible {
                if self.hide_at.is_some() {
                    return;
                }
                if self.surface.as_ref().is_none_or(|surface| !surface.visible) {
                    return;
                }
            }
            self.visible = false;
            self.show_at = None;
            if let Some(surface) = &mut self.surface {
                if let Some(delay) = close_animation_duration(self.kind) {
                    let now = Instant::now();
                    surface.set_surface_alpha(1.0);
                    surface.emit_surface_close();
                    surface.set_shell_margin(hidden_shell_margin(
                        self.kind,
                        surface.base_shell_margin(),
                        surface.size,
                    ));
                    self.hide_at = Some(now + delay);
                } else {
                    self.hide_at = None;
                    surface.set_surface_alpha(0.0);
                    surface.set_visible(false);
                    self.schedule_release(Instant::now());
                }
            }
            return;
        }

        if self.visible && self.hide_at.is_none() && self.surface.is_some() {
            return;
        }

        let now = Instant::now();
        let was_closing = self.hide_at.take().is_some();
        self.release_at = None;
        if self.surface.is_none() {
            self.ensure_created();
            if self.surface.is_none() {
                return;
            }
        }

        self.visible = true;
        if let Some(surface) = &mut self.surface {
            surface.resize(self.size);
            let open_duration = open_animation_duration(self.kind);
            let animates_margin = surface_margin_animates(self.kind);
            let target_margin = surface.base_shell_margin();
            if !was_closing && animates_margin {
                surface.set_shell_margin(hidden_shell_margin(
                    self.kind,
                    target_margin,
                    surface.size,
                ));
            }
            surface.set_shell_margin(target_margin);
            surface.set_visible_with_alpha(true, 1.0);
            surface.emit_surface_open();
            if let Some(duration) = open_duration.filter(|_| animates_margin) {
                self.show_at = Some(now + duration);
            } else {
                self.show_at = None;
                surface.set_surface_alpha(1.0);
            }
        }
    }

    pub(super) fn tick(&mut self) {
        if let Some(surface) = &mut self.surface {
            surface.tick_visibility();
        }
        let now = Instant::now();
        if let Some(show_at) = self.show_at
            && now >= show_at
        {
            self.show_at = None;
            if self.visible
                && let Some(surface) = &mut self.surface
            {
                surface.set_surface_alpha(1.0);
                surface.set_shell_margin(surface.base_shell_margin());
            }
        }

        if let Some(hide_at) = self.hide_at {
            if now < hide_at {
                return;
            }
            self.hide_at = None;
            if !self.visible {
                if let Some(surface) = &mut self.surface {
                    surface.set_surface_alpha(0.0);
                    surface.set_visible(false);
                }
                self.schedule_release(now);
            }
        }

        let Some(release_at) = self.release_at else {
            return;
        };
        if self.visible || self.hide_at.is_some() || self.show_at.is_some() || now < release_at {
            return;
        }
        self.release_at = None;
        if let Some(surface) = &mut self.surface {
            surface.release_hidden_process();
        }
    }

    pub(super) fn is_animating(&self) -> bool {
        self.show_at.is_some() || self.hide_at.is_some()
    }

    fn ensure_created(&mut self) {
        if self.surface.is_some() {
            return;
        }
        match WebSurface::new(WebSurfaceConfig {
            kind: self.kind,
            size: self.size,
            visible: false,
            keep_alive_when_hidden: true,
            panel_menu_x: self.panel_menu_x,
            session_menu_qs_height: self.session_menu_qs_height,
            actions_tx: &self.actions_tx,
            snapshot: &self.snapshot,
            frame_rate: self.frame_rate,
        }) {
            Ok(mut surface) => {
                if surface_margin_animates(self.kind) {
                    surface.set_shell_margin(hidden_shell_margin(
                        self.kind,
                        surface.base_shell_margin(),
                        surface.size,
                    ));
                }
                surface.evaluate_snapshot(&self.snapshot);
                self.surface = Some(surface);
            }
            Err(error) => {
                warn!(%error, surface = self.kind.as_str(), "failed to create web shell surface");
            }
        }
    }

    pub(super) fn prewarm(&mut self) {
        self.ensure_created();
        if let Some(surface) = &mut self.surface {
            surface.prewarm();
        }
        if !self.visible {
            self.schedule_release(Instant::now());
        }
    }

    pub(super) fn set_frame_rate(&mut self, frame_rate: u32) {
        self.frame_rate = frame_rate;
        if let Some(surface) = &mut self.surface {
            surface.set_frame_rate(frame_rate);
        }
    }

    pub(super) fn evaluate_snapshot(&mut self, snapshot: &WebShellSnapshot) {
        self.snapshot = snapshot.clone();
        if let Some(surface) = &mut self.surface {
            surface.evaluate_snapshot(snapshot);
        }
    }

    pub(super) fn resize(&mut self, size: (i32, i32)) {
        if self.size == size {
            return;
        }
        self.size = size;
        if let Some(surface) = &mut self.surface
            && (self.visible || self.show_at.is_some() || self.hide_at.is_some())
        {
            surface.resize(size);
        }
    }

    pub(super) fn set_panel_menu_x(&mut self, x: Option<i32>) {
        if self.panel_menu_x == x {
            return;
        }
        self.panel_menu_x = x;
        if let Some(surface) = &mut self.surface {
            surface.set_panel_menu_x(x);
        }
    }

    pub(super) fn set_session_menu_qs_height(&mut self, height: Option<i32>) {
        if self.session_menu_qs_height == height {
            return;
        }
        self.session_menu_qs_height = height;
        if let Some(surface) = &mut self.surface {
            surface.set_session_menu_qs_height(height);
            if self.visible && self.hide_at.is_none() {
                surface.set_shell_margin(surface.base_shell_margin());
            }
        }
    }

    fn schedule_release(&mut self, now: Instant) {
        self.release_at = hidden_process_ttl(self.kind).map(|ttl| now + ttl);
    }
}
