mod discover;
mod mounts;
mod session;

use std::path::Path;
use std::sync::OnceLock;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use session::{Answer, Session};

static FUSE_ROOT: OnceLock<String> = OnceLock::new();

#[derive(Deserialize)]
struct Address {
    uri: String,
}

pub fn is_remote(path: &str) -> bool {
    let root = FUSE_ROOT.get_or_init(|| {
        gio::glib::user_runtime_dir()
            .join("gvfs")
            .to_string_lossy()
            .into_owned()
    });
    Path::new(path).starts_with(root)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let session = Session::start(events.clone());
    window
        .with("network_locations", &session, |session, _: Value| {
            Ok(session.locations())
        })
        .with("network_connect", &session, |session, Address { uri }| {
            session.connect(uri)
        })
        .with("network_answer", &session, |session, answer: Answer| {
            session.answer(answer);
            Ok(())
        })
        .with(
            "network_disconnect",
            &session,
            |session, Address { uri }| session.disconnect(uri),
        )
        .with("network_discover", &session, |session, _: Value| {
            session.discover()
        })
}
