use std::path::Path;

use anyhow::{Context, Result, anyhow};
use whisper_rs::{
    FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters, WhisperState,
};

use super::Pass;

const NO_SPEECH: f32 = 0.6;

/// OpenAI's Whisper through whisper.cpp, on the graphics card when Vulkan has
/// one and on the processor otherwise. It always looks at a whole 30 second
/// window: the turbo model makes things up when shown less.
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
            .filter(|segment| segment.no_speech_probability() < NO_SPEECH)
            .filter_map(|segment| segment.to_str_lossy().ok().map(|text| text.into_owned()))
            .collect();
        Ok(text.trim().to_owned())
    }
}
