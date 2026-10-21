mod bundle;
mod elf;
mod integrate;
mod library;
mod update;

pub use bundle::{Bundle, Icon, icons, read as inspect};
pub use elf::is_appimage;
pub use integrate::{Placement, install, install_link, placement, remove, repair};
pub use library::{AppImage, IconSize, find, list};
pub use update::{Available, apply as update, check};
