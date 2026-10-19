mod vocabulary;

use std::path::Path;

use anyhow::{Context, Result, bail};
use ort::session::Session;
use ort::value::Tensor;

use vocabulary::Vocabulary;

const PREPROCESSOR: &str = "nemo128.onnx";
const ENCODER: &str = "encoder-model.q4.onnx";
const DECODER: &str = "decoder_joint-model.int8.onnx";
const VOCABULARY: &str = "vocab.txt";
const MOST_PIECES_PER_FRAME: usize = 10;
const SAMPLES_PER_FRAME: usize = 1280;
const STALLED_FRAMES: usize = 25;
const LOOK_AGAIN_FRAMES: usize = 2;

/// NVIDIA's Parakeet TDT, a transducer that also predicts how many frames
/// each piece lasts, so decoding skips ahead instead of visiting every frame.
/// It sometimes hears nothing more after the end of a sentence, or nothing at
/// all in speech that starts or ends in the middle of a word, so when it falls
/// silent well before the end, what comes after the last word it heard is
/// recognized again on its own, and speech it heard nothing in is looked at
/// once more from a moment later.
pub struct Parakeet {
    preprocessor: Session,
    encoder: Session,
    decoder: Session,
    vocabulary: Vocabulary,
    state_shape: [usize; 3],
}

struct DecoderState {
    hidden: Vec<f32>,
    cell: Vec<f32>,
}

fn session(path: &Path) -> Result<Session> {
    crate::onnx::builder(super::threads())?
        .commit_from_file(path)
        .with_context(|| format!("Couldn't load {}", path.display()))
}

fn state_shape(decoder: &Session) -> Result<[usize; 3]> {
    let input = decoder
        .inputs()
        .iter()
        .find(|input| input.name() == "input_states_1")
        .context("The decoder takes no state")?;
    let shape = input
        .dtype()
        .tensor_shape()
        .context("The decoder state isn't a tensor")?;
    match shape.iter().copied().collect::<Vec<i64>>()[..] {
        [layers, _, size] if layers > 0 && size > 0 => Ok([layers as usize, 1, size as usize]),
        _ => bail!("The decoder state has an unexpected shape {shape:?}"),
    }
}

impl Parakeet {
    pub fn load(folder: &Path) -> Result<Self> {
        let vocabulary = Vocabulary::parse(&std::fs::read_to_string(folder.join(VOCABULARY))?)?;
        let decoder = session(&folder.join(DECODER))?;
        Ok(Self {
            preprocessor: session(&folder.join(PREPROCESSOR))?,
            encoder: session(&folder.join(ENCODER))?,
            state_shape: state_shape(&decoder)?,
            decoder,
            vocabulary,
        })
    }

    pub fn recognize(&mut self, audio: &[f32]) -> Result<String> {
        let mut texts = Vec::new();
        let mut rest = audio;
        let mut looked_again = false;
        loop {
            let (frames, width, length) = self.encode(rest)?;
            let (pieces, heard_until) = self.decode(&frames, width, length)?;
            texts.push(self.vocabulary.text(&pieces));
            let stalled = length - heard_until >= STALLED_FRAMES;
            if !stalled || (pieces.is_empty() && looked_again) {
                break;
            }
            looked_again = pieces.is_empty();
            let resume = if looked_again {
                LOOK_AGAIN_FRAMES
            } else {
                heard_until
            };
            rest = &rest[(resume * SAMPLES_PER_FRAME).min(rest.len())..];
        }
        texts.retain(|text| !text.is_empty());
        Ok(texts.join(" "))
    }

