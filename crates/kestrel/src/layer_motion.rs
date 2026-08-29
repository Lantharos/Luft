use std::{cell::RefCell, time::Duration, time::Instant};

use smithay::{
    backend::renderer::{element::Id, utils::RendererSurfaceStateUserData},
    desktop::layer_map_for_output,
    output::Output,
    utils::{Logical, Physical, Point, Rectangle, Scale, Size},
    wayland::compositor::with_states,
};

const STABLE_GEOMETRY_AGE: Duration = Duration::from_millis(8);

#[derive(Debug, Default)]
pub struct LayerMotionState {
    surfaces: RefCell<Vec<SurfaceMotion>>,
}

#[derive(Debug)]
struct SurfaceMotion {
    id: Id,
    target: Rectangle<i32, Logical>,
    candidate: Rectangle<i32, Logical>,
    candidate_since: Instant,
    transition: Option<LayerTransition>,
}

#[derive(Debug)]
struct LayerTransition {
    from: Point<i32, Logical>,
    to: Point<i32, Logical>,
    started_at: Instant,
    duration: Duration,
    opening: bool,
}

impl LayerTransition {
    fn location(&self, now: Instant) -> Point<i32, Logical> {
        let progress = (now.saturating_duration_since(self.started_at).as_secs_f32()
            / self.duration.as_secs_f32())
        .clamp(0.0, 1.0);
        let eased = if self.opening {
            1.0 - (1.0 - progress).powi(4)
        } else {
            progress.powi(3)
        };
        Point::from((
            lerp(self.from.x, self.to.x, eased),
            lerp(self.from.y, self.to.y, eased),
        ))
    }

    fn is_complete(&self, now: Instant) -> bool {
        now.saturating_duration_since(self.started_at) >= self.duration
    }
}

impl LayerMotionState {
    pub fn offsets(
        &self,
        output: &Output,
        scale: Scale<f64>,
        now: Instant,
    ) -> Vec<(Id, Point<i32, Physical>)> {
        let output_size = output
            .current_mode()
            .map(|mode| {
                output
                    .current_transform()
                    .transform_size(mode.size)
                    .to_f64()
                    .to_logical(output.current_scale().fractional_scale())
                    .to_i32_round()
            })
            .unwrap_or_default();
        let map = layer_map_for_output(output);
        let layers = map.layers().cloned().collect::<Vec<_>>();
        let mut surfaces = self.surfaces.borrow_mut();
        let mut offsets = Vec::new();
        let mut live_ids = Vec::new();

        for layer in layers {
            if !animates(layer.namespace()) {
                continue;
            }
            let Some(geometry) = map.layer_geometry(&layer) else {
                continue;
            };
            let id = Id::from_wayland_resource(layer.wl_surface());
            live_ids.push(id.clone());
            let mapped = with_states(layer.wl_surface(), |states| {
                states
                    .data_map
                    .get::<RendererSurfaceStateUserData>()
                    .is_some_and(|state| state.lock().unwrap().buffer().is_some())
            });
            if !mapped && !outside_output(geometry, output_size) {
                continue;
            }
            let motion = match surfaces.iter_mut().find(|motion| motion.id == id) {
                Some(motion) => motion,
                None => {
                    surfaces.push(SurfaceMotion {
                        id: id.clone(),
                        target: geometry,
                        candidate: geometry,
                        candidate_since: now,
                        transition: None,
                    });
                    surfaces.last_mut().unwrap()
                }
            };

            motion.observe(geometry, output_size, now, layer.namespace());
            if motion
                .transition
                .as_ref()
                .is_some_and(|transition| transition.is_complete(now))
            {
                motion.transition = None;
            }
            let visual_location = motion
                .transition
                .as_ref()
                .map(|transition| transition.location(now))
                .unwrap_or(motion.target.loc);
            if visual_location == geometry.loc {
                continue;
            }
            let offset = (visual_location - geometry.loc).to_physical_precise_round(scale);
            layer.with_surfaces(|surface, _| {
                offsets.push((Id::from_wayland_resource(surface), offset));
            });
        }
        drop(map);

        surfaces.retain(|motion| live_ids.iter().any(|id| id == &motion.id));
        offsets
    }
}

impl SurfaceMotion {
    fn observe(
        &mut self,
        geometry: Rectangle<i32, Logical>,
        output_size: Size<i32, Logical>,
        now: Instant,
        namespace: &str,
    ) {
        if self.candidate != geometry {
            self.candidate = geometry;
            self.candidate_since = now;
            return;
        }
        if self.target == geometry
            || now.saturating_duration_since(self.candidate_since) < STABLE_GEOMETRY_AGE
        {
            return;
        }

        let previous = self.target;
        if previous.size != geometry.size && !outside_output(geometry, output_size) {
            return;
        }
        self.target = geometry;
        let from_hidden = outside_output(previous, output_size);
        let to_hidden = outside_output(geometry, output_size);
        if from_hidden == to_hidden {
            self.transition = None;
            return;
        }

        let opening = from_hidden;
        let visual_from = self
            .transition
            .as_ref()
            .filter(|transition| transition.to == previous.loc)
            .map(|transition| transition.location(now))
            .unwrap_or(previous.loc);
        tracing::debug!(
            namespace,
            opening,
            from = ?visual_from,
            to = ?geometry.loc,
            "starting layer motion"
        );
        self.transition = Some(LayerTransition {
            from: visual_from,
            to: geometry.loc,
            started_at: now,
            duration: animation_duration(namespace, opening),
            opening,
        });
    }
}

fn animates(namespace: &str) -> bool {
    matches!(
        namespace,
        "luft-start-menu"
            | "luft-quick-settings"
            | "luft-date-center"
            | "luft-panel-menu"
            | "luft-session-menu"
            | "luft-notification-toast"
    )
}

fn animation_duration(namespace: &str, opening: bool) -> Duration {
    match (namespace, opening) {
        ("luft-session-menu", true) => Duration::from_millis(150),
        ("luft-session-menu", false) => Duration::from_millis(140),
        (_, true) => Duration::from_millis(190),
        (_, false) => Duration::from_millis(170),
    }
}

fn outside_output(rect: Rectangle<i32, Logical>, size: Size<i32, Logical>) -> bool {
    rect.loc.x + rect.size.w <= 0
        || rect.loc.y + rect.size.h <= 0
        || rect.loc.x >= size.w
        || rect.loc.y >= size.h
}

fn lerp(from: i32, to: i32, progress: f32) -> i32 {
    (from as f32 + (to - from) as f32 * progress).round() as i32
}
