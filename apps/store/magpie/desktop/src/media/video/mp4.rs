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

fn movie(file: &mut (impl Read + Seek)) -> Option<Vec<u8>> {
    let length = file.seek(SeekFrom::End(0)).ok()?;
    let mut offset = 0;
    while length - offset >= 8 {
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
        if size < header_length || size > length - offset {
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
    let id = be32(header, if *header.first()? == 1 { 20 } else { 12 })?;
    let media = child(trak, b"mdia")?;
    let media_header = child(media, b"mdhd")?;
    let (timescale_at, language_at) = if *media_header.first()? == 1 {
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

struct Layout<'a> {
    sizes: &'a [u8],
    uniform_size: u32,
    count: u64,
    chunk_offsets: Vec<u64>,
    chunk_runs: Vec<(usize, u32)>,
    times: &'a [u8],
    time_runs: usize,
}

fn layout(table: &[u8]) -> Option<Layout<'_>> {
    let sizes = child(table, b"stsz")?;
    let chunk_offsets = if let Some(offsets) = child(table, b"stco") {
        (0..be32(offsets, 4)? as usize)
            .map(|index| be32(offsets, 8 + index * 4).map(u64::from))
            .collect::<Option<_>>()?
    } else {
        let offsets = child(table, b"co64")?;
        (0..be32(offsets, 4)? as usize)
            .map(|index| be64(offsets, 8 + index * 8))
            .collect::<Option<_>>()?
    };
    let runs = child(table, b"stsc")?;
    let chunk_runs = (0..be32(runs, 4)? as usize)
        .map(|index| {
            let at = 8 + index * 12;
            Some((be32(runs, at)? as usize, be32(runs, at + 4)?))
        })
        .collect::<Option<_>>()?;
    let times = child(table, b"stts")?;
    Some(Layout {
        sizes,
        uniform_size: be32(sizes, 4)?,
        count: u64::from(be32(sizes, 8)?),
        chunk_offsets,
        chunk_runs,
        times,
        time_runs: be32(times, 4)? as usize,
    })
}

fn samples(
    table: &[u8],
    file_length: u64,
    mut visit: impl FnMut(Sample) -> Result<(), String>,
) -> Result<(), String> {
    const UNREADABLE: &str = "This track can't be read";
    let layout = layout(table).ok_or(UNREADABLE)?;
    let mut durations = (0..layout.time_runs)
        .map_while(|index| {
            let at = 8 + index * 8;
            Some((be32(layout.times, at)?, be32(layout.times, at + 4)?))
        })
        .flat_map(|(run, duration)| std::iter::repeat_n(duration, run as usize));
    let count = if layout.uniform_size == 0 {
        layout.count
    } else {
        layout
            .count
            .min(file_length / u64::from(layout.uniform_size))
    };
    let mut index = 0;
    let mut start = 0_u64;
    for (chunk, &chunk_offset) in layout.chunk_offsets.iter().enumerate() {
        let per_chunk = layout
            .chunk_runs
            .iter()
            .rev()
            .find(|(first, _)| *first <= chunk + 1)
            .map_or(0, |(_, per_chunk)| *per_chunk);
        let mut offset = chunk_offset;
        for _ in 0..per_chunk {
            if index >= count {
                return Ok(());
            }
            let size = if layout.uniform_size != 0 {
                layout.uniform_size
            } else {
                be32(layout.sizes, 12 + index as usize * 4).ok_or(UNREADABLE)?
            };
            let end = offset
                .checked_add(u64::from(size))
                .filter(|end| *end <= file_length)
                .ok_or(UNREADABLE)?;
            let duration = durations.next().unwrap_or(0);
            visit(Sample {
                offset,
                size,
                start,
                duration,
            })?;
            index += 1;
            offset = end;
            start += u64::from(duration);
        }
    }
    Ok(())
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
    let file_length = file.metadata().map_err(|error| error.to_string())?.len();
    let track = children(&moov)
        .into_iter()
        .filter(|(kind, _)| kind == b"trak")
        .filter_map(|(_, trak)| track(trak))
        .find(|track| track.id == id)
        .ok_or("Unknown track")?;
    let timescale = f64::from(track.timescale.max(1));
    let mut cues = Vec::new();
    samples(track.table, file_length, |sample| {
        let mut data = vec![0; sample.size as usize];
        file.seek(SeekFrom::Start(sample.offset))
            .and_then(|_| file.read_exact(&mut data))
            .map_err(|error| error.to_string())?;
        let text = sample_text(&track.codec, &data);
        if !text.trim().is_empty() {
            cues.push(Cue {
                start: sample.start as f64 / timescale,
                end: (sample.start + u64::from(sample.duration)) as f64 / timescale,
                text: text.trim().to_string(),
            });
        }
        Ok(())
    })?;
    Ok(cues)
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use super::*;

    fn boxed(kind: &[u8; 4], payload: &[u8]) -> Vec<u8> {
        let mut bytes = (payload.len() as u32 + 8).to_be_bytes().to_vec();
        bytes.extend_from_slice(kind);
        bytes.extend_from_slice(payload);
        bytes
    }

    fn words(values: &[u32]) -> Vec<u8> {
        values
            .iter()
            .flat_map(|value| value.to_be_bytes())
            .collect()
    }

    fn sample_table(sizes: &[u32], chunk_offsets: &[u32], runs: &[u32], times: &[u32]) -> Vec<u8> {
        [
            boxed(b"stsz", &words(sizes)),
            boxed(b"stco", &words(chunk_offsets)),
            boxed(b"stsc", &words(runs)),
            boxed(b"stts", &words(times)),
        ]
        .concat()
    }

    #[test]
    fn finds_the_index_after_other_boxes() {
        let mut file = boxed(b"ftyp", b"isom");
        file.extend(boxed(b"moov", b"index"));
        assert_eq!(
            movie(&mut Cursor::new(file)).as_deref(),
            Some(&b"index"[..])
        );
    }

    #[test]
    fn refuses_an_index_larger_than_the_file() {
        let mut file = words(&[1]);
        file.extend_from_slice(b"moov");
        file.extend(u64::MAX.to_be_bytes());
        assert_eq!(movie(&mut Cursor::new(file)), None);
    }

    #[test]
    fn refuses_a_box_that_runs_past_the_file() {
        let mut file = words(&[1]);
        file.extend_from_slice(b"free");
        file.extend((u64::MAX - 7).to_be_bytes());
        file.extend(boxed(b"moov", b"index"));
        assert_eq!(movie(&mut Cursor::new(file)), None);
    }

    #[test]
    fn skips_a_track_with_empty_headers() {
        let media = [boxed(b"mdhd", &[]), boxed(b"hdlr", &[0; 12])].concat();
        assert!(track(&boxed(b"tkhd", &[])).is_none());
        assert!(track(&[boxed(b"tkhd", &[0; 16]), boxed(b"mdia", &media)].concat()).is_none());
    }

    fn laid_out(table: &[u8], file_length: u64) -> Result<Vec<(u64, u32, u64, u32)>, String> {
        let mut found = Vec::new();
        samples(table, file_length, |sample| {
            found.push((sample.offset, sample.size, sample.start, sample.duration));
            Ok(())
        })?;
        Ok(found)
    }

    #[test]
    fn lays_samples_out_by_chunk() {
        let table = sample_table(
            &[0, 0, 3, 10, 20, 30],
            &[0, 2, 100, 200],
            &[0, 2, 1, 2, 0, 2, 1, 0],
            &[0, 2, 2, 5, 1, 7],
        );
        assert_eq!(
            laid_out(&table, 1000).unwrap(),
            [(100, 10, 0, 5), (110, 20, 5, 5), (200, 30, 10, 7)]
        );
    }

    #[test]
    fn samples_stay_inside_the_file() {
        let past_the_end =
            sample_table(&[0, 0, 1, 50], &[0, 1, 90], &[0, 1, 1, 1, 0], &[0, 1, 1, 1]);
        assert!(laid_out(&past_the_end, 100).is_err());
        let claimed = sample_table(
            &[0, 4, u32::MAX],
            &[0, 1, 0],
            &[0, 1, 1, u32::MAX, 0],
            &[0, 1, u32::MAX, 1],
        );
        assert_eq!(laid_out(&claimed, 40).unwrap().len(), 10);
    }
}
