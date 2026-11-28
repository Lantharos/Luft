use std::fs;
use std::io;
use std::os::unix::fs::MetadataExt;
use std::path::Path;

const KIB: u64 = 1024;
const ZSWAP: &str = "/sys/module/zswap/parameters";
const ZSWAP_SETTINGS: [(&str, &str); 3] = [
    ("compressor", "zstd"),
    ("shrinker_enabled", "Y"),
    ("enabled", "Y"),
];

pub struct Memory {
    pub total: u64,
    pub available: u64,
}

pub struct Active {
    pub device: u64,
    pub inode: u64,
    pub size: u64,
    pub used: u64,
}

pub fn memory() -> io::Result<Memory> {
    let meminfo = fs::read_to_string("/proc/meminfo")?;
    let field = |name: &str| {
        meminfo
            .lines()
            .find_map(|line| line.strip_prefix(name)?.strip_prefix(':'))
            .and_then(|value| value.split_whitespace().next()?.parse::<u64>().ok())
            .map(|kib| kib * KIB)
            .ok_or_else(|| {
                io::Error::new(
                    io::ErrorKind::InvalidData,
                    format!("/proc/meminfo has no {name}"),
                )
            })
    };
    Ok(Memory {
        total: field("MemTotal")?,
        available: field("MemAvailable")?,
    })
}

pub fn active_files() -> io::Result<Vec<Active>> {
    Ok(parse_swaps(&fs::read_to_string("/proc/swaps")?)
        .into_iter()
        .filter_map(|(path, size, used)| {
            let file = fs::metadata(path).ok()?;
            file.is_file().then(|| Active {
                device: file.dev(),
                inode: file.ino(),
                size,
                used,
            })
        })
        .collect())
}

fn parse_swaps(swaps: &str) -> Vec<(&str, u64, u64)> {
    swaps
        .lines()
        .skip(1)
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let path = fields.next()?;
            let _kind = fields.next()?;
            let size = fields.next()?.parse::<u64>().ok()?;
            let used = fields.next()?.parse::<u64>().ok()?;
            Some((path, size * KIB, used * KIB))
        })
        .collect()
}

pub fn turn_on_zswap() {
    for (setting, value) in ZSWAP_SETTINGS {
        if let Err(error) = fs::write(Path::new(ZSWAP).join(setting), value) {
            eprintln!("Couldn't set zswap's {setting} to {value}: {error}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_swap_sizes_and_use() {
        let swaps = "Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n\
                     /var/swap/0                             file\t\t4194300\t\t1048576\t\t32767\n\
                     /var/swap/1                             file\t\t4194300\t\t0\t\t32766\n";
        assert_eq!(
            parse_swaps(swaps),
            [
                ("/var/swap/0", 4194300 * KIB, 1048576 * KIB),
                ("/var/swap/1", 4194300 * KIB, 0)
            ]
        );
    }
}
