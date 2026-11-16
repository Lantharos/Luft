//! What the shell's own surfaces are built from: a Wayland surface Kestrel
//! treats as part of the desktop, a renderer for it, text, icons and a small
//! tree of elements laid out by Taffy.

pub mod app;
pub mod color;
pub mod icons;
pub mod render;
mod stats;
pub mod text;
pub mod ui;
pub mod wayland;
