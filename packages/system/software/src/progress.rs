use serde::Serialize;
use specta::Type;

#[derive(Serialize, Clone, Copy, PartialEq, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Stage {
    Waiting,
    Preparing,
    Downloading,
    Installing,
    Removing,
    Finishing,
}

impl Stage {
    pub const ALL: [Self; 6] = [
        Self::Waiting,
        Self::Preparing,
        Self::Downloading,
        Self::Installing,
        Self::Removing,
        Self::Finishing,
    ];

    pub fn name(self) -> &'static str {
        match self {
            Self::Waiting => "waiting",
            Self::Preparing => "preparing",
            Self::Downloading => "downloading",
            Self::Installing => "installing",
            Self::Removing => "removing",
            Self::Finishing => "finishing",
        }
    }

    pub fn named(name: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|stage| stage.name() == name)
    }
}

#[derive(Serialize, Clone, Copy, PartialEq, Debug, Type)]
pub struct Progress {
    pub stage: Stage,
    pub fraction: Option<f32>,
}

impl Progress {
    pub fn new(stage: Stage, fraction: Option<f32>) -> Self {
        Self {
            stage,
            fraction: fraction.map(|fraction| fraction.clamp(0.0, 1.0)),
        }
    }
}

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Change {
    Refresh,
    Download,
    Update,
    Install,
    Remove,
}

pub type Report<'a> = &'a (dyn Fn(Progress) + Sync);
