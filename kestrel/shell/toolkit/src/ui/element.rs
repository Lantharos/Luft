use taffy::prelude::*;

use crate::color::Color;
use crate::text::TextStyle;

/// What an element is filled with, at rest and under the pointer.
#[derive(Clone, Copy)]
pub enum Fill {
    None,
    Solid(Color),
    States {
        rest: Color,
        hover: Color,
        pressed: Color,
    },
}

pub(crate) enum Content<M> {
    None,
    Text {
        text: String,
        style: TextStyle,
    },
    Icon {
        name: &'static str,
        size: f32,
        color: Color,
    },
    Slider {
        value: f32,
        color: Color,
        changed: fn(f32) -> M,
    },
}

/// One node of a surface: a box that lays out its children, or a leaf of
/// text, an icon or a slider.
pub struct Element<M> {
    pub(crate) style: Style,
    pub(crate) fill: Fill,
    pub(crate) radius: f32,
    pub(crate) content: Content<M>,
    pub(crate) children: Vec<Element<M>>,
    pub(crate) key: Option<u64>,
    pub(crate) press: Option<M>,
}

pub const SLIDER_HEIGHT: f32 = 36.0;

fn element<M>(style: Style, content: Content<M>, children: Vec<Element<M>>) -> Element<M> {
    Element {
        style,
        fill: Fill::None,
        radius: 0.0,
        content,
        children,
        key: None,
        press: None,
    }
}

pub fn row<M>(children: Vec<Element<M>>) -> Element<M> {
    element(
        Style {
            flex_direction: FlexDirection::Row,
            ..Style::default()
        },
        Content::None,
        children,
    )
}

pub fn column<M>(children: Vec<Element<M>>) -> Element<M> {
    element(
        Style {
            flex_direction: FlexDirection::Column,
            ..Style::default()
        },
        Content::None,
        children,
    )
}

pub fn text<M>(text: impl Into<String>, style: TextStyle) -> Element<M> {
    element(
        Style::default(),
        Content::Text {
            text: text.into(),
            style,
        },
        Vec::new(),
    )
}

pub fn icon<M>(name: &'static str, size: f32, color: Color) -> Element<M> {
    let style = Style {
        size: Size {
            width: length(size),
            height: length(size),
        },
        flex_shrink: 0.0,
        ..Style::default()
    };
    element(style, Content::Icon { name, size, color }, Vec::new())
}

pub fn slider<M>(key: u64, value: f32, color: Color, changed: fn(f32) -> M) -> Element<M> {
    let style = Style {
        size: Size {
            width: auto(),
            height: length(SLIDER_HEIGHT),
        },
        flex_grow: 1.0,
        ..Style::default()
    };
    element(
        style,
        Content::Slider {
            value,
            color,
            changed,
        },
        Vec::new(),
    )
    .key(key)
}

impl<M> Element<M> {
    pub fn gap(mut self, gap: f32) -> Self {
        self.style.gap = Size {
            width: length(gap),
            height: length(gap),
        };
        self
    }

    pub fn padding(mut self, horizontal: f32, vertical: f32) -> Self {
        self.style.padding = Rect {
            left: length(horizontal),
            right: length(horizontal),
            top: length(vertical),
            bottom: length(vertical),
        };
        self
    }

    pub fn width(mut self, width: f32) -> Self {
        self.style.size.width = length(width);
        self.style.flex_shrink = 0.0;
        self
    }

    pub fn height(mut self, height: f32) -> Self {
        self.style.size.height = length(height);
        self.style.flex_shrink = 0.0;
        self
    }

    /// Shares the space left along its parent with the other elements that grow.
    pub fn grow(mut self) -> Self {
        self.style.flex_grow = 1.0;
        self.style.flex_basis = length(0.0);
        self.style.min_size.width = length(0.0);
        self
    }

    pub fn center(mut self) -> Self {
        self.style.align_items = AlignItems::CENTER;
        self
    }

    pub fn fill(mut self, color: Color) -> Self {
        self.fill = Fill::Solid(color);
        self
    }

    pub fn states(mut self, rest: Color, hover: Color, pressed: Color) -> Self {
        self.fill = Fill::States {
            rest,
            hover,
            pressed,
        };
        self
    }

    pub fn radius(mut self, radius: f32) -> Self {
        self.radius = radius;
        self
    }

    /// Names the element, so what the pointer does to it carries from one
    /// frame to the next.
    pub fn key(mut self, key: u64) -> Self {
        self.key = Some(key);
        self
    }

    pub fn on_press(mut self, message: M) -> Self {
        self.press = Some(message);
        self
    }
}
