use crate::{
    space_window::{KestrelWindow, space_window_render_targets, workspace_slide_offset},
    state::KestrelState,
};
use luft_ipc::WindowId;
use smithay::{
    utils::{Logical, Point},
    wayland::shell::xdg::ToplevelSurface,
};

pub fn sync_window_to_space(state: &mut KestrelState, _id: WindowId) {
    sync_visible_windows(state);
}

fn map_kestrel_window(
    state: &mut KestrelState,
    kw: &KestrelWindow,
    managed: &crate::window::ManagedWindow,
) {
    kw.update_from_managed(managed);
    let location = slide_content_location(managed, workspace_slide_offset(state, &managed.workspace));
    state.space.map_element(kw.clone(), location, false);
}

fn update_kestrel_window_location(
    state: &mut KestrelState,
    kw: &KestrelWindow,
    managed: &crate::window::ManagedWindow,
) {
    kw.update_from_managed(managed);
    let location = slide_content_location(managed, workspace_slide_offset(state, &managed.workspace));
    if state.space.elements().any(|element| element == kw) {
        state.space.relocate_element(kw, location);
    } else {
        state.space.map_element(kw.clone(), location, false);
    }
}

fn slide_content_location(
    managed: &crate::window::ManagedWindow,
    offset_x: i32,
) -> Point<i32, Logical> {
    let content = managed.content_location();
    Point::from((content.x + offset_x, content.y))
}

pub fn remove_window_from_space(state: &mut KestrelState, id: WindowId) {
    if let Some(window) = state.space_windows.remove(&id)
        && state.space.elements().any(|element| element == &window)
    {
        state.space.unmap_elem(&window);
    }
}

pub fn unmap_toplevel_from_space(state: &mut KestrelState, surface: &ToplevelSurface) {
    let Some(id) = state.windows.id_for_surface(surface) else {
        return;
    };
    remove_window_from_space(state, id);
}

pub fn sync_active_workspace(state: &mut KestrelState) {
    sync_visible_windows(state);
}

pub fn sync_visible_windows(state: &mut KestrelState) {
    let targets = space_window_render_targets(state);
    let visible: std::collections::HashSet<WindowId> = targets.iter().map(|target| target.id).collect();

    for id in state
        .space_windows
        .keys()
        .copied()
        .collect::<Vec<_>>()
        .into_iter()
    {
        if !visible.contains(&id) {
            remove_window_from_space(state, id);
        }
    }

    for target in &targets {
        let Some(managed) = state.windows.window(target.id).cloned() else {
            continue;
        };
        let kw = state
            .space_windows
            .entry(target.id)
            .or_insert_with(|| KestrelWindow::new(target.id, managed.surface.clone()))
            .clone();
        let mapped = state.space.elements().any(|element| element == &kw);
        if mapped {
            update_kestrel_window_location(state, &kw, &managed);
        } else {
            map_kestrel_window(state, &kw, &managed);
        }
    }

    for target in targets.iter().rev() {
        if let Some(kw) = state.space_windows.get(&target.id) {
            state.space.raise_element(kw, false);
        }
    }
}

pub fn refresh_space(state: &mut KestrelState) {
    sync_visible_windows(state);
    state.space.refresh();
}
