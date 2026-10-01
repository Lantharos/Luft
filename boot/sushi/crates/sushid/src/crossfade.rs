use sushi::scene::tiny_skia::{Pixmap, PixmapPaint, Transform};
use sushi::scene::{Rect, Scene, Visuals, ease};

const SECONDS: f32 = 0.6;

pub struct Crossfade {
    ghosts: Vec<Scene>,
    since: Option<f32>,
}

impl Crossfade {
    pub fn between(previous: &Scene, scenes: &[Scene]) -> Option<Self> {
        let ghosts: Vec<Scene> = scenes
            .iter()
            .map(|scene| previous.stretched_to(scene.size()))
            .collect();
        let alike = ghosts
            .iter()
            .zip(scenes)
            .all(|(ghost, scene)| ghost.looks_like(scene));
        (!alike).then_some(Self {
            ghosts,
            since: None,
        })
    }

    pub fn progress(&mut self, now: f32) -> f32 {
        let since = *self.since.get_or_insert(now);
        ease((now - since) / SECONDS)
    }

    pub fn area(&self, index: usize, scene: &Scene, visuals: &Visuals) -> Option<Rect> {
        let ghost = self.ghosts[index].content_area(visuals);
        let next = scene.content_area(visuals);
        match (ghost, next) {
            (Some(ghost), Some(next)) => Some(ghost.union(&next)),
            (ghost, next) => ghost.or(next),
        }
    }

    pub fn render(
        &self,
        index: usize,
        scene: &Scene,
        area: Rect,
        visuals: &Visuals,
        progress: f32,
    ) -> Option<Pixmap> {
        let mut blended = self.ghosts[index].render(area, visuals)?;
        let next = scene.render(area, visuals)?;
        let paint = PixmapPaint {
            opacity: progress,
            ..PixmapPaint::default()
        };
        blended.draw_pixmap(0, 0, next.as_ref(), &paint, Transform::identity(), None);
        Some(blended)
    }
}
