use std::collections::HashMap;
use std::time::Instant;

use taffy::prelude::*;

use super::element::{Content, Element, Fill};
use crate::color::Color;
use crate::icons::Icons;
use crate::render::{Gpu, Rect, Scene};
use crate::text::{Text, TextStyle};

const TAP_SECONDS: f32 = 0.04;
const SETTLED: f32 = 0.004;
const TRACK: f32 = 4.0;
const KNOB: f32 = 16.0;

enum Action<M> {
    Press(M),
    Slide(fn(f32) -> M),
}

struct Hit<M> {
    rect: Rect,
    key: u64,
    action: Action<M>,
}

/// What laying out and drawing one frame found out.
pub struct Frame {
    pub height: f32,
    pub animating: bool,
}

/// The state of a surface between frames: where the pointer is, what it
/// holds, and the fills on their way to a new colour.
pub struct Ui<M> {
    hits: Vec<Hit<M>>,
    pointer: Option<(f32, f32)>,
    pressed: Option<u64>,
    fills: HashMap<u64, Color>,
    drawn: Option<Instant>,
}

struct Painter<'a, M> {
    tree: &'a TaffyTree<usize>,
    scale: f32,
    step: f32,
    text: &'a mut Text,
    icons: &'a mut Icons,
    gpu: &'a mut Gpu,
    scene: &'a mut Scene,
    hits: Vec<Hit<M>>,
    fills: &'a mut HashMap<u64, Color>,
    hovered: Option<u64>,
    pressed: Option<u64>,
    animating: bool,
}

impl<M: Clone> Ui<M> {
    pub fn new() -> Self {
        Self {
            hits: Vec::new(),
            pointer: None,
            pressed: None,
            fills: HashMap::new(),
            drawn: None,
        }
    }

    fn hovered(&self) -> Option<&Hit<M>> {
        let (x, y) = self.pointer?;
        self.hits.iter().rev().find(|hit| hit.rect.contains(x, y))
    }

    fn slide(&self, key: u64) -> Option<M> {
        let hit = self.hits.iter().find(|hit| hit.key == key)?;
        let Action::Slide(changed) = &hit.action else {
            return None;
        };
        let travel = hit.rect.width - KNOB;
        Some(changed(
            ((self.pointer?.0 - hit.rect.x - KNOB / 2.0) / travel).clamp(0.0, 1.0),
        ))
    }

    pub fn pointer_moved(&mut self, x: f32, y: f32) -> Option<M> {
        self.pointer = Some((x, y));
        self.slide(self.pressed?)
    }

    pub fn pointer_left(&mut self) {
        self.pointer = None;
    }

    pub fn pressed(&mut self) -> Option<M> {
        self.pressed = self.hovered().map(|hit| hit.key);
        self.slide(self.pressed?)
    }

    pub fn released(&mut self) -> Option<M> {
        let pressed = self.pressed.take()?;
        let hit = self.hovered().filter(|hit| hit.key == pressed)?;
        match &hit.action {
            Action::Press(message) => Some(message.clone()),
            Action::Slide(_) => None,
        }
    }

    /// Forgets what moved, so a surface opens settled.
    pub fn reset(&mut self) {
        *self = Self::new();
    }

    /// Lays `root` out at `width` logical pixels and draws it into `scene`.
    #[allow(clippy::too_many_arguments)]
    pub fn frame(
        &mut self,
        root: &Element<M>,
        width: f32,
        scale: f32,
        text: &mut Text,
        icons: &mut Icons,
        gpu: &mut Gpu,
        scene: &mut Scene,
    ) -> Frame {
        let mut tree = TaffyTree::new();
        let mut labels = Vec::new();
        let node = build(root, &mut tree, &mut labels);
        let style = Style {
            size: Size {
                width: length(width),
                height: auto(),
            },
            ..root.style.clone()
        };
        tree.set_style(node, style).expect("the root's style");
        let available = Size {
            width: AvailableSpace::Definite(width),
            height: AvailableSpace::MaxContent,
        };
        tree.compute_layout_with_measure(node, available, |input, _, label, style| {
            taffy::compute_leaf_layout(
                input,
                style,
                |_, _| 0.0,
                |_, _| {
                    label.map_or(Size::ZERO, |label| {
                        let (content, style): (&str, TextStyle) = labels[*label];
                        let (width, height) = text.measure(content, style, scale, None);
                        Size { width, height }
                    })
                },
            )
        })
        .expect("a tree Taffy lays out");

        let now = Instant::now();
        let elapsed = self
            .drawn
            .replace(now)
            .map_or(1.0, |drawn| (now - drawn).as_secs_f32());
        let hovered = self.hovered().map(|hit| hit.key);
        scene.clear();
        let mut painter = Painter {
            tree: &tree,
            scale,
            step: 1.0 - (-elapsed / TAP_SECONDS).exp(),
            text,
            icons,
            gpu,
            scene,
            hits: Vec::new(),
            fills: &mut self.fills,
            hovered,
            pressed: self.pressed,
            animating: false,
        };
        painter.paint(root, node, (0.0, 0.0));
        let animating = painter.animating;
        self.hits = painter.hits;
        if !animating {
            self.drawn = None;
        }
        Frame {
            height: tree.layout(node).expect("the root's layout").size.height,
            animating,
        }
    }
}

