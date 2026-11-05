use std::fs::File;
use std::io;
use std::ops::Range;
use std::path::Path;

use memmap2::{Advice, Mmap};

use super::{CHANNELS, RATE};

const RESIDENT_HEAD_FRAMES: usize = RATE as usize / 4;
const PAGE: usize = 4096;

/// A sound decoded to 48 kHz stereo floats, mapped from the app's data folder so a board of long sounds costs no memory
/// until it plays.
pub struct Pcm {
    map: Mmap,
}

impl Pcm {
    pub fn open(path: &Path) -> io::Result<Self> {
        let file = File::open(path)?;
        // SAFETY: the app is the only writer of its data folder, and writes these files whole before opening them.
        let map = unsafe { Mmap::map(&file)? };
        Ok(Self { map })
    }

    pub fn samples(&self) -> &[f32] {
        // SAFETY: every bit pattern is a valid f32, and align_to leaves out whatever isn't aligned.
        unsafe { self.map.align_to::<f32>().1 }
    }

    /// Reads the start of a range now and the rest ahead, so the mixing thread never waits on the disk.
    pub fn prefault(&self, frames: Range<usize>) {
        let bytes = |frame: usize| frame * CHANNELS * size_of::<f32>();
        let start = bytes(frames.start) / PAGE * PAGE;
        let head = bytes(frames.end.min(frames.start + RESIDENT_HEAD_FRAMES)) - start;
        let rest = bytes(frames.end) - start;
        if rest == 0 {
            return;
        }
        let _ = self.map.advise_range(Advice::PopulateRead, start, head);
        let _ = self.map.advise_range(Advice::WillNeed, start, rest);
    }
}

pub fn write(path: &Path, samples: &[f32]) -> io::Result<()> {
    // SAFETY: an f32 slice is plain bytes of the same length.
    let (_, bytes, _) = unsafe { samples.align_to::<u8>() };
    luft_app::files::replace(path, bytes)
}
