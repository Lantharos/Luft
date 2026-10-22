mod bundle;
mod elf;
#[cfg(feature = "system")]
mod full_access;
mod integrate;
mod library;
mod update;

pub use bundle::{Bundle, Icon, icons, read as inspect};
pub use elf::{is_appimage, payload_offset};
#[cfg(feature = "system")]
pub use full_access::set_full_access;
pub use integrate::{
    FILES, Placement, SANDBOX, URIS, install, install_link, placement, remove, repair,
};
pub use library::{AppImage, IconSize, find, list};
pub use update::{Available, apply as update, check};
