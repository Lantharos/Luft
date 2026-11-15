use std::path::{Path, PathBuf};

use luft_i18n::t;
use luft_software::system::repositories::Described;
use schelf_core::files::{self, OpenedFile};
use schelf_core::library::sources::CheckedSource;
use schelf_core::operations::{Job, Request};
use schelf_core::{host, tools};

use crate::install::perform::{Plan, Verb};
use crate::l10n::L10N;

const EXTENSIONS: [&str; 6] = [
    ".rpm",
    ".deb",
    ".appimage",
    ".flatpak",
    ".flatpakref",
    ".flatpakrepo",
];

/// Whether `target` names a file rather than something to look for: a file
/// that's there, or a path or file name that isn't a tool's address.
pub fn named(target: &str) -> bool {
    if Path::new(target).is_file() {
        return true;
    }
    let lowered = target.to_lowercase();
    (target.contains('/') && !tools::is_address(target))
        || EXTENSIONS
            .iter()
            .any(|extension| lowered.ends_with(extension))
}

/// Why this computer can't install a file like `path`, when it can't.
fn unsupported(path: &str) -> Option<String> {
    let lowered = path.to_lowercase();
    let flatpak = [".flatpak", ".flatpakref", ".flatpakrepo"]
        .iter()
        .any(|extension| lowered.ends_with(extension));
    if flatpak && !host::flatpak() {
        return Some(t!(L10N, "cli-file-needs-flatpak"));
    }
    let package = lowered.ends_with(".rpm") || lowered.ends_with(".deb");
    (package && !host::luft()).then(|| t!(L10N, "cli-file-needs-luft"))
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
        OpenedFile::AppImage { path, .. } => Job::InstallAppImage {
            path: path.into(),
            full_access: false,
        },
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
        return Err(t!(L10N, "cli-file-missing", path = target));
    }
    let shown = path.to_string_lossy().into_owned();
    if let Some(reason) = unsupported(&shown) {
        return Err(reason);
    }
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
            "{}",
            t!(
                L10N,
                "cli-file-deb-on-flathub",
                name = flathub.name.as_str(),
                command = format!("schelf install {}", flathub.id)
            )
        );
    }
    if let OpenedFile::AppImage {
        name,
        unsandboxed: Some(reason),
        ..
    } = &opened
    {
        eprintln!(
            "{}",
            t!(
                L10N,
                "cli-file-appimage-unsandboxed",
                name = name.as_str(),
                reason = reason.as_str()
            )
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
            "{}",
            t!(L10N, "cli-file-source-unusable", error = error.as_str())
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
