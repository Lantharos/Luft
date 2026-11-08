use crate::language::script::{self, Script};

const SURE: f32 = 0.75;
const STILL_LIKELY: f32 = 0.15;

/// Languages that Whisper hears as one another, counted together for
/// whichever of them the class speaks.
const KIN: &[&[&str]] = &[&["sr", "hr", "bs"]];

/// A language a class may speak, such as `sr-Latn` for Serbian in Latin.
#[derive(Clone, Debug, PartialEq)]
pub struct Spoken {
    pub code: String,
    script: Script,
    ids: Vec<usize>,
}

impl Spoken {
    fn parse(tag: &str) -> Option<Self> {
        let (code, script) = tag.split_once('-').unwrap_or((tag, ""));
        let id = whisper_rs::get_lang_id(code)? as usize;
        let script = match script {
            "Latn" => Script::Latin,
            "Cyrl" => Script::Cyrillic,
            _ => Script::default_for(code),
        };
        Some(Self {
            code: code.to_owned(),
            script,
            ids: vec![id],
        })
    }

    pub fn write(&self, text: &str) -> String {
        script::write(text, &self.code, self.script)
    }
}

/// The languages to choose from for each stretch of a recording.
pub struct Choice {
    spoken: Vec<Spoken>,
}

impl Choice {
    /// The languages named, or every language Whisper knows when none are.
    pub fn new(tags: &[String]) -> Self {
        let mut spoken: Vec<Spoken> = tags.iter().filter_map(|tag| Spoken::parse(tag)).collect();
        if spoken.is_empty() {
            spoken = (0..=whisper_rs::get_lang_max_id())
                .filter_map(whisper_rs::get_lang_str)
                .filter_map(Spoken::parse)
                .collect();
        }
        let named: Vec<String> = spoken.iter().map(|spoken| spoken.code.clone()).collect();
        for language in &mut spoken {
            let Some(kin) = KIN.iter().find(|kin| kin.contains(&language.code.as_str())) else {
                continue;
            };
            language.ids.extend(
                kin.iter()
                    .filter(|code| !named.iter().any(|named| named == *code))
                    .filter_map(|code| whisper_rs::get_lang_id(code))
                    .map(|id| id as usize),
            );
        }
        Self { spoken }
    }

    /// The language a stretch is in. Short stretches are hard to tell apart,
    /// so one that's still fairly likely to be in the language before it
    /// stays in that language unless another is clearly ahead.
    pub fn pick(&self, chances: &[f32], before: Option<&Spoken>) -> &Spoken {
        let shares: Vec<f32> = self
            .spoken
            .iter()
            .map(|spoken| spoken.ids.iter().map(|id| chances.get(*id).copied().unwrap_or(0.0)).sum())
            .collect();
        let total: f32 = shares.iter().sum::<f32>().max(f32::EPSILON);
        let (best, share) = shares
            .iter()
            .enumerate()
            .max_by(|a, b| a.1.total_cmp(b.1))
            .map(|(index, share)| (index, share / total))
            .unwrap_or((0, 0.0));
        let kept = before.and_then(|before| {
            let index = self.spoken.iter().position(|spoken| spoken == before)?;
            (share < SURE && shares[index] / total >= STILL_LIKELY).then_some(index)
        });
        &self.spoken[kept.unwrap_or(best)]
    }
}
