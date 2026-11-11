use std::collections::HashMap;
use std::ffi::CString;

const MOUNT_TABLE: &str = "/proc/self/mountinfo";

pub fn overview_first(mount_points: &mut [String]) {
    if mount_points.len() < 2 {
        return;
    }
    let table = std::fs::read_to_string(MOUNT_TABLE).unwrap_or_default();
    order(mount_points, &table, readable);
}

fn order(mount_points: &mut [String], table: &str, readable: impl Fn(&str) -> bool) {
    let roots = roots(table);
    mount_points.sort_by_cached_key(|point| {
        (
            !readable(point),
            roots.get(point).map_or(usize::MAX, |root| depth(root)),
            depth(point),
        )
    });
}

fn roots(table: &str) -> HashMap<String, String> {
    table
        .lines()
        .filter_map(|line| {
            let mut fields = line.split(' ').skip(3);
            let root = fields.next()?;
            let point = fields.next()?;
            Some((unescape(point), unescape(root)))
        })
        .collect()
}

fn unescape(field: &str) -> String {
    field.replace("\\040", " ")
}

fn depth(path: &str) -> usize {
    path.split('/').filter(|part| !part.is_empty()).count()
}

fn readable(path: &str) -> bool {
    CString::new(path)
        .is_ok_and(|path| unsafe { libc::access(path.as_ptr(), libc::R_OK | libc::X_OK) } == 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    const LUFT: &str = "\
30 1 0:27 /luft /sysroot rw,relatime - btrfs /dev/mapper/luks-1 rw,subvol=/luft
31 30 0:27 /luft/ostree/deploy/default/deploy/abc.0/etc /etc rw,relatime - btrfs /dev/mapper/luks-1 rw,subvol=/luft
32 30 0:27 /luft/ostree/deploy/default/var /var rw,relatime - btrfs /dev/mapper/luks-1 rw,subvol=/luft
";

    fn ordered(points: &[&str], table: &str, readable: impl Fn(&str) -> bool) -> Vec<String> {
        let mut points: Vec<String> = points.iter().map(|point| (*point).to_owned()).collect();
        order(&mut points, table, readable);
        points
    }

    #[test]
    fn the_mount_holding_the_others_comes_first() {
        let points = ordered(&["/etc", "/sysroot", "/var"], LUFT, |_| true);
        assert_eq!(points, ["/sysroot", "/var", "/etc"]);
    }

    #[test]
    fn the_top_of_the_filesystem_beats_a_subvolume_below_it() {
        let table = "\
40 1 0:30 / /mnt/disk rw - btrfs /dev/sdb1 rw
41 1 0:31 /photos /mnt/photos rw - btrfs /dev/sdb1 rw,subvol=/photos
";
        let points = ordered(&["/mnt/photos", "/mnt/disk"], table, |_| true);
        assert_eq!(points, ["/mnt/disk", "/mnt/photos"]);
    }

    #[test]
    fn unreadable_mounts_come_last() {
        let points = ordered(&["/sysroot", "/var"], LUFT, |point| point != "/sysroot");
        assert_eq!(points, ["/var", "/sysroot"]);
    }

    #[test]
    fn mounts_outside_the_table_keep_their_order() {
        let points = ordered(&["/a", "/b"], "", |_| true);
        assert_eq!(points, ["/a", "/b"]);
    }
}
