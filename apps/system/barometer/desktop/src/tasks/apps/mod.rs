mod desktop;
mod scopes;
mod windows;

pub use desktop::{AppInfo, Unit, is_desktop_app, is_shared};
pub use scopes::{CGROUPS, Scopes, members};
pub use windows::{OpenWindows, Window, Windowed};
