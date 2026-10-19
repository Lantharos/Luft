use anyhow::Result;
use ort::session::Session;
use ort::value::Tensor;

use super::RATE;

const MODEL: &[u8] = include_bytes!("../../data/silero-vad.onnx");
pub const FRAME: usize = 512;
const CONTEXT: usize = 64;
const STATE: [usize; 3] = [2, 1, 128];

/// Silero VAD: how likely each 32 ms of audio is someone speaking, judged by
/// a small network trained on speech in many languages over all kinds of
/// noise, so steady speech stays speech however long it goes on.
pub struct Voice {
    session: Session,
    state: Vec<f32>,
    input: Vec<f32>,
}

impl Voice {
    pub fn new() -> Result<Self> {
        Ok(Self {
            session: crate::onnx::builder(1)?.commit_from_memory(MODEL)?,
            state: vec![0.0; STATE.iter().product()],
            input: vec![0.0; CONTEXT + FRAME],
        })
    }

    pub fn hear(&mut self, frame: &[f32]) -> Result<f32> {
        self.input.copy_within(FRAME.., 0);
        self.input[CONTEXT..].copy_from_slice(frame);
        let outputs = self.session.run(ort::inputs![
            "input" => Tensor::from_array(([1, CONTEXT + FRAME], self.input.clone()))?,
            "state" => Tensor::from_array((STATE, std::mem::take(&mut self.state)))?,
            "sr" => Tensor::from_array(([0usize; 0], vec![RATE as i64]))?,
        ])?;
        self.state = outputs["stateN"].try_extract_tensor::<f32>()?.1.to_vec();
        Ok(outputs["output"].try_extract_tensor::<f32>()?.1[0])
    }
}
