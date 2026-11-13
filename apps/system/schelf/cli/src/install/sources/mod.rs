pub mod fedora;
pub mod file;
pub mod flathub;
pub mod installed;
mod resolve;
pub mod store;
pub mod system;

use schelf_core::host;
use schelf_core::library::Source;
use schelf_core::operations::{Job, Request};

use crate::install::Exit;
use crate::install::perform::{Plan, Verb};

pub use resolve::{Resolved, catalogs, resolve, search};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Origin {
    Store,
    Flathub,
    Fedora,
    AppImage,
    Debian,
    System,
}

impl Origin {
    pub const ALL: [Self; 6] = [
        Self::Store,
        Self::Flathub,
        Self::Fedora,
        Self::AppImage,
        Self::Debian,
        Self::System,
    ];

    pub fn flag(self) -> &'static str {
        match self {
            Self::Store => "store",
            Self::Flathub => "flathub",
            Self::Fedora => "fedora",
            Self::AppImage => "appimage",
            Self::Debian => "deb",
            Self::System => "system",
        }
    }

    pub fn title(self) -> &'static str {
        match self {
            Self::Store => "schelf.store",
            Self::Flathub => "Flathub",
            Self::Fedora => "Fedora",
            Self::AppImage => "AppImage",
            Self::Debian => "a .deb file",
            Self::System => "System package",
        }
    }

    pub fn heading(self) -> &'static str {
        match self {
            Self::AppImage => "AppImages",
            Self::Debian => "Apps from .deb files",
            Self::System => "System packages",
            Self::Store => "Schelf",
            _ => self.title(),
        }
    }

    pub fn of(source: Source) -> Self {
        match source {
            Source::Sabine | Source::Extension => Self::Store,
            Source::Flatpak => Self::Flathub,
            Source::Tool => Self::Fedora,
            Source::AppImage => Self::AppImage,
            Source::Debian => Self::Debian,
            Source::System => Self::System,
        }
    }

    pub fn catalog(self) -> Option<Catalog> {
        Catalog::ALL
            .into_iter()
            .find(|catalog| catalog.origin() == self)
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Catalog {
    Store,
    Flathub,
    Fedora,
    System,
}

impl Catalog {
    pub const ALL: [Self; 4] = [Self::Store, Self::Flathub, Self::Fedora, Self::System];

    pub fn origin(self) -> Origin {
        match self {
            Self::Store => Origin::Store,
            Self::Flathub => Origin::Flathub,
            Self::Fedora => Origin::Fedora,
            Self::System => Origin::System,
        }
    }

    pub fn title(self) -> &'static str {
        match self {
            Self::System => system::TITLE,
            _ => self.origin().title(),
        }
    }

    /// Why this computer can't use the catalog, when it can't.
    pub fn missing(self) -> Option<&'static str> {
        match self {
            Self::Flathub if !host::flatpak() => {
                Some("Apps from Flathub need Flatpak, which isn't installed here.")
            }
            Self::Fedora if !host::luft() => Some(
                "Fedora's apps and command-line tools need Luft, which this computer doesn't run.",
            ),
            Self::System if !host::luft() => {
                Some("System packages need Luft, which this computer doesn't run.")
            }
            _ => None,
        }
    }

    pub fn search(self, query: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Store => store::search(query),
            Self::Flathub => flathub::search(query),
            Self::Fedora => fedora::search(query),
            Self::System => system::search(query),
        }
    }

    pub fn find(self, name: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Store => store::find(name),
            Self::Flathub => flathub::find(name),
            Self::Fedora => fedora::find(name),
            Self::System => system::find(name),
        }
    }

    fn install(self, id: &str, kind: Kind, yes: bool) -> Result<(String, Job), Exit> {
        Ok(match (self, kind) {
            (Self::Store, _) => store::install(id, yes)?,
            (Self::Flathub, _) => (
                format!("flathub:{id}"),
                Job::InstallFlathub { id: id.to_owned() },
            ),
            (Self::Fedora, Kind::Desktop) | (Self::System, _) => system::install(id),
            (Self::Fedora, _) => fedora::install(id),
        })
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Kind {
    Desktop,
    Command,
    System,
    Extension,
}

impl Kind {
    pub fn describe(self) -> &'static str {
        match self {
            Self::Desktop => "desktop app",
            Self::Command => "command-line tool",
            Self::System => "system package",
            Self::Extension => "Luft extension",
        }
    }
}

#[derive(Clone, Debug)]
pub struct Candidate {
    pub catalog: Catalog,
    pub id: String,
    pub name: String,
    pub summary: String,
    pub kind: Kind,
    pub installed: bool,
}

impl Candidate {
    pub fn describe(&self) -> String {
        let id = if self.id == self.name {
            String::new()
        } else {
            format!(" ({})", self.id)
        };
        format!(
            "{}{id}, a {} from {}",
            self.name,
            self.kind.describe(),
            self.catalog.title()
        )
    }

    pub fn plan(&self, yes: bool) -> Result<Plan, Exit> {
        let (key, job) = self.catalog.install(&self.id, self.kind, yes)?;
        Ok(Plan {
            request: Request {
                key,
                title: self.name.clone(),
                job,
                members: Vec::new(),
            },
            verb: Verb::Install,
            from: Some(self.catalog.title().to_owned()),
        })
    }
}
