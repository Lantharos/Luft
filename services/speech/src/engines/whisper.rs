use std::path::Path;

use anyhow::{Context, Result, anyhow};
use whisper_rs::{
    FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters, WhisperState,
};

use super::Pass;

pub struct Whisper {
    state: WhisperState,
    _context: WhisperContext,
}

impl Whisper {
    pub fn load(path: &Path) -> Result<Self> {
        whisper_rs::install_logging_hooks();
        let parameters = WhisperContextParameters {
            use_gpu: true,
            flash_attn: true,
            ..WhisperContextParameters::default()
        };
        let path = path.to_str().context("The model's path isn't text")?;
        let context = WhisperContext::new_with_params(path, parameters)
            .map_err(|error| anyhow!("Couldn't load Whisper: {error}"))?;
        let state = context
            .create_state()
            .map_err(|error| anyhow!("Couldn't start Whisper: {error}"))?;
        Ok(Self {
            state,
            _context: context,
        })
    }

    pub fn recognize(&mut self, audio: &[f32], language: &str, pass: Pass) -> Result<String> {
        let mut parameters = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        parameters.set_language(Some(language));
        parameters.set_n_threads(super::threads() as i32);
        parameters.set_no_context(true);
        parameters.set_no_timestamps(true);
        parameters.set_single_segment(true);
        parameters.set_suppress_blank(true);
        parameters.set_suppress_nst(true);
        parameters.set_print_progress(false);
        parameters.set_print_realtime(false);
        parameters.set_print_special(false);
        parameters.set_print_timestamps(false);
        if pass == Pass::Partial {
            parameters.set_temperature_inc(0.0);
        }
        self.state
            .full(parameters, audio)
            .map_err(|error| anyhow!("Whisper couldn't listen: {error}"))?;
        let text: String = self
            .state
            .as_iter()
            .filter_map(|segment| segment.to_str_lossy().ok().map(|text| text.into_owned()))
            .collect();
        Ok(text.trim().to_owned())
    }

    pub fn languages(&mut self, audio: &[f32]) -> Result<Vec<f32>> {
        let threads = super::threads();
        self.state
            .pcm_to_mel(audio, threads)
            .map_err(|error| anyhow!("Whisper couldn't listen: {error}"))?;
        let (_, chances) = self
            .state
            .lang_detect(0, threads)
            .map_err(|error| anyhow!("Whisper couldn't tell the language: {error}"))?;
        Ok(chances)
    }

    pub fn timed(&mut self, audio: &[f32], language: &str) -> Result<Vec<Heard>> {
        let mut parameters = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        parameters.set_language(Some(language));
        parameters.set_n_threads(super::threads() as i32);
        parameters.set_no_context(true);
        parameters.set_suppress_blank(true);
        parameters.set_suppress_nst(true);
        parameters.set_print_progress(false);
        parameters.set_print_realtime(false);
        parameters.set_print_special(false);
        parameters.set_print_timestamps(false);
        self.state
            .full(parameters, audio)
            .map_err(|error| anyhow!("Whisper couldn't listen: {error}"))?;
        Ok(self
            .state
            .as_iter()
            .filter(|segment| segment.no_speech_probability() < NOT_SPEECH)
            .filter_map(|segment| {
                Some(Heard {
                    start: segment.start_timestamp(),
                    end: segment.end_timestamp(),
                    text: segment.to_str_lossy().ok()?.trim().to_owned(),
                })
            })
            .filter(|heard| !heard.text.is_empty())
            .collect())
    }
}

const NOT_SPEECH: f32 = 0.6;

pub struct Heard {
    pub start: i64,
    pub end: i64,
    pub text: String,
}
