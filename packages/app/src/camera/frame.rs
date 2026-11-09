use pipewire::spa::param::video::VideoFormat;

/// How a frame's pixels are packed, as negotiated with the camera.
#[derive(Clone, Copy, Default)]
pub enum Packing {
    #[default]
    Unknown,
    Jpeg,
    Raw {
        format: VideoFormat,
        width: u32,
        height: u32,
    },
}

const JPEG: u8 = 0;
const RGBA: u8 = 1;
const HEADER: usize = 12;

/// A frame as it goes to a page: a byte saying JPEG or RGBA, three spare,
/// the width and height as little endian u32 (zero for JPEG), then the
/// pixels.
pub struct Frame(Vec<u8>);

impl Frame {
    pub fn is_jpeg(&self) -> bool {
        self.0[0] == JPEG
    }

    /// The width and height of RGBA pixels.
    pub fn size(&self) -> (u32, u32) {
        let word =
            |at: usize| u32::from_le_bytes(self.0[at..at + 4].try_into().expect("four bytes"));
        (word(4), word(8))
    }

    /// The JPEG file or the RGBA pixels.
    pub fn pixels(&self) -> &[u8] {
        &self.0[HEADER..]
    }

    /// The frame as it goes to a page.
    pub fn as_bytes(&self) -> &[u8] {
        &self.0
    }

    pub fn into_bytes(self) -> Vec<u8> {
        self.0
    }
}

pub fn encode(packing: Packing, bytes: &[u8], stride: usize) -> Option<Frame> {
    match packing {
        Packing::Unknown => None,
        Packing::Jpeg => Some(framed(JPEG, 0, 0, bytes.len(), |out| {
            out.extend_from_slice(bytes)
        })),
        Packing::Raw {
            format,
            width,
            height,
        } => {
            let rows = bytes.chunks(stride.max(1)).take(height as usize);
            let pixels = (width * height * 4) as usize;
            Some(framed(RGBA, width, height, pixels, |out| {
                for row in rows {
                    rgba(format, row, width as usize, out);
                }
            }))
        }
    }
}

fn framed(
    kind: u8,
    width: u32,
    height: u32,
    size: usize,
    fill: impl FnOnce(&mut Vec<u8>),
) -> Frame {
    let mut out = Vec::with_capacity(HEADER + size);
    out.extend_from_slice(&[kind, 0, 0, 0]);
    out.extend_from_slice(&width.to_le_bytes());
    out.extend_from_slice(&height.to_le_bytes());
    fill(&mut out);
    Frame(out)
}

fn rgba(format: VideoFormat, row: &[u8], width: usize, out: &mut Vec<u8>) {
    match format {
        VideoFormat::YUY2 => {
            for pair in row.as_chunks::<4>().0.iter().take(width / 2) {
                let &[y0, u, y1, v] = pair;
                out.extend_from_slice(&yuv(y0, u, v));
                out.extend_from_slice(&yuv(y1, u, v));
            }
        }
        VideoFormat::RGB => {
            for pixel in row.as_chunks::<3>().0.iter().take(width) {
                out.extend_from_slice(&[pixel[0], pixel[1], pixel[2], 255]);
            }
        }
        VideoFormat::BGRx => {
            for pixel in row.as_chunks::<4>().0.iter().take(width) {
                out.extend_from_slice(&[pixel[2], pixel[1], pixel[0], 255]);
            }
        }
        _ => {
            for pixel in row.as_chunks::<4>().0.iter().take(width) {
                out.extend_from_slice(&[pixel[0], pixel[1], pixel[2], 255]);
            }
        }
    }
}

fn yuv(y: u8, u: u8, v: u8) -> [u8; 4] {
    let c = f32::from(y) - 16.0;
    let d = f32::from(u) - 128.0;
    let e = f32::from(v) - 128.0;
    let clamp = |value: f32| value.clamp(0.0, 255.0) as u8;
    [
        clamp(1.164 * c + 1.596 * e),
        clamp(1.164 * c - 0.392 * d - 0.813 * e),
        clamp(1.164 * c + 2.017 * d),
        255,
    ]
}
