use crate::{
    scene_handle::{active_scratch_for_render, KestrelRenderHandle},
    state::KestrelState,
    window::ManagedWindow,
};
use luft_ipc::{WindowId, WorkspaceId};
use smithay::{
    backend::renderer::{
        element::AsRenderElements,
        gles::GlesRenderer,
    },
    desktop::{space::SpaceElement, Window},
    output::Output,
    utils::{IsAlive, Logical, Point, Rectangle, Scale, Physical},
    wayland::shell::xdg::ToplevelSurface,
};
use std::{
    cell::RefCell,
    hash::{Hash, Hasher},
};

#[derive(Debug)]
pub struct KestrelWindow {
    id: WindowId,
    inner: Window,
    titlebar_height: RefCell<i32>,
}

impl Clone for KestrelWindow {
    fn clone(&self) -> Self {
        Self {
            id: self.id,
            inner: self.inner.clone(),
            titlebar_height: RefCell::new(*self.titlebar_height.borrow()),
        }
    }
}

impl KestrelWindow {
    pub fn new(id: WindowId, surface: ToplevelSurface) -> Self {
        Self {
            id,
            inner: Window::new_wayland_window(surface),
            titlebar_height: RefCell::new(0),
        }
    }

    pub fn id(&self) -> WindowId {
        self.id
    }

    pub fn update_from_managed(&self, managed: &ManagedWindow) {
        *self.titlebar_height.borrow_mut() = managed.titlebar_height();
    }
}

impl IsAlive for KestrelWindow {
    fn alive(&self) -> bool {
        self.inner.alive()
    }
}

impl PartialEq for KestrelWindow {
    fn eq(&self, other: &Self) -> bool {
        self.inner == other.inner
    }
}

impl Eq for KestrelWindow {}

impl Hash for KestrelWindow {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.id.hash(state);
    }
}

impl SpaceElement for KestrelWindow {
    fn geometry(&self) -> Rectangle<i32, Logical> {
        SpaceElement::geometry(&self.inner)
    }

    fn bbox(&self) -> Rectangle<i32, Logical> {
        let titlebar = *self.titlebar_height.borrow();
        let mut bbox = self.inner.bbox();
        if titlebar > 0 {
            bbox.loc.y -= titlebar;
            bbox.size.h += titlebar;
        }
        bbox
    }

    fn is_in_input_region(&self, point: &Point<f64, Logical>) -> bool {
        let titlebar = *self.titlebar_height.borrow();
        if titlebar > 0 {
            let titlebar_rect = Rectangle::new(
                (0, -titlebar).into(),
                (self.inner.bbox().size.w, titlebar).into(),
            );
            if titlebar_rect.to_f64().contains(*point) {
                return true;
            }
        }
        SpaceElement::is_in_input_region(&self.inner, point)
    }

    fn z_index(&self) -> u8 {
        SpaceElement::z_index(&self.inner)
    }

    fn set_activate(&self, activated: bool) {
        SpaceElement::set_activate(&self.inner, activated);
    }

    fn output_enter(&self, output: &Output, overlap: Rectangle<i32, Logical>) {
        SpaceElement::output_enter(&self.inner, output, overlap);
    }

    fn output_leave(&self, output: &Output) {
        SpaceElement::output_leave(&self.inner, output);
    }

    fn refresh(&self) {
        SpaceElement::refresh(&self.inner);
    }
}

impl AsRenderElements<GlesRenderer> for KestrelWindow {
    type RenderElement = KestrelRenderHandle;

    fn render_elements<C: From<KestrelRenderHandle>>(
        &self,
        _renderer: &mut GlesRenderer,
        _location: Point<i32, Physical>,
        _scale: Scale<f64>,
        _alpha: f32,
    ) -> Vec<C> {
        let Some(scratch) = active_scratch_for_render() else {
            return Vec::new();
        };
        let Some(layer) = scratch.window_layers_by_id.get(&self.id) else {
            return Vec::new();
        };
        KestrelRenderHandle::handles_for_layer(self.id, layer)
            .into_iter()
            .map(C::from)
            .collect()
    }
}

#[derive(Debug, Clone, Copy)]
pub struct SpaceWindowRenderTarget {
    pub id: WindowId,
    pub offset_x: i32,
}

pub fn workspace_slide_offset(state: &KestrelState, workspace: &WorkspaceId) -> i32 {
    let Some(transition) = state.workspace_transition() else {
        return 0;
    };
    let width = state.output_size().w as f64;
    let direction = transition.direction as f64;
    if workspace == &transition.from {
        (-direction * width * transition.progress).round() as i32
    } else if workspace == &transition.to {
        (direction * width * (1.0 - transition.progress)).round() as i32
    } else {
        0
    }
}

pub fn space_window_render_targets(state: &KestrelState) -> Vec<SpaceWindowRenderTarget> {
    let mut targets = Vec::new();
    if let Some(transition) = state.workspace_transition() {
        append_workspace_render_targets(
            state,
            &transition.from,
            workspace_slide_offset(state, &transition.from),
            &mut targets,
        );
        append_workspace_render_targets(
            state,
            &transition.to,
            workspace_slide_offset(state, &transition.to),
            &mut targets,
        );
    } else {
        append_workspace_render_targets(
            state,
            state.layout.active_workspace(),
            0,
            &mut targets,
        );
    }
    targets
}

fn append_workspace_render_targets(
    state: &KestrelState,
    workspace: &WorkspaceId,
    offset_x: i32,
    targets: &mut Vec<SpaceWindowRenderTarget>,
) {
    for window in state.windows.render_windows_on_workspace(workspace) {
        targets.push(SpaceWindowRenderTarget {
            id: window.id,
            offset_x,
        });
    }
}
