use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::document;

const FILE: &str = "com.lantharos.Flatbed/settings.json";

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum PaperSize {
    #[default]
    Automatic,
    A4,
    Letter,
}

#[derive(Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub languages: Vec<String>,
    pub paper: PaperSize,
    pub fine: bool,
    pub addresses: Vec<String>,
    pub scanner: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            languages: default_languages(),
            paper: PaperSize::Automatic,
            fine: false,
            addresses: Vec::new(),
            scanner: None,
        }
    }
}

const TESSERACT_CODES: [(&str, &str); 37] = [
    ("sq", "sqi"),
    ("de", "deu"),
    ("hr", "hrv"),
    ("en", "eng"),
    ("bs", "bos"),
    ("bg", "bul"),
    ("ca", "cat"),
    ("cs", "ces"),
    ("da", "dan"),
    ("el", "ell"),
    ("es", "spa"),
    ("et", "est"),
    ("fi", "fin"),
    ("fr", "fra"),
    ("ga", "gle"),
    ("hu", "hun"),
    ("is", "isl"),
    ("it", "ita"),
    ("lt", "lit"),
    ("lv", "lav"),
    ("mk", "mkd"),
    ("mt", "mlt"),
    ("nb", "nor"),
    ("nn", "nor"),
    ("nl", "nld"),
    ("pl", "pol"),
    ("pt", "por"),
    ("pt-BR", "por"),
    ("ro", "ron"),
    ("ru", "rus"),
    ("sk", "slk"),
    ("sl", "slv"),
    ("sr", "srp"),
    ("sr-Latn", "srp_latn"),
    ("sv", "swe"),
    ("tr", "tur"),
    ("uk", "ukr"),
];

fn tesseract_code(language: &str) -> Option<&'static str> {
    let base = language.split(['-', '_', '.']).next()?;
    [language, base]
        .into_iter()
        .find_map(|wanted| TESSERACT_CODES.iter().find(|(tag, _)| *tag == wanted))
        .map(|(_, code)| *code)
}

fn default_languages() -> Vec<String> {
    let available = document::reading_languages().unwrap_or_default();
    let mut chosen: Vec<String> = Vec::new();
    for code in luft_app::i18n::requested()
        .iter()
        .filter_map(|language| tesseract_code(language))
        .chain(["eng"])
    {
        if available.iter().any(|known| known == code) && !chosen.iter().any(|kept| kept == code) {
            chosen.push(code.to_owned());
        }
    }
    chosen
}

static CURRENT: Mutex<Option<Settings>> = Mutex::new(None);

pub fn current() -> Settings {
    CURRENT
        .lock()
        .expect("settings lock")
        .get_or_insert_with(|| luft_app::settings::load(FILE).unwrap_or_default())
        .clone()
}

pub fn update(change: impl FnOnce(&mut Settings)) -> Result<Settings, String> {
    let mut settings = current();
    change(&mut settings);
    luft_app::settings::save(FILE, &settings)?;
    *CURRENT.lock().expect("settings lock") = Some(settings.clone());
    Ok(settings)
}
