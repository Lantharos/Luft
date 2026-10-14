use std::collections::HashMap;

use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "type")]
enum Event {
    ProgressBytes {
        subtasks: Vec<Layer>,
    },
    #[serde(other)]
    Other,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Layer {
    id: String,
    bytes: u64,
    bytes_total: u64,
}

#[derive(Default)]
pub struct Pull {
    fetching: HashMap<String, Layer>,
    fetched: u64,
}

impl Pull {
    pub fn update(&mut self, line: &str) -> Option<u64> {
        let Event::ProgressBytes { subtasks } = serde_json::from_str(line).ok()? else {
            return None;
        };
        let fetching: HashMap<String, Layer> = subtasks
            .into_iter()
            .map(|layer| (layer.id.clone(), layer))
            .collect();
        let previous = std::mem::replace(&mut self.fetching, fetching);
        self.fetched += previous
            .values()
            .filter(|layer| !self.fetching.contains_key(&layer.id))
            .map(|layer| layer.bytes_total.max(layer.bytes))
            .sum::<u64>();
        Some(self.fetched + self.fetching.values().map(|layer| layer.bytes).sum::<u64>())
    }
}

#[cfg(test)]
mod tests {
    use super::Pull;

    #[test]
    fn counts_every_fetched_layer_once() {
        let mut pull = Pull::default();
        let fetched: Vec<u64> = include_str!("fixtures/pull.jsonl")
            .lines()
            .filter_map(|line| pull.update(line))
            .collect();
        assert!(fetched.is_sorted());
        assert_eq!(fetched.last(), Some(&(125_841_685 + 2_404)));
    }
}
