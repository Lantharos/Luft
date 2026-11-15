pub mod fedora;
pub mod file;
pub mod flathub;
pub mod installed;
mod resolve;
pub mod store;
pub mod system;
pub mod tools;

use luft_i18n::t;
use schelf_core::host;
use schelf_core::library::Source;
use schelf_core::operations::{Job, Request};

use crate::install::Exit;
use crate::install::perform::{Plan, Verb};
use crate::l10n::L10N;

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

    pub fn title(self) -> String {
        match self {
            Self::Store => "schelf.store".to_owned(),
            Self::Flathub => "Flathub".to_owned(),
            Self::Fedora => "Fedora".to_owned(),
            Self::AppImage => "AppImage".to_owned(),
            Self::Debian => t!(L10N, "cli-origin-deb"),
            Self::System => t!(L10N, "cli-origin-system"),
        }
    }

    pub fn heading(self) -> String {
        match self {
            Self::AppImage => t!(L10N, "cli-heading-appimages"),
            Self::Debian => t!(L10N, "cli-heading-debs"),
            Self::System => t!(L10N, "cli-heading-system"),
            Self::Store => t!(L10N, "cli-heading-store"),
            _ => self.title(),
        }
    }

    pub fn of(source: Source) -> Self {
        match source {
            Source::Sabine | Source::Extension | Source::StoreTool => Self::Store,
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
    Tools,
    Flathub,
    Fedora,
    System,
}

impl Catalog {
    pub const ALL: [Self; 5] = [
        Self::Store,
        Self::Tools,
        Self::Flathub,
        Self::Fedora,
        Self::System,
    ];

    pub fn origin(self) -> Origin {
        match self {
            Self::Store | Self::Tools => Origin::Store,
            Self::Flathub => Origin::Flathub,
            Self::Fedora => Origin::Fedora,
            Self::System => Origin::System,
        }
    }

    pub fn title(self) -> String {
        match self {
            Self::System => t!(L10N, "cli-catalog-system"),
            _ => self.origin().title(),
        }
    }

    pub fn usable(self) -> bool {
        match self {
            Self::Flathub => host::flatpak(),
            Self::Fedora | Self::System => host::luft(),
            Self::Store | Self::Tools => true,
        }
    }

    /// Why this computer can't use the catalog, when it can't.
    pub fn missing(self) -> Option<String> {
        if self.usable() {
            return None;
        }
        Some(match self {
            Self::Flathub => t!(L10N, "cli-catalog-needs-flatpak"),
            Self::Fedora => t!(L10N, "cli-catalog-fedora-needs-luft"),
            _ => t!(L10N, "cli-needs-luft-system"),
        })
    }

    pub fn search(self, query: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Store => store::search(query),
            Self::Tools => Ok(Vec::new()),
            Self::Flathub => flathub::search(query),
            Self::Fedora => fedora::search(query),
            Self::System => system::search(query),
        }
    }

    pub fn find(self, name: &str) -> Result<Vec<Candidate>, String> {
        match self {
            Self::Store => store::find(name),
            Self::Tools => tools::find(name),
            Self::Flathub => flathub::find(name),
            Self::Fedora => fedora::find(name),
            Self::System => system::find(name),
        }
    }

    fn install(self, id: &str, kind: Kind, yes: bool) -> Result<(String, Job, bool), Exit> {
        let asked = |(key, job): (String, Job), asks: bool| (key, job, asks);
        Ok(match (self, kind) {
            (Self::Store, _) => store::install(id, yes)?,
            (Self::Tools, _) => asked(tools::install(id)?, true),
            (Self::Flathub, _) => (
                format!("flathub:{id}"),
                Job::InstallFlathub { id: id.to_owned() },
                false,
            ),
            (Self::Fedora, Kind::Desktop) | (Self::System, _) => asked(system::install(id), false),
            (Self::Fedora, _) => asked(fedora::install(id), false),
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
    pub fn key(self) -> &'static str {
        match self {
            Self::Desktop => "desktop",
            Self::Command => "command",
            Self::System => "system",
            Self::Extension => "extension",
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
        let source = self.catalog.title();
        if self.id == self.name {
            t!(
                L10N,
                "cli-candidate",
                name = self.name.as_str(),
                kind = self.kind.key(),
                source = source
            )
        } else {
            t!(
                L10N,
                "cli-candidate-with-id",
                name = self.name.as_str(),
                id = self.id.as_str(),
                kind = self.kind.key(),
                source = source
            )
        }
    }

    /// How to install it, and whether that waits for your yes along with the
    /// rest you asked for.
    pub fn plan(&self, yes: bool) -> Result<(Plan, bool), Exit> {
        let (key, job, asks) = self.catalog.install(&self.id, self.kind, yes)?;
        let plan = Plan {
            request: Request {
                key,
                title: self.name.clone(),
                job,
                members: Vec::new(),
            },
            verb: Verb::Install,
            from: Some(self.catalog.title()),
        };
        Ok((plan, asks))
    }
}
