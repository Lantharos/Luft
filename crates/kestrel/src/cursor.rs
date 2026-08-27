use crate::state::KestrelState;
use smithay::input::pointer::{CursorIcon, CursorImageStatus};

impl KestrelState {
    pub(crate) fn set_frame_cursor(&mut self, icon: CursorIcon) {
        self.frame_cursor_active = true;
        if matches!(&self.cursor_image, CursorImageStatus::Named(current) if *current == icon) {
            return;
        }

        self.cursor_image = CursorImageStatus::Named(icon);
        self.mark_scene_content_dirty();
    }

    pub(crate) fn clear_frame_cursor(&mut self) {
        if !self.frame_cursor_active {
            return;
        }

        self.frame_cursor_active = false;
        self.cursor_image = CursorImageStatus::Named(CursorIcon::Default);
        self.mark_scene_content_dirty();
    }
}
