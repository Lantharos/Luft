use std::path::{Path, PathBuf};

use crate::cli::perform::{Plan, Verb};
use crate::fedora;
use crate::files::{self, Opened};
use crate::library::sources::Bundled;
use crate::operations::{Job, Request};
use luft_software::system::repositories::Described;

const EXTENSIONS: [&str; 5] = [
    ".rpm",
    ".appimage",
    ".flatpak",
    ".flatpakref",
    ".flatpakrepo",
];

pub fn named(target: &str) -> bool {
    let lowered = target.to_lowercase();
    target.contains('/')
        || EXTENSIONS
            .iter()
            .any(|extension| lowered.ends_with(extension))
        || Path::new(target).is_file()
}

pub struct Prepared {
    pub plan: Plan,
    pub installed: bool,
    pub trust: Option<Described>,
}

fn job(opened: &Opened) -> Job {
    match opened {
        Opened::FlatpakRef { path, .. } => Job::InstallFlatpakRef { path: path.into() },
        Opened::FlatpakBundle { path, .. } => Job::InstallFlatpakBundle { path: path.into() },
        Opened::FlatpakRepo { path, name, .. } => Job::AddFlatpakRepo {
            path: path.into(),
            name: name.clone(),
        },
        Opened::Package { path, .. } if fedora::available() => {
            Job::Fedora(fedora::Job::InstallPackageFile { path: path.clone() })
        }
        Opened::Package {
            path,
            package,
            system: true,
            repository,
            ..
        } => Job::InstallSystemPackageFile {
            path: path.clone(),
            package: package.clone(),
            repository: repository.as_ref().map(|bundled| bundled.draft.clone()),
        },
        Opened::Package { path, .. } => Job::InstallToolFile { path: path.clone() },
        Opened::AppImage { path, .. } => Job::InstallAppImage { path: path.into() },
    }
}

fn title(opened: &Opened) -> &str {
    match opened {
        Opened::FlatpakRef { title, .. }
        | Opened::FlatpakBundle { title, .. }
        | Opened::FlatpakRepo { title, .. } => title,
        Opened::Package { package, .. } => package,
        Opened::AppImage { name, .. } => name,
    }
}

pub fn prepare(target: &str) -> Result<Prepared, String> {
    let path: PathBuf = std::path::absolute(target).map_err(|error| error.to_string())?;
    if !path.is_file() {
        return Err(format!("There's no file at {target}."));
    }
    let shown = path.to_string_lossy().into_owned();
    let opened = files::inspect(&shown)?;
    let installed = matches!(
        opened,
        Opened::Package {
            installed: true,
            ..
        }
    );
    let verb = if matches!(opened, Opened::FlatpakRepo { .. }) {
        Verb::AddSource
    } else {
        Verb::Install
    };
    let from = path
        .file_name()
        .filter(|_| !matches!(opened, Opened::FlatpakRef { .. }))
        .map(|name| name.to_string_lossy().into_owned());
    let trust = match &opened {
        Opened::Package {
            repository:
                Some(Bundled {
                    described,
                    added: false,
                    ..
                }),
            ..
        } => Some(described.clone()),
        _ => None,
    };
    if let Opened::Package {
        repository_error: Some(error),
        ..
    } = &opened
    {
        eprintln!(
            "It brings a software source Luft can't use, so it's installed by itself and won't get updates. {error}"
        );
    }
    Ok(Prepared {
        trust,
        plan: Plan {
            request: Request {
                key: format!("file:{shown}"),
                title: title(&opened).to_owned(),
                job: job(&opened),
                members: Vec::new(),
            },
            verb,
            from,
        },
        installed,
    })
}
