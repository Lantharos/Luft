use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

use super::{Cue, Streams, SubtitleTrack};

const SUBTITLE_HANDLERS: [&[u8; 4]; 3] = [b"text", b"sbtl", b"subt"];
const TEXT_CODECS: [&[u8; 4]; 2] = [b"tx3g", b"wvtt"];

struct Track<'a> {
    id: u32,
    handler: [u8; 4],
    codec: [u8; 4],
    language: Option<String>,
    timescale: u32,
    table: &'a [u8],
}

fn be32(data: &[u8], at: usize) -> Option<u32> {
    Some(u32::from_be_bytes(data.get(at..at + 4)?.try_into().ok()?))
}

fn be64(data: &[u8], at: usize) -> Option<u64> {
    Some(u64::from_be_bytes(data.get(at..at + 8)?.try_into().ok()?))
}

fn fourcc(data: &[u8], at: usize) -> Option<[u8; 4]> {
    data.get(at..at + 4)?.try_into().ok()
}

fn children(mut data: &[u8]) -> Vec<([u8; 4], &[u8])> {
    let mut boxes = Vec::new();
    while data.len() >= 8 {
        let (Some(size), Some(kind)) = (be32(data, 0), fourcc(data, 4)) else {
            break;
        };
        let (size, header) = match size {
            0 => (data.len(), 8),
            1 => match be64(data, 8) {
                Some(size) => (size as usize, 16),
                None => break,
            },
            size => (size as usize, 8),
        };
        if size < header || size > data.len() {
            break;
        }
        boxes.push((kind, &data[header..size]));
        data = &data[size..];
    }
    boxes
}

fn child<'a>(data: &'a [u8], kind: &[u8; 4]) -> Option<&'a [u8]> {
    children(data)
        .into_iter()
        .find_map(|(found, payload)| (&found == kind).then_some(payload))
}

fn movie(file: &mut File) -> Option<Vec<u8>> {
    let length = file.metadata().ok()?.len();
    let mut offset = 0;
    while offset + 8 <= length {
        file.seek(SeekFrom::Start(offset)).ok()?;
        let mut header = [0_u8; 16];
        file.read_exact(&mut header[..8]).ok()?;
        let (size, header_length) = match be32(&header, 0)? {
            0 => (length - offset, 8),
            1 => {
                file.read_exact(&mut header[8..]).ok()?;
                (be64(&header, 8)?, 16)
            }
            size => (u64::from(size), 8),
        };
        if size < header_length {
            return None;
        }
        if &header[4..8] == b"moov" {
            let mut data = vec![0; (size - header_length) as usize];
            file.read_exact(&mut data).ok()?;
            return Some(data);
        }
        offset += size;
    }
    None
}

fn language(packed: u16) -> Option<String> {
    let code: String = [10, 5, 0]
        .iter()
        .map(|shift| char::from(((packed >> shift) & 0x1f) as u8 + 0x60))
        .collect();
    (code != "und" && code.chars().all(|character| character.is_ascii_lowercase())).then_some(code)
}

fn track(trak: &[u8]) -> Option<Track<'_>> {
    let header = child(trak, b"tkhd")?;
    let id = be32(header, if header[0] == 1 { 20 } else { 12 })?;
    let media = child(trak, b"mdia")?;
    let media_header = child(media, b"mdhd")?;
    let (timescale_at, language_at) = if media_header[0] == 1 {
        (20, 32)
    } else {
        (12, 20)
    };
    let packed = u16::from_be_bytes(
        media_header
            .get(language_at..language_at + 2)?
            .try_into()
            .ok()?,
    );
    let table = child(child(media, b"minf")?, b"stbl")?;
    Some(Track {
        id,
        handler: fourcc(child(media, b"hdlr")?, 8)?,
        codec: fourcc(child(table, b"stsd")?, 12)?,
        language: language(packed),
        timescale: be32(media_header, timescale_at)?,
        table,
    })
}

fn codec_name(codec: &[u8; 4]) -> &'static str {
    match codec {
        b"avc1" | b"avc3" => "H.264",
        b"hvc1" | b"hev1" => "HEVC",
        b"dvh1" | b"dvhe" => "Dolby Vision",
        b"av01" => "AV1",
        b"vp09" => "VP9",
        b"vp08" => "VP8",
        b"mp4v" => "MPEG-4 Part 2",
        b"apch" | b"apcn" | b"apcs" | b"apco" | b"ap4h" => "ProRes",
        b"mp4a" => "AAC",
        b"ac-3" => "Dolby Digital",
        b"ec-3" => "Dolby Digital Plus",
        b"Opus" => "Opus",
        b"fLaC" => "FLAC",
        b"alac" => "ALAC",
        b".mp3" => "MP3",
        b"lpcm" | b"sowt" | b"twos" => "PCM",
        _ => "an uncommon format",
    }
}

