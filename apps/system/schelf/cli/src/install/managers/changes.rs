use std::io::IsTerminal;
use std::path::{Path, PathBuf};
use std::process::{Command as Process, Stdio};

use luft_i18n::t;

use super::arguments::{Asked, Manager};
use super::{hint, schelf};
use crate::install::Exit;
use crate::install::arguments::Command;
use crate::install::commands::{confirm, list_of};
use crate::install::sources::Origin;
use crate::l10n::L10N;

fn is_file(word: &str) -> bool {
    word.ends_with(".rpm") || word.contains('/')
}

fn on_system(word: &str) -> bool {
    Process::new("rpm")
        .args(["--query", "--quiet", "--whatprovides", word])
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

struct Downloads(PathBuf);

impl Downloads {
    fn new() -> Result<Self, Exit> {
        let cache = std::env::var_os("XDG_CACHE_HOME")
            .map(PathBuf::from)
            .or_else(|| std::env::home_dir().map(|home| home.join(".cache")))
            .ok_or(Exit::Failed)?;
        let folder = cache.join(format!("schelf-dnf-{}", std::process::id()));
        std::fs::create_dir_all(&folder).map_err(|error| {
            eprintln!("{error}");
            Exit::Failed
        })?;
        Ok(Self(folder))
    }

    fn fetch(&self, address: &str) -> Result<String, Exit> {
        let name = address.rsplit('/').next().unwrap_or(address);
        let path = self.0.join(name);
        let fetched = Process::new("curl")
            .args([
                "--fail",
                "--location",
                "--silent",
                "--show-error",
                "--output",
            ])
            .arg(&path)
            .arg(address)
            .status()
            .is_ok_and(|status| status.success());
        if !fetched {
            return Err(Exit::Failed);
        }
        Ok(path.to_string_lossy().into_owned())
    }
}

impl Drop for Downloads {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn names_of(words: &[String]) -> Vec<String> {
    words
        .iter()
        .map(|word| {
            Path::new(word)
                .file_name()
                .map_or_else(|| word.clone(), |name| name.to_string_lossy().into_owned())
        })
        .collect()
}

pub fn install(program: &str, manager: Manager, asked: Asked) -> Exit {
    let (present, wanted): (Vec<String>, Vec<String>) = asked
        .words
        .iter()
        .cloned()
        .partition(|word| on_system(word));
    for word in &present {
        eprintln!("{}", t!(L10N, "cli-install-already", name = word.as_str()));
    }
    if wanted.is_empty() {
        return if present.is_empty() {
            hint(program, manager)
        } else {
            Exit::Done
        };
    }
    let (files, names): (Vec<String>, Vec<String>) =
        wanted.into_iter().partition(|word| is_file(word));
    let shown: Vec<String> = names.iter().cloned().chain(names_of(&files)).collect();
    let question = t!(L10N, "cli-manager-install", names = list_of(&shown));
    if let Err(exit) = confirm(&question, asked.yes) {
        return exit;
    }
    let downloads = match Downloads::new() {
        Ok(downloads) => downloads,
        Err(exit) => return exit,
    };
    let files = match files
        .into_iter()
        .map(|file| {
            if file.contains("://") {
                downloads.fetch(&file)
            } else {
                Ok(file)
            }
        })
        .collect::<Result<Vec<String>, Exit>>()
    {
        Ok(files) => files,
        Err(exit) => return exit,
    };
    if manager != Manager::Dnf {
        return schelf(Command::Install, [names, files].concat(), None, asked.yes);
    }
    let install = |words: Vec<String>, only| {
        if words.is_empty() {
            Exit::Done
        } else {
            schelf(Command::Install, words, only, asked.yes)
        }
    };
    install(names, Some(Origin::System)).max(install(files, None))
}

pub fn remove(program: &str, manager: Manager, asked: Asked) -> Exit {
    if asked.words.is_empty() {
        return hint(program, manager);
    }
    let question = t!(L10N, "cli-manager-remove", names = list_of(&asked.words));
    if let Err(exit) = confirm(&question, asked.yes) {
        return exit;
    }
    let only = (manager == Manager::Dnf).then_some(Origin::System);
    schelf(Command::Remove, asked.words, only, true)
}

pub fn search(program: &str, manager: Manager, asked: Asked) -> Exit {
    if asked.words.is_empty() {
        return hint(program, manager);
    }
    if std::io::stdin().is_terminal() {
        let question = t!(L10N, "cli-manager-search", names = list_of(&asked.words));
        if let Err(exit) = confirm(&question, asked.yes) {
            return exit;
        }
    }
    let only = (manager == Manager::Dnf).then_some(Origin::System);
    schelf(Command::Search, asked.words, only, false)
}
