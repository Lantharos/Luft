pub const MIB: u64 = 1 << 20;
pub const GIB: u64 = 1 << 30;
pub const ALIGNMENT: u64 = MIB;
pub const SMALLEST_SYSTEM: u64 = 32 * GIB;
pub const STARTUP_PARTITION: u64 = 2 * GIB;
pub const SMALLEST_SHARED_ESP: u64 = GIB;
pub const BOX_CLUSTER: u64 = 4096;
const WINDOWS_HEADROOM: u64 = 20 * GIB;
const SMALLEST_START: u64 = 512 * MIB;
const START_SPARE: u64 = 64 * MIB;
const LIVE_SPARE: u64 = 256 * MIB;
const BOX_SPARE: u64 = 128 * MIB;

pub fn align_up(bytes: u64) -> u64 {
    bytes.div_ceil(ALIGNMENT) * ALIGNMENT
}

pub fn align_down(bytes: u64) -> u64 {
    bytes / ALIGNMENT * ALIGNMENT
}

pub fn smallest_windows(used: u64, supported: u64) -> u64 {
    align_up((used + WINDOWS_HEADROOM.max(used / 10)).max(supported))
}

pub fn smallest_luft(esp_size: u64) -> u64 {
    if esp_size < SMALLEST_SHARED_ESP {
        SMALLEST_SYSTEM + STARTUP_PARTITION
    } else {
        SMALLEST_SYSTEM
    }
}

pub fn start(files: u64) -> u64 {
    align_up(files + files / 10 + START_SPARE).max(SMALLEST_START)
}

pub fn live(files: u64) -> u64 {
    align_up(files + LIVE_SPARE)
}

pub fn moving_box(files: u64, bytes: u64) -> u64 {
    let clusters = bytes.div_ceil(BOX_CLUSTER) + files;
    align_up(clusters * BOX_CLUSTER + bytes / 100 + BOX_SPARE)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn windows_keeps_room_to_grow_and_what_it_cant_move() {
        assert_eq!(smallest_windows(60 * GIB, 0), 80 * GIB);
        assert_eq!(smallest_windows(300 * GIB, 0), 330 * GIB);
        assert_eq!(smallest_windows(10 * GIB, 90 * GIB), 90 * GIB);
    }

    #[test]
    fn a_small_esp_needs_a_startup_partition_too() {
        assert_eq!(smallest_luft(100 * MIB), 34 * GIB);
        assert_eq!(smallest_luft(2 * GIB), 32 * GIB);
    }

    #[test]
    fn partitions_fit_what_goes_on_them() {
        assert_eq!(start(150 * MIB), SMALLEST_START);
        assert!(live(3 * GIB) >= 3 * GIB + LIVE_SPARE);
        let many_small = moving_box(100_000, 100_000 * 100);
        assert!(many_small >= 100_000 * BOX_CLUSTER);
        for size in [start(700 * MIB), live(3 * GIB + 5), many_small] {
            assert_eq!(size % ALIGNMENT, 0);
        }
    }
}
