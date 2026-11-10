use std::sync::LazyLock;

use luft_models::Catalog;
use luft_speech::types::Engine;

pub type Entry = luft_models::Entry<Engine>;

static CATALOG: LazyLock<Catalog<Engine>> = LazyLock::new(|| {
    Catalog::parse(include_str!("../../data/models.json")).mirrored_by("LUFT_SPEECH_MIRROR")
});

pub fn models() -> &'static [Entry] {
    CATALOG.models()
}

pub fn find(id: &str) -> Option<&'static Entry> {
    CATALOG.find(id)
}

pub fn mirror() -> &'static str {
    CATALOG.mirror()
}

pub fn for_engine(engine: Engine) -> &'static Entry {
    models()
        .iter()
        .find(|entry| entry.engine == engine)
        .expect("every engine has a model")
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
