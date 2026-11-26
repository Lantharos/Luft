use std::path::Path;
use std::sync::OnceLock;

use luft_i18n::t;
use ort::environment::Environment;
use ort::session::Session;
use ort::value::Tensor;
use serde::Deserialize;
use specta::Type;

use super::pixels::{interleaved, planar, resize};
use super::upscale::upscale;
use super::{Engine, Models};
use crate::files::failed;
use crate::l10n::L10N;

const MATTE_SIZE: u32 = 1024;
const INPAINT_SIZE: u32 = 512;
const IMAGENET_MEAN: [f32; 3] = [0.485, 0.456, 0.406];
const IMAGENET_DEVIATION: [f32; 3] = [0.229, 0.224, 0.225];
pub(super) const UNIT_MEAN: [f32; 3] = [0.0; 3];
pub(super) const UNIT_DEVIATION: [f32; 3] = [1.0; 3];
const RUNTIME: &str = "libonnxruntime.so.1";

#[derive(Deserialize, Type, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Task {
    Matte,
    Inpaint,
    Upscale2,
    Upscale4,
}

static ENVIRONMENT: OnceLock<Environment> = OnceLock::new();

fn environment() -> Result<&'static Environment, String> {
    if let Some(environment) = ENVIRONMENT.get() {
        return Ok(environment);
    }
    let environment = ort::init_from(RUNTIME)
        .map_err(failed)?
        .with_name("easel")
        .with_telemetry(false)
        .build()
        .map_err(failed)?;
    Ok(ENVIRONMENT.get_or_init(|| environment))
}

pub(super) fn cores() -> usize {
    std::thread::available_parallelism().map_or(4, |count| count.get())
}

pub(super) fn session(path: &Path, threads: usize) -> Result<Session, String> {
    Session::builder(environment()?)
        .map_err(failed)?
        .with_intra_threads(threads)
        .map_err(failed)?
        .commit_from_file(path)
        .map_err(failed)
}

pub(super) fn first_output(
    session: &mut Session,
    inputs: Vec<(&str, Tensor<f32>)>,
) -> Result<(Vec<i64>, Vec<f32>), String> {
    let outputs = session
        .run(
            inputs
                .into_iter()
                .map(|(name, tensor)| (name.to_string(), tensor.into_dyn()))
                .collect::<Vec<_>>(),
        )
        .map_err(failed)?;
    let (shape, data) = outputs[0].try_extract_tensor::<f32>().map_err(failed)?;
    Ok((shape.to_vec(), data.to_vec()))
}

pub(super) fn tensor(shape: [usize; 4], data: Vec<f32>) -> Result<Tensor<f32>, String> {
    Tensor::from_array((shape, data)).map_err(failed)
}

fn matte(session: &mut Session, rgba: &[u8], size: (u32, u32)) -> Result<Vec<u8>, String> {
    let side = MATTE_SIZE as usize;
    let scaled = resize(rgba, size, (MATTE_SIZE, MATTE_SIZE), 4)?;
    let input = tensor(
        [1, 3, side, side],
        planar(&scaled, side, side, IMAGENET_MEAN, IMAGENET_DEVIATION),
    )?;
    let name = session.inputs()[0].name().to_string();
    let (_, values) = first_output(session, vec![(name.as_str(), input)])?;
    let logits = values.iter().any(|value| *value < 0.0 || *value > 1.0);
    let mask: Vec<u8> = values
        .iter()
        .map(|value| {
            let share = if logits {
                1.0 / (1.0 + (-value).exp())
            } else {
                *value
            };
            (share * 255.0).round() as u8
        })
        .collect();
    resize(&mask, (MATTE_SIZE, MATTE_SIZE), size, 1)
}

fn inpaint(
    session: &mut Session,
    rgba: &[u8],
    mask: &[u8],
    size: (u32, u32),
) -> Result<Vec<u8>, String> {
    let side = INPAINT_SIZE as usize;
    let scaled = resize(rgba, size, (INPAINT_SIZE, INPAINT_SIZE), 4)?;
    let hole = resize(mask, size, (INPAINT_SIZE, INPAINT_SIZE), 1)?;
    let image = tensor(
        [1, 3, side, side],
        planar(&scaled, side, side, UNIT_MEAN, UNIT_DEVIATION),
    )?;
    let holes = tensor(
        [1, 1, side, side],
        hole.iter()
            .map(|value| if *value > 127 { 1.0 } else { 0.0 })
            .collect(),
    )?;
    let names: Vec<String> = session
        .inputs()
        .iter()
        .map(|input| input.name().to_string())
        .collect();
    let (_, values) = first_output(
        session,
        vec![(names[0].as_str(), image), (names[1].as_str(), holes)],
    )?;
    let scale = if values.iter().any(|value| *value > 1.5) {
        1.0
    } else {
        255.0
    };
    let opaque = vec![255; side * side];
    let painted = interleaved(&values, side, side, scale, &opaque);
    resize(&painted, (INPAINT_SIZE, INPAINT_SIZE), size, 4)
}

pub fn run(
    models: &Models,
    task: Task,
    rgba: &[u8],
    mask: &[u8],
    size: (u32, u32),
    progress: &(dyn Fn(f64) + Sync),
) -> Result<Vec<u8>, String> {
    let engine = match task {
        Task::Matte => Engine::Matte,
        Task::Inpaint => Engine::Inpaint,
        Task::Upscale2 | Task::Upscale4 => Engine::Upscale,
    };
    let path = models.path(engine)?;
    if rgba.len() != size.0 as usize * size.1 as usize * 4 {
        return Err(t!(L10N, "easel-error-tiles-short"));
    }
    let threads = (cores() / 2).max(1);
    match task {
        Task::Matte => matte(&mut session(&path, threads)?, rgba, size),
        Task::Inpaint => inpaint(&mut session(&path, threads)?, rgba, mask, size),
        Task::Upscale2 => upscale(&path, rgba, size, 2, progress),
        Task::Upscale4 => upscale(&path, rgba, size, 4, progress),
    }
}
