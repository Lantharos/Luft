mod artwork;
mod cover;
mod flatpak;
mod request;
mod video;

use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::process::ExitCode;

use luft_software::apps::appimage::{self, Icon};

use request::{Kind, Request};

const HEAD_BYTES: u64 = 256;

fn icons(path: &Path) -> Result<Vec<Icon>, String> {
    if appimage::is_appimage(path) {
        return appimage::icons(path);
    }
    let mut head = Vec::new();
    File::open(path)
        .and_then(|file| file.take(HEAD_BYTES).read_to_end(&mut head))
        .map_err(|error| error.to_string())?;
    if flatpak::bundle::is_bundle(&head) {
        flatpak::bundle::icons(path)
    } else if flatpak::reference::is_reference(&head) {
        flatpak::reference::icons(path)
    } else {
        Err(format!("{} has no app icon", path.display()))
    }
}

fn app_icon(request: &Request) -> Result<(), String> {
    let icon = artwork::best(icons(&request.input)?, request.size)
        .ok_or_else(|| format!("{} has no app icon", request.input.display()))?;
    artwork::write(&icon, request.size, &request.output)
}

fn run(request: &Request) -> Result<(), String> {
    match request.kind {
        Kind::App => app_icon(request),
        Kind::Video => video::write(&request.input, request.size, &request.output),
        Kind::Cover => cover::write(&request.input, request.size, &request.output),
    }
}

fn main() -> ExitCode {
    let Some(request) = Request::parse(std::env::args_os().skip(1)) else {
        eprintln!("Usage: luft-thumbnailer -s SIZE [--video | --cover] INPUT OUTPUT");
        return ExitCode::from(2);
    };
    match run(&request) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}
