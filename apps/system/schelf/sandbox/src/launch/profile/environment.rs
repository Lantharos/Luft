use std::ffi::OsString;
use std::path::Path;

use super::super::display::x11;
use super::super::folder;
use super::super::unsandboxed::NO_SANDBOX;
use super::{Arguments, INSIDE_APP, Profile, X11_AUTHORITY, data_folder};

const APP_RUN: &str = "/app/AppRun";
const ZYPAK: &str = "/usr/lib/zypak";
const ZYPAK_HELPER: &str = "zypak-helper";
const PASSED_ON: [&str; 13] = [
    "LANG",
    "LANGUAGE",
    "TZ",
    "XDG_CURRENT_DESKTOP",
    "XDG_SESSION_DESKTOP",
    "XDG_SESSION_TYPE",
    "DESKTOP_SESSION",
    "XCURSOR_THEME",
    "XCURSOR_SIZE",
    "GTK_IM_MODULE",
    "QT_IM_MODULE",
    "XMODIFIERS",
    "USER",
];
const PORTAL_FILE_CHOOSER: [(&str, &str); 3] = [
    ("GTK_USE_PORTAL", "1"),
    ("QT_QPA_PLATFORMTHEME", "xdgdesktopportal"),
    ("ELECTRON_OZONE_PLATFORM_HINT", "auto"),
];
const CHROMIUM_PORTALS: &str = "--xdg-portal-required-version=1";

fn zypak() -> Option<&'static Path> {
    let zypak = Path::new(ZYPAK);
    zypak.join(ZYPAK_HELPER).exists().then_some(zypak)
}

impl Profile<'_> {
    pub(super) fn environment(&self, home: &Path) -> Result<Arguments, String> {
        let runtime = folder::runtime_dir()?;
        let mut arguments = Arguments::default();
        arguments
            .flag("--clearenv")
            .set("HOME", home)
            .set("PATH", "/usr/bin:/bin")
            .set("XDG_RUNTIME_DIR", &runtime)
            .set(
                "DBUS_SESSION_BUS_ADDRESS",
                format!("unix:path={}", runtime.join("bus").display()),
            )
            .set("APPDIR", INSIDE_APP)
            .set("APPIMAGE", &self.app.image)
            .set("OWD", home)
            .set("DESKTOPINTEGRATION", "1")
            .set("CHROME_DESKTOP", format!("{}.desktop", self.app.id));
        let data = data_folder(home, &self.app.id)?;
        arguments
            .set("XDG_CONFIG_HOME", data.join(".config"))
            .set("XDG_DATA_HOME", data.join(".local/share"))
            .set("XDG_CACHE_HOME", data.join(".cache"))
            .set("XDG_STATE_HOME", data.join(".local/state"));
        if let Some(zypak) = zypak() {
            arguments.set("ZYPAK_BIN", zypak).set("ZYPAK_LIB", zypak);
        }
        if self.wayland.is_some() {
            arguments.set("WAYLAND_DISPLAY", "wayland-0");
        }
        if let Some(x11) = self.x11 {
            arguments.set("DISPLAY", x11::DISPLAY);
            if x11.authority.is_some() {
                arguments.set("XAUTHORITY", runtime.join(X11_AUTHORITY));
            }
        }
        for name in PASSED_ON {
            if let Some(value) = std::env::var_os(name) {
                arguments.set(name, value);
            }
        }
        for (name, value) in std::env::vars_os() {
            if name.to_string_lossy().starts_with("LC_") {
                arguments.set(&name.to_string_lossy(), value);
            }
        }
        for (name, value) in PORTAL_FILE_CHOOSER {
            arguments.set(name, value);
        }
        Ok(arguments)
    }

    /// Chromium and Electron start their helpers through Zypak, which asks
    /// the sandbox's portal for a sandbox of their own.
    pub(super) fn command(&self) -> Vec<OsString> {
        if !self.app.chromium {
            return vec![APP_RUN.into()];
        }
        match zypak() {
            Some(zypak) => vec![
                zypak.join(ZYPAK_HELPER).into(),
                "host".into(),
                "-".into(),
                APP_RUN.into(),
                CHROMIUM_PORTALS.into(),
            ],
            None => vec![APP_RUN.into(), NO_SANDBOX.into(), CHROMIUM_PORTALS.into()],
        }
    }
}
