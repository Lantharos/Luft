use serde::Serialize;

#[derive(Serialize, Clone, Copy, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Stage {
    Waiting,
    Preparing,
    Downloading,
    Installing,
    Removing,
    Finishing,
}

#[derive(Serialize, Clone, Copy, PartialEq, Debug)]
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

pub type Report<'a> = &'a (dyn Fn(Progress) + Sync);
