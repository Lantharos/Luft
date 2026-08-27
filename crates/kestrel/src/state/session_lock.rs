use super::KestrelState;
use smithay::{
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    wayland::session_lock::{LockSurface, SessionLocker},
};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Default)]
pub struct SessionLock {
    pub active: bool,
    pub confirmation: Option<SessionLocker>,
    pub pending_outputs: BTreeSet<String>,
    pub armed_outputs: BTreeSet<String>,
    pub surfaces: BTreeMap<String, LockSurface>,
}

impl KestrelState {
    pub fn session_locked(&self) -> bool {
        self.session_lock.active
    }

    pub fn lock_surface_for_output(&self) -> Option<&LockSurface> {
        self.session_lock.surfaces.get(&self.output().name())
    }

    pub fn lock_surface_roots(&self) -> Vec<WlSurface> {
        self.session_lock
            .surfaces
            .values()
            .filter(|surface| surface.alive())
            .map(|surface| surface.wl_surface().clone())
            .collect()
    }

    pub fn begin_session_lock(&mut self, confirmation: SessionLocker) {
        if self.session_lock.active {
            return;
        }

        self.session_lock.active = true;
        self.session_lock.confirmation = Some(confirmation);
        self.session_lock.pending_outputs = self
            .outputs
            .managed_outputs()
            .filter(|output| output.enabled)
            .map(|output| output.output.name())
            .collect();
        self.session_lock.surfaces.clear();
        self.session_lock.armed_outputs.clear();
        self.cursor_image = smithay::input::pointer::CursorImageStatus::Named(
            smithay::input::pointer::CursorIcon::Default,
        );
        self.frame_cursor_active = false;
        if let Some(keyboard) = self.keyboard.clone() {
            let serial = self.next_serial();
            keyboard.set_focus(self, None, serial);
        }
        self.mark_all_outputs_scene_dirty();

        if self.session_lock.pending_outputs.is_empty()
            && let Some(confirmation) = self.session_lock.confirmation.take()
        {
            confirmation.lock();
        }
    }

    pub fn end_session_lock(&mut self) {
        if !self.session_lock.active {
            return;
        }
        let surfaces = self.lock_surface_roots();
        for surface in &surfaces {
            self.leave_output(surface);
        }
        self.session_lock = SessionLock::default();
        self.mark_all_outputs_scene_dirty();
    }

    pub fn install_lock_surface(&mut self, output_name: String, surface: LockSurface) {
        if !self.session_lock.active {
            return;
        }
        self.enter_output(surface.wl_surface());
        self.session_lock
            .surfaces
            .insert(output_name, surface.clone());
        if let Some(keyboard) = self.keyboard.clone() {
            let serial = self.next_serial();
            keyboard.set_focus(self, Some(surface.wl_surface().clone()), serial);
        }
        self.mark_all_outputs_scene_dirty();
    }

    pub fn session_lock_presented(&mut self, output_name: &str) {
        if !self.session_lock.active {
            return;
        }
        if !self.session_lock.armed_outputs.remove(output_name) {
            return;
        }
        self.session_lock.pending_outputs.remove(output_name);
        if self.session_lock.pending_outputs.is_empty()
            && let Some(confirmation) = self.session_lock.confirmation.take()
        {
            confirmation.lock();
        }
    }

    pub fn session_lock_frame_queued(&mut self, output_name: &str) {
        if self.session_lock.active && self.session_lock.pending_outputs.contains(output_name) {
            self.session_lock
                .armed_outputs
                .insert(output_name.to_string());
        }
    }
}