    fn encode(&mut self, audio: &[f32]) -> Result<(Vec<f32>, usize, usize)> {
        let waveform = Tensor::from_array(([1, audio.len()], audio.to_vec()))?;
        let waveform_length = Tensor::from_array(([1], vec![audio.len() as i64]))?;
        let features = self.preprocessor.run(ort::inputs![
            "waveforms" => waveform,
            "waveforms_lens" => waveform_length,
        ])?;
        let (feature_shape, feature_values) = features["features"].try_extract_tensor::<f32>()?;
        let (_, feature_lengths) = features["features_lens"].try_extract_tensor::<i64>()?;
        let features = Tensor::from_array((feature_shape.to_vec(), feature_values.to_vec()))?;
        let feature_length = Tensor::from_array(([1], vec![feature_lengths[0]]))?;
        let encoded = self.encoder.run(ort::inputs![
            "audio_signal" => features,
            "length" => feature_length,
        ])?;
        let (shape, values) = encoded["outputs"].try_extract_tensor::<f32>()?;
        let (_, lengths) = encoded["encoded_lengths"].try_extract_tensor::<i64>()?;
        let [_, width, frames] = shape[..] else {
            bail!("The encoder answered in an unexpected shape {shape:?}");
        };
        let (width, frames) = (width as usize, frames as usize);
        let mut by_frame = vec![0.0; width * frames];
        for feature in 0..width {
            for frame in 0..frames {
                by_frame[frame * width + feature] = values[feature * frames + frame];
            }
        }
        Ok((by_frame, width, (lengths[0] as usize).min(frames)))
    }

    /// The pieces heard, and the frame after the last one.
    fn decode(
        &mut self,
        frames: &[f32],
        width: usize,
        length: usize,
    ) -> Result<(Vec<usize>, usize)> {
        let blank = self.vocabulary.blank();
        let pieces_in_vocabulary = self.vocabulary.len();
        let state_len: usize = self.state_shape.iter().product();
        let mut state = DecoderState {
            hidden: vec![0.0; state_len],
            cell: vec![0.0; state_len],
        };
        let mut pieces = Vec::new();
        let mut frame = 0;
        let mut emitted = 0;
        let mut heard_until = 0;
        while frame < length {
            let previous = pieces.last().copied().unwrap_or(blank);
            let encoded = &frames[frame * width..(frame + 1) * width];
            let (piece, skip, next) = self.step(encoded, previous, &state, pieces_in_vocabulary)?;
            if piece != blank {
                state = next;
                pieces.push(piece);
                emitted += 1;
                heard_until = frame + skip.max(1);
            }
            if skip > 0 {
                frame += skip;
                emitted = 0;
            } else if piece == blank || emitted == MOST_PIECES_PER_FRAME {
                frame += 1;
                emitted = 0;
            }
        }
        Ok((pieces, heard_until.min(length)))
    }

    fn step(
        &mut self,
        encoded: &[f32],
        previous: usize,
        state: &DecoderState,
        pieces_in_vocabulary: usize,
    ) -> Result<(usize, usize, DecoderState)> {
        let outputs = self.decoder.run(ort::inputs![
            "encoder_outputs" => Tensor::from_array(([1, encoded.len(), 1], encoded.to_vec()))?,
            "targets" => Tensor::from_array(([1, 1], vec![previous as i32]))?,
            "target_length" => Tensor::from_array(([1], vec![1i32]))?,
            "input_states_1" => Tensor::from_array((self.state_shape, state.hidden.clone()))?,
            "input_states_2" => Tensor::from_array((self.state_shape, state.cell.clone()))?,
        ])?;
        let (_, logits) = outputs["outputs"].try_extract_tensor::<f32>()?;
        let (pieces, durations) = logits.split_at(pieces_in_vocabulary.min(logits.len()));
        let next = DecoderState {
            hidden: outputs["output_states_1"]
                .try_extract_tensor::<f32>()?
                .1
                .to_vec(),
            cell: outputs["output_states_2"]
                .try_extract_tensor::<f32>()?
                .1
                .to_vec(),
        };
        Ok((largest(pieces), largest(durations), next))
    }
}

fn largest(values: &[f32]) -> usize {
    values
        .iter()
        .enumerate()
        .max_by(|a, b| a.1.total_cmp(b.1))
        .map_or(0, |(index, _)| index)
}
