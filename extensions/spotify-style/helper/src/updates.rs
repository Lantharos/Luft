use std::io;
use std::path::Path;

use inotify::{Inotify, WatchMask};

const CURRENT_DEPLOYMENT: &str = "active";

/// Runs `updated` each time Flatpak swaps in a new Spotify, which comes without the theme.
pub fn follow(spotify: &Path, updated: impl Fn()) -> io::Result<()> {
    let deployments = spotify
        .ancestors()
        .find(|folder| folder.ends_with(CURRENT_DEPLOYMENT))
        .and_then(Path::parent);
    let Some(deployments) = deployments else {
        return Ok(());
    };
    let mut inotify = Inotify::init()?;
    inotify
        .watches()
        .add(deployments, WatchMask::CREATE | WatchMask::MOVED_TO)?;
    let mut buffer = [0; 1024];
    loop {
        let events = inotify.read_events_blocking(&mut buffer)?;
        if events
            .into_iter()
            .any(|event| event.name.is_some_and(|name| name == CURRENT_DEPLOYMENT))
        {
            updated();
        }
    }
}
