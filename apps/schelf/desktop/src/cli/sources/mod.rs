pub mod fedora;
pub mod file;
pub mod flathub;
pub mod installed;
mod resolve;

pub use resolve::{Resolved, catalogs, resolve, search};

use crate::cli::perform::{Plan, Verb};
use crate::library::Source;
use crate::operations::{Job, Request};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Origin {
    Flathub,
    Fedora,
    AppImage,
    System,
}

impl Origin {
    pub const ALL: [Self; 4] = [Self::Flathub, Self::Fedora, Self::AppImage, Self::System];

    pub fn flag(self) -> &'static str {
        match self {
            Self::Flathub => "flathub",
            Self::Fedora => "fedora",
            Self::AppImage => "appimage",
            Self::System => "system",
        }
    }

    pub fn title(self) -> &'static str {
        match self {
            Self::Flathub => "Flathub",
            Self::Fedora => "Fedora",
            Self::AppImage => "AppImage",
            Self::System => "System package",
        }
    }

    pub fn heading(self) -> &'static str {
        match self {
            Self::AppImage => "AppImages",
            Self::System => "System packages",
            _ => self.title(),
        }
    }

    pub fn of(source: Source) -> Self {
        match source {
            Source::Flatpak => Self::Flathub,
            Source::Package | Source::Tool => Self::Fedora,
            Source::AppImage => Self::AppImage,
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
    Flathub,
    Fedora,
}

impl Catalog {
    pub const ALL: [Self; 2] = [Self::Flathub, Self::Fedora];

    pub fn origin(self) -> Origin {
        match self {
            Self::Flathub => Origin::Flathub,
            Self::Fedora => Origin::Fedora,
        }
    }

    pub fn title(self) -> &'static str {
        self.origin().title()
    }

    pub fn search(self, query: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Flathub => flathub::search(query),
            Self::Fedora => fedora::search(query),
        }
    }

    pub fn find(self, name: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Flathub => flathub::find(name),
            Self::Fedora => fedora::find(name),
        }
    }

    fn install(self, id: &str) -> (String, Job) {
        match self {
            Self::Flathub => (
                format!("flathub:{id}"),
                Job::InstallFlathub { id: id.to_owned() },
            ),
            Self::Fedora => fedora::install(id),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Kind {
    Desktop,
    Command,
}

impl Kind {
    pub fn describe(self) -> &'static str {
        match self {
            Self::Desktop => "desktop app",
            Self::Command => "command-line tool",
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

    pub fn plan(&self) -> Plan {
        let (key, job) = self.catalog.install(&self.id);
        Plan {
            request: Request {
                key,
                title: self.name.clone(),
                job,
                members: Vec::new(),
            },
            verb: Verb::Install,
            from: Some(self.catalog.title().to_owned()),
        }
    }
}
