use serde::Deserialize;
use serde::de::DeserializeOwned;

#[derive(Deserialize)]
struct Listed<E> {
    mirror: String,
    models: Vec<Entry<E>>,
}

#[derive(Debug, Deserialize)]
pub struct Entry<E> {
    pub id: String,
    pub engine: E,
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

/// The models a service may download, with where each file comes from.
pub struct Catalog<E> {
    mirror: String,
    models: Vec<Entry<E>>,
}

impl<E: DeserializeOwned> Catalog<E> {
    /// Reads the list a service ships.
    pub fn parse(json: &str) -> Self {
        let listed: Listed<E> = serde_json::from_str(json).expect("the model list is valid");
        Self {
            mirror: listed.mirror,
            models: listed.models,
        }
    }
}

impl<E> Catalog<E> {
    /// Points downloads at the server an environment variable names, for
    /// checks.
    pub fn mirrored_by(mut self, variable: &str) -> Self {
        if let Ok(mirror) = std::env::var(variable) {
            self.mirror = mirror;
        }
        self
    }

    pub fn models(&self) -> &[Entry<E>] {
        &self.models
    }

    pub fn find(&self, id: &str) -> Option<&Entry<E>> {
        self.models.iter().find(|entry| entry.id == id)
    }

    pub fn mirror(&self) -> &str {
        &self.mirror
    }
}

impl<E> Entry<E> {
    pub fn size(&self) -> u64 {
        self.files.iter().map(|file| file.size).sum()
    }

    pub fn url(&self, mirror: &str, file: &File) -> String {
        format!("{mirror}/{}/{}", self.id, file.name)
    }

    pub fn file_names(&self) -> Vec<String> {
        self.files.iter().map(|file| file.name.clone()).collect()
    }
}
