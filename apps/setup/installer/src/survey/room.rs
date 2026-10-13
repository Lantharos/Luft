pub const ALIGNMENT: u64 = 1 << 20;
const GIB: u64 = 1 << 30;
const WINDOWS_HEADROOM: u64 = 20 * GIB;

pub fn align_down(bytes: u64) -> u64 {
    bytes / ALIGNMENT * ALIGNMENT
}

pub fn align_up(bytes: u64) -> u64 {
    bytes.div_ceil(ALIGNMENT) * ALIGNMENT
}

pub fn smallest_windows(used: u64, size: u64) -> u64 {
    align_up(used + WINDOWS_HEADROOM.max(used / 10)).min(size)
}

pub fn room_for_luft(windows_size: u64, smallest_windows: u64) -> u64 {
    align_down(windows_size.saturating_sub(smallest_windows))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn windows_keeps_room_to_grow() {
        let used = 60 * GIB + 123;
        let smallest = smallest_windows(used, 500 * GIB);
        assert!(smallest >= used + WINDOWS_HEADROOM);
        assert_eq!(smallest % ALIGNMENT, 0);
        assert_eq!(room_for_luft(500 * GIB, smallest), 500 * GIB - smallest);
    }

    #[test]
    fn a_full_windows_leaves_no_room() {
        assert_eq!(smallest_windows(250 * GIB, 256 * GIB), 256 * GIB);
        assert_eq!(room_for_luft(256 * GIB, 256 * GIB), 0);
    }
}
