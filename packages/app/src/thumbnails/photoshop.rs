use std::fs::File;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::Path;

use image::{DynamicImage, RgbaImage};

use super::raster;

const MIME: &str = "image/vnd.adobe.photoshop";
const SIGNATURE: &[u8; 4] = b"8BPS";
const PALETTE_BYTES: usize = 768;
const MAX_SIDE: u64 = 300_000;
const MAX_CHANNELS: u64 = 56;
const RAW: u16 = 0;
const PACK_BITS: u16 = 1;

enum Mode {
    Gray,
    Indexed(Vec<u8>),
    Rgb,
    Cmyk,
}

impl Mode {
    fn colors(&self) -> usize {
        match self {
            Self::Gray | Self::Indexed(_) => 1,
            Self::Rgb => 3,
            Self::Cmyk => 4,
        }
    }
}

struct Merged {
    width: u64,
    height: u64,
    channels: u64,
    sample_bytes: u64,
    large: bool,
}

impl Merged {
    fn row_bytes(&self) -> u64 {
        self.width * self.sample_bytes
    }
}

pub(super) fn is_photoshop(mime: &str) -> bool {
    mime == MIME
}

pub(super) fn render(path: &Path, max: u32) -> Result<RgbaImage, String> {
    let mut file = BufReader::new(File::open(path).map_err(|error| error.to_string())?);
    let (merged, mode_number) = header(&mut file)?;
    let colour_data = u64::from(read_u32(&mut file)?);
    let mode = match mode_number {
        1 | 8 => Mode::Gray,
        2 if colour_data == PALETTE_BYTES as u64 => {
            let mut palette = vec![0; PALETTE_BYTES];
            read_into(&mut file, &mut palette)?;
            Mode::Indexed(palette)
        }
        3 => Mode::Rgb,
        4 => Mode::Cmyk,
        _ => return Err("This colour mode has no thumbnail".to_string()),
    };
    if !matches!(mode, Mode::Indexed(_)) {
        seek_by(&mut file, colour_data)?;
    }
    let resources = u64::from(read_u32(&mut file)?);
    seek_by(&mut file, resources)?;
    let transparent = merged_has_alpha(&mut file, merged.large)?;
    let colors = mode.colors() as u64;
    if merged.channels < colors {
        return Err("The picture is missing channels".to_string());
    }
    let alpha = (transparent && merged.channels > colors).then_some(colors);
    let step = (merged.width.max(merged.height) / (2 * u64::from(max.max(1)))).max(1);
    let columns: Vec<u64> = (0..merged.width).step_by(step as usize).collect();
    let rows: Vec<u64> = (0..merged.height).step_by(step as usize).collect();
    let read_channels = colors + u64::from(alpha.is_some());
    let mut reader = PlaneReader::new(&mut file, &merged, read_channels)?;
    let planes = (0..colors)
        .chain(alpha)
        .map(|channel| reader.plane(channel, &rows, &columns))
        .collect::<Result<Vec<_>, _>>()?;
    let pixels = compose(&mode, &planes, alpha.is_some());
    let image = RgbaImage::from_raw(columns.len() as u32, rows.len() as u32, pixels)
        .ok_or_else(|| "Could not build the thumbnail".to_string())?;
    raster::fit(DynamicImage::ImageRgba8(image), max)
}

fn header(file: &mut impl Read) -> Result<(Merged, u16), String> {
    let mut signature = [0; 4];
    read_into(file, &mut signature)?;
    if &signature != SIGNATURE {
        return Err("Not a Photoshop file".to_string());
    }
    let large = match read_u16(file)? {
        1 => false,
        2 => true,
        _ => return Err("Unknown Photoshop version".to_string()),
    };
    read_into(file, &mut [0; 6])?;
    let channels = u64::from(read_u16(file)?);
    let height = u64::from(read_u32(file)?);
    let width = u64::from(read_u32(file)?);
    let sample_bytes = match read_u16(file)? {
        8 => 1,
        16 => 2,
        _ => return Err("This bit depth has no thumbnail".to_string()),
    };
    if !(1..=MAX_SIDE).contains(&width)
        || !(1..=MAX_SIDE).contains(&height)
        || !(1..=MAX_CHANNELS).contains(&channels)
    {
        return Err("The picture's size is out of range".to_string());
    }
    let mode = read_u16(file)?;
    Ok((
        Merged {
            width,
            height,
            channels,
            sample_bytes,
            large,
        },
        mode,
    ))
}

fn merged_has_alpha(file: &mut (impl Read + Seek), large: bool) -> Result<bool, String> {
    let section = read_length(file, large)?;
    if section == 0 {
        return Ok(false);
    }
    let start = file.stream_position().map_err(|error| error.to_string())?;
    let layers = read_length(file, large)?;
    let transparent = layers >= 2 && (read_u16(file)? as i16) < 0;
    file.seek(SeekFrom::Start(start + section))
        .map_err(|error| error.to_string())?;
    Ok(transparent)
}

struct PlaneReader<'a, F> {
    file: &'a mut F,
    merged: &'a Merged,
    compression: u16,
    data: u64,
    row_starts: Vec<u64>,
    packed: Vec<u8>,
    row: Vec<u8>,
}

