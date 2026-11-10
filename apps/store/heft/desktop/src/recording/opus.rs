use std::fs::{File, OpenOptions};
use std::io::BufReader;
use std::path::Path;

use ogg::{PacketReader, PacketWriteEndInfo, PacketWriter};
use opus::{Application, Bitrate, Channels, Encoder, Signal};

use super::microphone::RATE;

const FRAME: usize = RATE as usize / 50;
const FRAMES_A_PAGE: u32 = 50;
const BITRATE: i32 = 24_000;
const LONGEST_PACKET: usize = 1500;
const SERIAL: u32 = 0x4865_6674;
const PER_MILLISECOND: u64 = RATE as u64 / 1000;

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub struct OpusFile {
    writer: PacketWriter<'static, File>,
    encoder: Encoder,
    pending: Vec<f32>,
    pre_skip: u64,
    encoded: u64,
    in_page: u32,
}

impl OpusFile {
    pub fn create(path: &Path) -> Result<Self, String> {
        if let Some(folder) = path.parent() {
            std::fs::create_dir_all(folder).map_err(failed)?;
        }
        let file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(path)
            .map_err(failed)?;
        let mut encoder = Encoder::new(RATE, Channels::Mono, Application::Voip).map_err(failed)?;
        encoder
            .set_bitrate(Bitrate::Bits(BITRATE))
            .map_err(failed)?;
        encoder.set_signal(Signal::Voice).map_err(failed)?;
        let pre_skip = encoder.get_lookahead().map_err(failed)? as u64;
        let mut writer = PacketWriter::new(file);
        let mut head = b"OpusHead".to_vec();
        head.push(1);
        head.push(1);
        head.extend((pre_skip as u16).to_le_bytes());
        head.extend(RATE.to_le_bytes());
        head.extend([0, 0, 0]);
        writer
            .write_packet(head, SERIAL, PacketWriteEndInfo::EndPage, 0)
            .map_err(failed)?;
        let vendor = b"Heft";
        let mut tags = b"OpusTags".to_vec();
        tags.extend((vendor.len() as u32).to_le_bytes());
        tags.extend(vendor);
        tags.extend(0u32.to_le_bytes());
        writer
            .write_packet(tags, SERIAL, PacketWriteEndInfo::EndPage, 0)
            .map_err(failed)?;
        writer.inner_mut().sync_all().map_err(failed)?;
        super::sync_folder(path)?;
        Ok(Self {
            writer,
            encoder,
            pending: Vec::with_capacity(FRAME * 4),
            pre_skip,
            encoded: 0,
            in_page: 0,
        })
    }

    pub fn length(&self) -> u64 {
        (self.encoded + self.pending.len() as u64) / PER_MILLISECOND
    }

    pub fn write(&mut self, samples: &[f32]) -> Result<(), String> {
        self.pending.extend_from_slice(samples);
        let whole = self.pending.len() / FRAME * FRAME;
        let frames: Vec<f32> = self.pending.drain(..whole).collect();
        for frame in frames.as_chunks::<FRAME>().0 {
            self.encode(frame, FRAME, false)?;
        }
        Ok(())
    }

    fn encode(&mut self, frame: &[f32], heard: usize, last: bool) -> Result<(), String> {
        let packet = self
            .encoder
            .encode_vec_float(frame, LONGEST_PACKET)
            .map_err(failed)?;
        self.encoded += heard as u64;
        self.in_page += 1;
        let end = if last {
            PacketWriteEndInfo::EndStream
        } else if self.in_page == FRAMES_A_PAGE {
            PacketWriteEndInfo::EndPage
        } else {
            PacketWriteEndInfo::NormalPacket
        };
        self.writer
            .write_packet(packet, SERIAL, end, self.pre_skip + self.encoded)
            .map_err(failed)?;
        if !matches!(end, PacketWriteEndInfo::NormalPacket) {
            self.in_page = 0;
            self.writer.inner_mut().sync_data().map_err(failed)?;
        }
        Ok(())
    }

    pub fn finish(mut self) -> Result<u64, String> {
        let mut frame = std::mem::take(&mut self.pending);
        let heard = frame.len();
        frame.resize(FRAME, 0.0);
        self.encode(&frame, heard, true)?;
        Ok(self.length())
    }
}

pub fn length(path: &Path) -> Result<u64, String> {
    let mut reader = PacketReader::new(BufReader::new(File::open(path).map_err(failed)?));
    let head = reader
        .read_packet()
        .map_err(failed)?
        .ok_or("The recording is empty")?;
    let pre_skip = u64::from(u16::from_le_bytes([head.data[10], head.data[11]]));
    let mut last = 0;
    while let Ok(Some(packet)) = reader.read_packet() {
        if packet.last_in_page() {
            last = packet.absgp_page();
        }
    }
    Ok(last.saturating_sub(pre_skip) / PER_MILLISECOND)
}
