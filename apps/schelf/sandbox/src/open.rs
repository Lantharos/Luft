//! Stands in for `xdg-open` for every AppImage, in its sandbox and out of it.
//! What the app opens goes to the desktop portal, which starts your app for
//! it in your own session, outside the sandbox and away from the app's own
//! folders, with the activation token of the click that asked for it.

use std::collections::HashMap;
use std::fs::File;
use std::path::{Path, PathBuf};

use luft_dbus_macros::introspect;
use zbus::{Connection, Fd, OwnedObjectPath, Variant, proxy};

use crate::files;

pub const XDG_OPEN: &str = "xdg-open";
const TOKEN_VARIABLES: [&str; 2] = ["XDG_ACTIVATION_TOKEN", "DESKTOP_STARTUP_ID"];
const SYNTAX_ERROR: i32 = 1;
const MISSING_FILE: i32 = 2;
const FAILED: i32 = 4;

#[introspect]
#[proxy(
    interface = "org.freedesktop.portal.OpenURI",
    default_service = "org.freedesktop.portal.Desktop",
    default_path = "/org/freedesktop/portal/desktop"
)]
trait OpenUri {
    #[zbus(name = "OpenURI")]
    fn open_uri(
        &self,
        parent_window: &str,
        uri: &str,
        options: HashMap<&str, Variant<'_>>,
    ) -> zbus::Result<OwnedObjectPath>;

    fn open_file(
        &self,
        parent_window: &str,
        fd: Fd<'_>,
        options: HashMap<&str, Variant<'_>>,
    ) -> zbus::Result<OwnedObjectPath>;
}

enum Target {
    File(PathBuf),
    Uri(String),
}

fn target(argument: &str) -> Target {
    if let Some(path) = files::decode(argument) {
        return Target::File(path);
    }
    let has_scheme = argument
        .split_once(':')
        .is_some_and(|(scheme, _)| !scheme.is_empty() && !scheme.contains('/'));
    if has_scheme {
        Target::Uri(argument.to_owned())
    } else {
        Target::File(Path::new(argument).to_path_buf())
    }
}

fn options() -> HashMap<&'static str, Variant<'static>> {
    TOKEN_VARIABLES
        .iter()
        .find_map(|variable| std::env::var(variable).ok())
        .filter(|token| !token.is_empty())
        .map(|token| ("activation_token", Variant::from(token)))
        .into_iter()
        .collect()
}

async fn open(target: Target) -> Result<(), (i32, String)> {
    let connection = Connection::session()
        .await
        .map_err(|error| (FAILED, error.to_string()))?;
    let portal = OpenUriProxy::new(&connection)
        .await
        .map_err(|error| (FAILED, error.to_string()))?;
    let opened = match target {
        Target::Uri(uri) => portal.open_uri("", &uri, options()).await,
        Target::File(path) => {
            let file = File::open(&path)
                .map_err(|error| (MISSING_FILE, format!("{}: {error}", path.display())))?;
            portal.open_file("", Fd::from(&file), options()).await
        }
    };
    opened
        .map(drop)
        .map_err(|error| (FAILED, error.to_string()))
}

/// Opens the one file or link `xdg-open` is given and returns its exit status.
pub fn run(arguments: &[String]) -> i32 {
    let [argument] = arguments else {
        eprintln!("Usage: xdg-open FILE-OR-URL");
        return SYNTAX_ERROR;
    };
    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(error) => {
            eprintln!("xdg-open: {error}");
            return FAILED;
        }
    };
    match runtime.block_on(open(target(argument))) {
        Ok(()) => 0,
        Err((code, error)) => {
            eprintln!("xdg-open: {error}");
            code
        }
    }
}
