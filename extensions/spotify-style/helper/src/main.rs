mod live;
mod spicetify;
mod theme;
mod updates;

use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread;

use live::Stream;
use spicetify::Spicetify;

fn say(state: &str) {
    let mut output = io::stdout().lock();
    let _ = writeln!(output, "{state}");
    let _ = output.flush();
}

fn bring_up_to_date(spicetify: &Spicetify, theme: &Path) {
    match theme::install(spicetify, theme) {
        Ok(true) => say("restart"),
        Ok(false) => say("ready"),
        Err(error) => {
            eprintln!("Couldn't style Spotify: {error}");
            say("failed");
        }
    }
}

fn follow_updates(spicetify: Spicetify, theme: PathBuf) {
    thread::spawn(move || {
        let installed = spicetify.spotify();
        let followed = updates::follow(&installed, || bring_up_to_date(&spicetify, &theme));
        if let Err(error) = followed {
            eprintln!("Stopped following Spotify's updates: {error}");
        }
    });
}

fn start(stream: &Arc<Stream>) {
    let Some(spicetify) = Spicetify::find() else {
        return say("no-spicetify");
    };
    if !spicetify.spotify().is_dir() {
        return say("no-spotify");
    }
    if let Err(error) = Arc::clone(stream).listen(|| say("connected")) {
        eprintln!("Couldn't open the local stream: {error}");
        return say("failed");
    }
    let theme = PathBuf::from(std::env::var_os("LUFT_EXTENSION_DIR").expect("Kestrel sets it"))
        .join("theme");
    bring_up_to_date(&spicetify, &theme);
    follow_updates(spicetify, theme);
}

fn serve() {
    let stream = Arc::new(Stream::default());
    start(&stream);
    for line in io::stdin().lock().lines() {
        let Ok(line) = line else { return };
        stream.publish(line);
    }
}

fn main() {
    match std::env::args().nth(1).as_deref() {
        Some("restore") => {
            if let Some(spicetify) = Spicetify::find() {
                theme::restore(&spicetify);
            }
        }
        _ => serve(),
    }
}
