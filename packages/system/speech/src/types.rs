use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Parakeet,
    Whisper,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EngineChoice {
    #[default]
    Automatic,
    Parakeet,
    Whisper,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Download {
    pub received: u64,
    pub total: u64,
    pub problem: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    pub id: String,
    pub engine: Engine,
    pub name: String,
    pub licence: String,
    pub credit: String,
    pub homepage: String,
    pub size: u64,
    pub installed: bool,
    pub usage: u64,
    pub download: Option<Download>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Language {
    pub code: String,
    pub name: String,
    pub engine: Engine,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    pub models: Vec<Model>,
    pub languages: Vec<Language>,
    pub language: Language,
    pub engine: Engine,
    /// The engines this computer's processor can run.
    pub engines: Vec<Engine>,
    /// The model dictation listens with now, unless the processor can't run it.
    pub model: Option<String>,
}
