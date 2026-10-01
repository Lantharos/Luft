mod bundle;
mod elf;
mod integrate;
mod library;
mod update;

pub use bundle::{Bundle, read as inspect};
pub use elf::is_appimage;
pub use integrate::{install, remove};
pub use library::{AppImage, find, list};
pub use update::{Available, apply as update, check};
