use alloc::vec::Vec;

const BLOCK: usize = 128;
const HEADER: [u8; 8] = [0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00];
const DETAILED: [usize; 4] = [54, 72, 90, 108];
const CTA_EXTENSION: u8 = 0x02;
const ESTABLISHED: [(usize, u8, (u32, u32)); 17] = [
    (35, 7, (720, 400)),
    (35, 6, (720, 400)),
    (35, 5, (640, 480)),
    (35, 4, (640, 480)),
    (35, 3, (640, 480)),
    (35, 2, (640, 480)),
    (35, 1, (800, 600)),
    (35, 0, (800, 600)),
    (36, 7, (800, 600)),
    (36, 6, (800, 600)),
    (36, 5, (832, 624)),
    (36, 4, (1024, 768)),
    (36, 3, (1024, 768)),
    (36, 2, (1024, 768)),
    (36, 1, (1024, 768)),
    (36, 0, (1280, 1024)),
    (37, 7, (1152, 870)),
];

/// The picture sizes a monitor declares in its EDID, and the one its panel is made for.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Monitor {
    pub native: (u32, u32),
    sizes: Vec<(u32, u32)>,
}

fn detailed(descriptor: &[u8]) -> Option<(u32, u32)> {
    if descriptor[0] == 0 && descriptor[1] == 0 {
        return None;
    }
    let width = u32::from(descriptor[2]) | (u32::from(descriptor[4]) & 0xf0) << 4;
    let lines = u32::from(descriptor[5]) | (u32::from(descriptor[7]) & 0xf0) << 4;
    let interlaced = descriptor[17] & 0x80 != 0;
    let height = if interlaced { lines * 2 } else { lines };
    (width > 0 && height > 0).then_some((width, height))
}

fn standard(timing: &[u8], revision: u8) -> Option<(u32, u32)> {
    if timing[0] <= 1 {
        return None;
    }
    let width = (u32::from(timing[0]) + 31) * 8;
    let height = match timing[1] >> 6 {
        0 if revision < 3 => width,
        0 => width * 10 / 16,
        1 => width * 3 / 4,
        2 => width * 4 / 5,
        _ => width * 9 / 16,
    };
    Some((width, height))
}

fn same_aspect(a: (u32, u32), b: (u32, u32)) -> bool {
    let (left, right) = (
        u64::from(a.0) * u64::from(b.1),
        u64::from(b.0) * u64::from(a.1),
    );
    left.abs_diff(right) * 100 <= left.max(right)
}

impl Monitor {
    pub fn from_edid(data: &[u8]) -> Option<Self> {
        let base = data.get(..BLOCK)?;
        if base[..HEADER.len()] != HEADER {
            return None;
        }
        let mut sizes: Vec<(u32, u32)> = DETAILED
            .iter()
            .filter_map(|&at| detailed(&base[at..at + 18]))
            .collect();
        let native = *sizes.first()?;
        sizes.extend(
            ESTABLISHED
                .iter()
                .filter(|(byte, bit, _)| base[*byte] & (1 << bit) != 0)
                .map(|(_, _, size)| *size),
        );
        sizes.extend(
            base[38..54]
                .as_chunks::<2>()
                .0
                .iter()
                .filter_map(|timing| standard(timing, base[19])),
        );
        for extension in data[BLOCK..]
            .as_chunks::<BLOCK>()
            .0
            .iter()
            .filter(|block| block[0] == CTA_EXTENSION && block[2] >= 4)
        {
            sizes.extend(
                extension[usize::from(extension[2])..BLOCK - 1]
                    .as_chunks::<18>()
                    .0
                    .iter()
                    .filter_map(|descriptor| detailed(descriptor)),
            );
        }
        Some(Self { native, sizes })
    }

    fn shows(&self, size: (u32, u32)) -> bool {
        self.sizes.contains(&size)
    }

    /// The best of the given sizes this monitor can show: its own if offered, else the largest one shaped like the panel.
    pub fn best(&self, offered: impl IntoIterator<Item = (u32, u32)>) -> Option<(u32, u32)> {
        offered
            .into_iter()
            .filter(|size| self.shows(*size))
            .max_by_key(|&(width, height)| {
                (
                    (width, height) == self.native,
                    same_aspect((width, height), self.native),
                    u64::from(width) * u64::from(height),
                )
            })
    }
}
