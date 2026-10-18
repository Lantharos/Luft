use std::sync::LazyLock;

use luft_speech::types::Engine;
use serde::Deserialize;

const MANIFEST: &str = include_str!("../../../data/models.json");

#[derive(Deserialize)]
struct Manifest {
    mirror: String,
    models: Vec<Entry>,
}

#[derive(Debug, Deserialize)]
pub struct Entry {
    pub id: String,
    pub engine: Engine,
    pub name: String,
    pub licence: String,
    pub credit: String,
    pub homepage: String,
    pub files: Vec<File>,
}

#[derive(Debug, Deserialize)]
pub struct File {
    pub name: String,
    pub size: u64,
    pub sha256: String,
}

static PARSED: LazyLock<Manifest> =
    LazyLock::new(|| serde_json::from_str(MANIFEST).expect("the model list is valid"));

pub fn models() -> &'static [Entry] {
    &PARSED.models
}

pub fn find(id: &str) -> Option<&'static Entry> {
    models().iter().find(|entry| entry.id == id)
}

pub fn for_engine(engine: Engine) -> &'static Entry {
    models()
        .iter()
        .find(|entry| entry.engine == engine)
        .expect("every engine has a model")
}

impl Entry {
    pub fn size(&self) -> u64 {
        self.files.iter().map(|file| file.size).sum()
    }

    pub fn url(&self, file: &File) -> String {
        format!("{}/{}/{}", PARSED.mirror, self.id, file.name)
    }

    pub fn file_names(&self) -> Vec<String> {
        self.files.iter().map(|file| file.name.clone()).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_engine_has_a_model_with_checked_files() {
        for engine in [Engine::Parakeet, Engine::Whisper] {
            let entry = for_engine(engine);
            assert!(!entry.files.is_empty());
            for file in &entry.files {
                assert_eq!(file.sha256.len(), 64, "{}", file.name);
                assert!(file.size > 0);
            }
        }
    }
}
