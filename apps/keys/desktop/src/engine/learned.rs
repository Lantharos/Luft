use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use crate::paths;

const SAVE_EVERY: u32 = 8;

#[derive(Default)]
pub struct Learned {
    counts: HashMap<String, HashMap<String, u32>>,
    file: Option<PathBuf>,
    unsaved: u32,
}

impl Learned {
    pub fn load(id: &str) -> Self {
        let file = paths::learned().join(format!("{id}.json"));
        let mut counts: HashMap<String, HashMap<String, u32>> = HashMap::new();
        let stored = fs::read(&file)
            .ok()
            .and_then(|bytes| serde_json::from_slice::<Vec<(String, String, u32)>>(&bytes).ok())
            .unwrap_or_default();
        for (keys, text, count) in stored {
            counts.entry(keys).or_default().insert(text, count);
        }
        Self {
            counts,
            file: Some(file),
            unsaved: 0,
        }
    }

    pub fn count(&self, keys: &str, text: &str) -> u32 {
        self.counts
            .get(keys)
            .and_then(|texts| texts.get(text))
            .copied()
            .unwrap_or(0)
    }

    pub fn bump(&mut self, keys: &str, text: &str) {
        *self
            .counts
            .entry(keys.to_owned())
            .or_default()
            .entry(text.to_owned())
            .or_default() += 1;
        self.unsaved += 1;
        if self.unsaved >= SAVE_EVERY {
            self.save();
        }
    }

    pub fn save(&mut self) {
        let Some(file) = &self.file else {
            return;
        };
        if self.unsaved == 0 {
            return;
        }
        let entries: Vec<(&str, &str, u32)> = self
            .counts
            .iter()
            .flat_map(|(keys, texts)| {
                texts
                    .iter()
                    .map(move |(text, count)| (keys.as_str(), text.as_str(), *count))
            })
            .collect();
        if let Ok(json) = serde_json::to_string(&entries)
            && paths::write(file, &json).is_ok()
        {
            self.unsaved = 0;
        }
    }
}
