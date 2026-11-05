mod spotify;
mod steam;
mod vesktop;

use std::error::Error;
use std::ffi::OsStr;
use std::fmt;
use std::io;
use std::path::PathBuf;
use std::sync::mpsc::Sender;

use crate::home::{Home, extension_folder};
use crate::look::Look;
use crate::serve::Event;

/// What's true of an app right now, by a name the extension turns into words.
pub type State = &'static str;

/// Why an app couldn't be dressed: the state that says what to do, and what it comes down to in the app's own words.
#[derive(Debug)]
pub struct Problem {
    pub state: State,
    pub detail: String,
}

impl Problem {
    pub fn new(state: State, detail: String) -> Self {
        Self { state, detail }
    }

    pub fn failed(detail: String) -> Self {
        Self::new("failed", detail)
    }
}

impl fmt::Display for Problem {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}: {}", self.state, self.detail)
    }
}

impl Error for Problem {}

impl From<Problem> for io::Error {
    fn from(problem: Problem) -> Self {
        Self::other(problem)
    }
}

/// One app Tailor dresses. Every method runs on the helper's one working thread.
pub trait Theme {
    /// The app's name in settings and messages, which is also its folder here.
    fn id(&self) -> &'static str;
    /// Whether the app is on this computer, natively or as a Flatpak.
    fn detect(&self) -> bool;
    /// Puts the theme in place. Runs again whenever something watched stirs, and changes only what's missing.
    fn apply(&mut self, look: &Look) -> io::Result<State>;
    /// Follows a new look, on an app that already has the theme.
    fn refresh(&mut self, look: &Look) -> io::Result<State>;
    /// Leaves the app exactly as it was before. Runs again when something watched stirs, until `watched` is empty.
    fn restore(&mut self) -> io::Result<()>;
    /// The folders to sleep on: while the theme is on, where the app may undo it, and while it's off, what `restore`
    /// still waits for.
    fn watched(&self) -> Vec<PathBuf>;
    /// Whether a change to this name in a watched folder means `apply` or `restore` has something to do.
    fn stirred_by(&self, name: &OsStr) -> bool;
}

pub fn all(home: &Home, events: &Sender<Event>) -> Vec<Box<dyn Theme>> {
    let assets = extension_folder().join("themes");
    vec![
        Box::new(spotify::Spotify::new(
            home.clone(),
            assets.join("spotify"),
            events.clone(),
        )),
        Box::new(steam::Steam::new(home.clone(), assets.join("steam"))),
        Box::new(vesktop::Vesktop::new(
            home.clone(),
            assets.join("vesktop/fonts.css"),
        )),
    ]
}