pub fn streams(path: &Path) -> Option<Streams> {
    let moov = movie(&mut File::open(path).ok()?)?;
    let tracks: Vec<Track> = children(&moov)
        .into_iter()
        .filter(|(kind, _)| kind == b"trak")
        .filter_map(|(_, trak)| track(trak))
        .collect();
    let first = |handler: &[u8; 4]| {
        tracks
            .iter()
            .find(|track| &track.handler == handler)
            .map(|track| codec_name(&track.codec))
    };
    Some(Streams {
        video: first(b"vide"),
        audio: first(b"soun"),
        subtitles: tracks
            .iter()
            .filter(|track| {
                SUBTITLE_HANDLERS.contains(&&track.handler) && TEXT_CODECS.contains(&&track.codec)
            })
            .map(|track| SubtitleTrack {
                id: format!("mp4:{}", track.id),
                label: None,
                language: track.language.clone(),
                path: None,
            })
            .collect(),
    })
}

struct Sample {
    offset: u64,
    size: u32,
    start: u64,
    duration: u32,
}

fn samples(table: &[u8]) -> Option<Vec<Sample>> {
    let sizes_box = child(table, b"stsz")?;
    let uniform = be32(sizes_box, 4)?;
    let count = be32(sizes_box, 8)? as usize;
    let size = |index: usize| {
        if uniform != 0 {
            Some(uniform)
        } else {
            be32(sizes_box, 12 + index * 4)
        }
    };
    let offsets: Vec<u64> = if let Some(offsets) = child(table, b"stco") {
        (0..be32(offsets, 4)? as usize)
            .map(|index| be32(offsets, 8 + index * 4).map(u64::from))
            .collect::<Option<_>>()?
    } else {
        let offsets = child(table, b"co64")?;
        (0..be32(offsets, 4)? as usize)
            .map(|index| be64(offsets, 8 + index * 8))
            .collect::<Option<_>>()?
    };
    let chunk_runs = child(table, b"stsc")?;
    let runs: Vec<(usize, u32)> = (0..be32(chunk_runs, 4)? as usize)
        .map(|index| {
            let at = 8 + index * 12;
            Some((be32(chunk_runs, at)? as usize, be32(chunk_runs, at + 4)?))
        })
        .collect::<Option<_>>()?;
    let times = child(table, b"stts")?;
    let mut durations = Vec::with_capacity(count);
    for index in 0..be32(times, 4)? as usize {
        let at = 8 + index * 8;
        durations.extend(std::iter::repeat_n(
            be32(times, at + 4)?,
            be32(times, at)? as usize,
        ));
    }
    let mut samples = Vec::with_capacity(count);
    let mut start = 0_u64;
    for (chunk, &chunk_offset) in offsets.iter().enumerate() {
        let per_chunk = runs
            .iter()
            .rev()
            .find(|(first, _)| *first <= chunk + 1)
            .map_or(0, |(_, per_chunk)| *per_chunk);
        let mut offset = chunk_offset;
        for _ in 0..per_chunk {
            let index = samples.len();
            if index >= count {
                return Some(samples);
            }
            let size = size(index)?;
            let duration = durations.get(index).copied().unwrap_or(0);
            samples.push(Sample {
                offset,
                size,
                start,
                duration,
            });
            offset += u64::from(size);
            start += u64::from(duration);
        }
    }
    Some(samples)
}

fn sample_text(codec: &[u8; 4], data: &[u8]) -> String {
    if codec == b"wvtt" {
        return children(data)
            .into_iter()
            .filter(|(kind, _)| kind == b"vttc")
            .filter_map(|(_, cue)| child(cue, b"payl"))
            .map(String::from_utf8_lossy)
            .collect::<Vec<_>>()
            .join("\n");
    }
    let length = data.get(..2).map_or(0, |length| {
        u16::from_be_bytes([length[0], length[1]]) as usize
    });
    data.get(2..2 + length)
        .map(|text| String::from_utf8_lossy(text).into_owned())
        .unwrap_or_default()
}

pub fn cues(path: &Path, id: u32) -> Result<Vec<Cue>, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let moov = movie(&mut file).ok_or("This video has no index")?;
    let track = children(&moov)
        .into_iter()
        .filter(|(kind, _)| kind == b"trak")
        .filter_map(|(_, trak)| track(trak))
        .find(|track| track.id == id)
        .ok_or("Unknown track")?;
    let timescale = f64::from(track.timescale.max(1));
    let mut cues = Vec::new();
    for sample in samples(track.table).ok_or("This track can't be read")? {
        let mut data = vec![0; sample.size as usize];
        file.seek(SeekFrom::Start(sample.offset))
            .and_then(|_| file.read_exact(&mut data))
            .map_err(|error| error.to_string())?;
        let text = sample_text(&track.codec, &data);
        if text.trim().is_empty() {
            continue;
        }
        cues.push(Cue {
            start: sample.start as f64 / timescale,
            end: (sample.start + u64::from(sample.duration)) as f64 / timescale,
            text: text.trim().to_string(),
        });
    }
    Ok(cues)
}
