use std::path::{Path, PathBuf};

use crate::cli::perform::{Plan, Verb};
use crate::files::{self, OpenedFile};
use crate::library::sources::CheckedSource;
use crate::operations::{Job, Request};
use luft_software::system::repositories::Described;

const EXTENSIONS: [&str; 6] = [
    ".rpm",
    ".deb",
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

fn job(opened: &OpenedFile) -> Job {
    match opened {
        OpenedFile::FlatpakRef { path, .. } => Job::InstallFlatpakRef { path: path.into() },
        OpenedFile::FlatpakBundle { path, .. } => Job::InstallFlatpakBundle { path: path.into() },
        OpenedFile::FlatpakRepo { path, name, .. } => Job::AddFlatpakRepo {
            path: path.into(),
            name: name.clone(),
        },
        OpenedFile::Package {
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
        OpenedFile::Package { path, .. } => Job::InstallToolFile { path: path.clone() },
        OpenedFile::AppImage { path, .. } => Job::InstallAppImage { path: path.into() },
        OpenedFile::Deb { path, .. } => Job::InstallDeb { path: path.into() },
    }
}

fn title(opened: &OpenedFile) -> &str {
    match opened {
        OpenedFile::FlatpakRef { title, .. }
        | OpenedFile::FlatpakBundle { title, .. }
        | OpenedFile::FlatpakRepo { title, .. } => title,
        OpenedFile::Package { package, .. } => package,
        OpenedFile::AppImage { name, .. } | OpenedFile::Deb { name, .. } => name,
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
        OpenedFile::Package {
            installed: true,
            ..
        } | OpenedFile::Deb {
            installed: true,
            ..
        }
    );
    if let OpenedFile::Deb {
        flathub: Some(flathub),
        ..
    } = &opened
    {
        eprintln!(
            "{} is on Flathub too, where it's sandboxed and keeps itself up to date: schelf install {} installs that instead.",
            flathub.name, flathub.id
        );
    }
    let verb = if matches!(opened, OpenedFile::FlatpakRepo { .. }) {
        Verb::AddSource
    } else {
        Verb::Install
    };
    let from = path
        .file_name()
        .filter(|_| !matches!(opened, OpenedFile::FlatpakRef { .. }))
        .map(|name| name.to_string_lossy().into_owned());
    let trust = match &opened {
        OpenedFile::Package {
            repository:
                Some(CheckedSource {
                    described,
                    added: false,
                    ..
                }),
            ..
        } => Some(described.clone()),
        _ => None,
    };
    if let OpenedFile::Package {
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
