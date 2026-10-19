use std::sync::OnceLock;

use anyhow::{Result, anyhow};
use ort::environment::Environment;
use ort::session::builder::{GraphOptimizationLevel, SessionBuilder};

static ENVIRONMENT: OnceLock<Environment> = OnceLock::new();

fn environment() -> Result<&'static Environment> {
    if let Some(environment) = ENVIRONMENT.get() {
        return Ok(environment);
    }
    let environment = ort::init()
        .with_name("luft-speech")
        .with_telemetry(false)
        .build()?;
    Ok(ENVIRONMENT.get_or_init(|| environment))
}

/// A session builder for models on ONNX Runtime, running on this many threads.
pub fn builder(threads: usize) -> Result<SessionBuilder> {
    let failed = |error: ort::Error<SessionBuilder>| anyhow!("{error}");
    ort::session::Session::builder(environment()?)?
        .with_optimization_level(GraphOptimizationLevel::Level3)
        .map_err(failed)?
        .with_intra_threads(threads)
        .map_err(failed)?
        .with_inter_threads(1)
        .map_err(failed)
}