impl<'a, F: Read + Seek> PlaneReader<'a, F> {
    fn new(file: &'a mut F, merged: &'a Merged, channels: u64) -> Result<Self, String> {
        let compression = read_u16(file)?;
        let row_starts = match compression {
            RAW => Vec::new(),
            PACK_BITS => {
                let rows = channels * merged.height;
                let count_bytes = if merged.large { 4 } else { 2 };
                let mut starts = Vec::with_capacity(rows as usize + 1);
                let mut offset = 0;
                starts.push(offset);
                for _ in 0..rows {
                    offset += if merged.large {
                        u64::from(read_u32(file)?)
                    } else {
                        u64::from(read_u16(file)?)
                    };
                    starts.push(offset);
                }
                seek_by(
                    file,
                    (merged.channels - channels) * merged.height * count_bytes,
                )?;
                starts
            }
            _ => return Err("This compression has no thumbnail".to_string()),
        };
        let data = file.stream_position().map_err(|error| error.to_string())?;
        Ok(Self {
            file,
            merged,
            compression,
            data,
            row_starts,
            packed: Vec::new(),
            row: vec![0; merged.row_bytes() as usize],
        })
    }

    fn plane(&mut self, channel: u64, rows: &[u64], columns: &[u64]) -> Result<Vec<u8>, String> {
        let mut plane = Vec::with_capacity(rows.len() * columns.len());
        for &y in rows {
            self.read_row(channel * self.merged.height + y)?;
            let bytes = self.merged.sample_bytes;
            plane.extend(columns.iter().map(|&x| self.row[(x * bytes) as usize]));
        }
        Ok(plane)
    }

    fn read_row(&mut self, index: u64) -> Result<(), String> {
        if self.compression == RAW {
            seek_to(self.file, self.data + index * self.merged.row_bytes())?;
            return read_into(self.file, &mut self.row);
        }
        let start = self.row_starts[index as usize];
        let length = self.row_starts[index as usize + 1] - start;
        let row_bytes = self.merged.row_bytes();
        if length > row_bytes + row_bytes.div_ceil(128) {
            return Err("A row of the picture is damaged".to_string());
        }
        seek_to(self.file, self.data + start)?;
        self.packed.resize(length as usize, 0);
        read_into(self.file, &mut self.packed)?;
        unpack_bits(&self.packed, &mut self.row)
    }
}

fn unpack_bits(packed: &[u8], row: &mut [u8]) -> Result<(), String> {
    let broken = || "A row of the picture is damaged".to_string();
    let (mut input, mut output) = (0, 0);
    while output < row.len() {
        let header = *packed.get(input).ok_or_else(broken)? as i8;
        input += 1;
        match header {
            0.. => {
                let count = header as usize + 1;
                let literal = packed.get(input..input + count).ok_or_else(broken)?;
                row.get_mut(output..output + count)
                    .ok_or_else(broken)?
                    .copy_from_slice(literal);
                input += count;
                output += count;
            }
            -127..=-1 => {
                let count = 1 - header as isize;
                let value = *packed.get(input).ok_or_else(broken)?;
                row.get_mut(output..output + count as usize)
                    .ok_or_else(broken)?
                    .fill(value);
                input += 1;
                output += count as usize;
            }
            _ => {}
        }
    }
    Ok(())
}

fn compose(mode: &Mode, planes: &[Vec<u8>], alpha: bool) -> Vec<u8> {
    let opacity = alpha.then(|| &planes[planes.len() - 1]);
    (0..planes[0].len())
        .flat_map(|index| {
            let sample = |channel: usize| planes[channel][index];
            let [red, green, blue] = match mode {
                Mode::Gray => [sample(0); 3],
                Mode::Indexed(palette) => {
                    let entry = usize::from(sample(0));
                    [palette[entry], palette[256 + entry], palette[512 + entry]]
                }
                Mode::Rgb => [sample(0), sample(1), sample(2)],
                Mode::Cmyk => {
                    [0, 1, 2].map(|ink| (u16::from(sample(ink)) * u16::from(sample(3)) / 255) as u8)
                }
            };
            [
                red,
                green,
                blue,
                opacity.map_or(u8::MAX, |opacity| opacity[index]),
            ]
        })
        .collect()
}

fn seek_by(file: &mut impl Seek, distance: u64) -> Result<(), String> {
    let distance = i64::try_from(distance).map_err(|error| error.to_string())?;
    file.seek(SeekFrom::Current(distance))
        .map(drop)
        .map_err(|error| error.to_string())
}

fn seek_to(file: &mut impl Seek, position: u64) -> Result<(), String> {
    file.seek(SeekFrom::Start(position))
        .map(drop)
        .map_err(|error| error.to_string())
}

fn read_into(file: &mut impl Read, buffer: &mut [u8]) -> Result<(), String> {
    file.read_exact(buffer).map_err(|error| error.to_string())
}

fn read_length(file: &mut impl Read, large: bool) -> Result<u64, String> {
    if large {
        read_u64(file)
    } else {
        read_u32(file).map(u64::from)
    }
}

fn read_u16(file: &mut impl Read) -> Result<u16, String> {
    let mut bytes = [0; 2];
    read_into(file, &mut bytes)?;
    Ok(u16::from_be_bytes(bytes))
}

fn read_u32(file: &mut impl Read) -> Result<u32, String> {
    let mut bytes = [0; 4];
    read_into(file, &mut bytes)?;
    Ok(u32::from_be_bytes(bytes))
}

fn read_u64(file: &mut impl Read) -> Result<u64, String> {
    let mut bytes = [0; 8];
    read_into(file, &mut bytes)?;
    Ok(u64::from_be_bytes(bytes))
}