impl<M: Clone> Default for Ui<M> {
    fn default() -> Self {
        Self::new()
    }
}

fn build<'a, M>(
    element: &'a Element<M>,
    tree: &mut TaffyTree<usize>,
    labels: &mut Vec<(&'a str, TextStyle)>,
) -> NodeId {
    if let Content::Text { text, style } = &element.content {
        labels.push((text, *style));
        return tree
            .new_leaf_with_context(element.style.clone(), labels.len() - 1)
            .expect("a leaf");
    }
    let children: Vec<NodeId> = element
        .children
        .iter()
        .map(|child| build(child, tree, labels))
        .collect();
    tree.new_with_children(element.style.clone(), &children)
        .expect("a node")
}

impl<M: Clone> Painter<'_, M> {
    fn snapped(&self, rect: Rect) -> Rect {
        let left = (rect.x * self.scale).round();
        let top = (rect.y * self.scale).round();
        Rect {
            x: left,
            y: top,
            width: ((rect.x + rect.width) * self.scale).round() - left,
            height: ((rect.y + rect.height) * self.scale).round() - top,
        }
    }

    fn color(&mut self, element: &Element<M>) -> Color {
        let (rest, hover, pressed) = match element.fill {
            Fill::None => return Color::TRANSPARENT,
            Fill::Solid(color) => return color,
            Fill::States {
                rest,
                hover,
                pressed,
            } => (rest, hover, pressed),
        };
        let Some(key) = element.key else { return rest };
        let goal = if self.pressed == Some(key) && self.hovered == Some(key) {
            pressed
        } else if self.hovered == Some(key) && self.pressed.is_none() {
            hover
        } else {
            rest
        };
        let shown = self.fills.entry(key).or_insert(goal);
        *shown = shown.mix(goal, self.step);
        let apart = (shown.a - goal.a).abs()
            + (shown.r - goal.r).abs()
            + (shown.g - goal.g).abs()
            + (shown.b - goal.b).abs();
        if apart < SETTLED {
            *shown = goal;
        } else {
            self.animating = true;
        }
        *shown
    }

    fn paint(&mut self, element: &Element<M>, node: NodeId, origin: (f32, f32)) {
        let layout = self.tree.layout(node).expect("a laid out node");
        let rect = Rect {
            x: origin.0 + layout.location.x,
            y: origin.1 + layout.location.y,
            width: layout.size.width,
            height: layout.size.height,
        };
        let pixels = self.snapped(rect);
        let color = self.color(element);
        self.scene.fill(pixels, element.radius * self.scale, color);
        if let (Some(key), Some(message)) = (element.key, &element.press) {
            self.hits.push(Hit {
                rect,
                key,
                action: Action::Press(message.clone()),
            });
        }
        match &element.content {
            Content::None => {}
            Content::Text { text, style } => {
                self.text.draw(
                    self.gpu,
                    self.scene,
                    text,
                    *style,
                    self.scale,
                    None,
                    (pixels.x, pixels.y),
                );
            }
            Content::Icon { name, size, color } => {
                let side = (size * self.scale).round() as u32;
                if let Some(mask) = self.icons.mask(self.gpu, name, side) {
                    self.scene.mask(pixels.x, pixels.y, mask, *color);
                }
            }
            Content::Slider {
                value,
                color,
                changed,
            } => {
                let middle = rect.y + rect.height / 2.0;
                let knob = rect.x + (rect.width - KNOB) * value.clamp(0.0, 1.0);
                let track = Rect {
                    x: rect.x,
                    y: middle - TRACK / 2.0,
                    width: rect.width,
                    height: TRACK,
                };
                let filled = Rect {
                    width: knob - rect.x + KNOB / 2.0,
                    ..track
                };
                let handle = Rect {
                    x: knob,
                    y: middle - KNOB / 2.0,
                    width: KNOB,
                    height: KNOB,
                };
                let radius = TRACK / 2.0 * self.scale;
                self.scene
                    .fill(self.snapped(track), radius, color.alpha(0.25));
                self.scene.fill(self.snapped(filled), radius, *color);
                self.scene.fill(
                    self.snapped(handle),
                    KNOB / 2.0 * self.scale,
                    Color::rgba(255, 255, 255, 1.0),
                );
                if let Some(key) = element.key {
                    self.hits.push(Hit {
                        rect,
                        key,
                        action: Action::Slide(*changed),
                    });
                }
            }
        }
        let children = self.tree.children(node).expect("a node's children");
        for (child, node) in element.children.iter().zip(children) {
            self.paint(child, node, (rect.x, rect.y));
        }
    }
}
