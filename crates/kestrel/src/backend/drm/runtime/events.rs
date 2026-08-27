use smithay::{
    backend::{
        drm::DrmEventMetadata, input::InputEvent, libinput::LibinputInputBackend,
        session::Event as SessionEvent, udev::UdevEvent,
    },
    reexports::{drm::control::crtc, wayland_server::Client},
};

#[derive(Default)]
pub(super) struct LoopEvents {
    pub input: Vec<InputEvent<LibinputInputBackend>>,
    pub vblank: Vec<VBlankEvent>,
    pub drm_errors: Vec<String>,
    pub session: Vec<SessionEvent>,
    pub udev: Vec<UdevEvent>,
    pub syncobj_ready: Vec<Client>,
    pub child_process_changed: bool,
    pub pending_estimated_vblanks: Vec<String>,
}

pub(super) struct VBlankEvent {
    pub crtc: crtc::Handle,
    pub metadata: Option<DrmEventMetadata>,
}

impl LoopEvents {
    pub fn take_child_process_changed(&mut self) -> bool {
        std::mem::take(&mut self.child_process_changed)
    }
}
