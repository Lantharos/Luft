use std::collections::{BTreeMap, BTreeSet};
use std::ffi::OsString;
use std::io::{self, BufRead, Write};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use serde::Deserialize;

use crate::home::Home;
use crate::look::Look;
use crate::themes::{self, Problem, State, Theme};
use crate::watch::Folders;

/// What the extension wants, sent whole whenever any of it changes.
#[derive(Clone, Deserialize)]
pub struct Wanted {
    pub look: Look,
    pub apps: BTreeMap<String, bool>,
}

pub enum Event {
    Wanted(Box<Wanted>),
    Stirred(Watched, OsString),
    Said(&'static str, State),
}

#[derive(Clone, Copy, PartialEq)]
pub enum Watched {
    Theme(usize),
    Installations,
}

fn say(message: &serde_json::Value) {
    let mut output = io::stdout().lock();
    let _ = writeln!(output, "{message}");
    let _ = output.flush();
}

pub fn say_state(app: &str, state: State) {
    say(&serde_json::json!({ "app": app, "state": state }));
}

fn read_wanted(events: Sender<Event>) {
    thread::spawn(move || {
        for line in io::stdin().lock().lines() {
            let wanted = line.ok().and_then(|line| serde_json::from_str(&line).ok());
            let Some(wanted) = wanted else {
                eprintln!("The extension sent something unreadable");
                continue;
            };
            if events.send(Event::Wanted(Box::new(wanted))).is_err() {
                return;
            }
        }
        std::process::exit(0);
    });
}

struct Helper {
    themes: Vec<Box<dyn Theme>>,
    folders: Folders<Watched>,
    found: BTreeSet<&'static str>,
    wanted: Option<Wanted>,
    dressed: BTreeSet<&'static str>,
}

impl Helper {
    fn is_on(&self, id: &str) -> bool {
        self.wanted
            .as_ref()
            .is_some_and(|wanted| wanted.apps.get(id).copied().unwrap_or(false))
    }

    fn look_again(&mut self) {
        let found: BTreeSet<_> = self
            .themes
            .iter()
            .filter(|theme| theme.detect())
            .map(|theme| theme.id())
            .collect();
        if found != self.found {
            self.found = found;
            say(&serde_json::json!({ "found": self.found }));
        }
    }

    fn show(&mut self, index: usize, result: io::Result<State>) {
        let id = self.themes[index].id();
        match result {
            Ok(state) => say_state(id, state),
            Err(error) => {
                eprintln!("Couldn't dress {id}: {error}");
                let problem = error
                    .get_ref()
                    .and_then(|cause| cause.downcast_ref::<Problem>());
                let (state, detail) = problem.map_or(("failed", error.to_string()), |problem| {
                    (problem.state, problem.detail.clone())
                });
                say(&serde_json::json!({ "app": id, "state": state, "detail": detail }));
            }
        }
    }

    fn apply(&mut self, index: usize) {
        let Some(look) = self.wanted.as_ref().map(|wanted| wanted.look.clone()) else {
            return;
        };
        let result = self.themes[index].apply(&look);
        self.dressed.insert(self.themes[index].id());
        self.show(index, result);
    }

    fn restore(&mut self, index: usize) {
        let id = self.themes[index].id();
        if let Err(error) = self.themes[index].restore() {
            eprintln!("Couldn't restore {id}: {error}");
        }
        self.dressed.remove(id);
    }

    fn follow_folders(&mut self, index: usize) {
        self.folders
            .set(Watched::Theme(index), self.themes[index].watched());
    }

    fn settle(&mut self, previous: Option<Wanted>) {
        for index in 0..self.themes.len() {
            let id = self.themes[index].id();
            if !self.found.contains(id) {
                continue;
            }
            if !self.is_on(id) {
                if previous.is_none() || self.dressed.contains(id) {
                    self.restore(index);
                }
            } else if !self.dressed.contains(id) {
                self.apply(index);
            } else if let Some(wanted) = &self.wanted
                && previous
                    .as_ref()
                    .is_none_or(|before| before.look != wanted.look)
            {
                let result = self.themes[index].refresh(&wanted.look.clone());
                self.show(index, result);
            }
            self.follow_folders(index);
        }
    }

    fn handle(&mut self, event: Event) {
        match event {
            Event::Wanted(wanted) => {
                let previous = self.wanted.replace(*wanted);
                self.settle(previous);
            }
            Event::Said(app, state) => say_state(app, state),
            Event::Stirred(Watched::Installations, _) => {
                self.look_again();
                self.settle(self.wanted.clone());
            }
            Event::Stirred(Watched::Theme(index), name) => {
                if !self.themes[index].stirred_by(&name) {
                    return;
                }
                if self.is_on(self.themes[index].id()) {
                    self.apply(index);
                } else {
                    self.restore(index);
                }
                self.follow_folders(index);
            }
        }
    }
}

fn run(mut helper: Helper, events: &Receiver<Event>) {
    helper.look_again();
    for event in events {
        helper.handle(event);
    }
}

/// Runs until the extension goes away, sleeping until it says something or a watched file changes.
pub fn serve(home: &Home) -> io::Result<()> {
    let (sender, events) = mpsc::channel();
    let stirred = sender.clone();
    let mut folders = Folders::start(move |owner, name| {
        let _ = stirred.send(Event::Stirred(owner, name));
    })?;
    folders.set(Watched::Installations, home.installations());
    read_wanted(sender.clone());
    let themes = themes::all(home, &sender);
    drop(sender);
    run(
        Helper {
            themes,
            folders,
            found: BTreeSet::new(),
            wanted: None,
            dressed: BTreeSet::new(),
        },
        &events,
    );
    Ok(())
}

/// Undoes every theme, then waits for whatever can only be undone once an app has closed.
pub fn restore(home: &Home) -> io::Result<()> {
    let (ignored, _) = mpsc::channel();
    let mut themes = themes::all(home, &ignored);
    let (stirred, changes) = mpsc::channel();
    let mut folders = Folders::start(move |index, name| {
        let _ = stirred.send((index, name));
    })?;
    for (index, theme) in themes.iter_mut().enumerate() {
        if let Err(error) = theme.restore() {
            eprintln!("Couldn't restore {}: {error}", theme.id());
        }
        folders.set(index, theme.watched());
    }
    while themes.iter().any(|theme| !theme.watched().is_empty()) {
        let Ok((index, name)) = changes.recv() else {
            break;
        };
        if themes[index].stirred_by(&name) {
            themes[index].restore()?;
            folders.set(index, themes[index].watched());
        }
    }
    Ok(())
}
