#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Entry {
    pub spec: String,
    pub file: String,
    pub vfs_type: String,
    pub options: String,
}

fn unescape(field: &str) -> String {
    let mut text = String::new();
    let mut rest = field;
    while let Some(at) = rest.find('\\') {
        text.push_str(&rest[..at]);
        let code = rest.get(at + 1..at + 4);
        match code.and_then(|digits| u8::from_str_radix(digits, 8).ok()) {
            Some(byte) => {
                text.push(byte as char);
                rest = &rest[at + 4..];
            }
            None => {
                text.push('\\');
                rest = &rest[at + 1..];
            }
        }
    }
    text.push_str(rest);
    text
}

pub fn parse(text: &str) -> Vec<Entry> {
    text.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            Some(Entry {
                spec: unescape(fields.next()?),
                file: unescape(fields.next()?),
                vfs_type: fields.next()?.to_owned(),
                options: fields.next().unwrap_or("defaults").to_owned(),
            })
        })
        .collect()
}

impl Entry {
    pub fn option(&self, name: &str) -> Option<&str> {
        self.options
            .split(',')
            .find_map(|option| option.strip_prefix(name)?.strip_prefix('='))
    }

    pub fn subvolume(&self) -> Option<String> {
        self.option("subvol")
            .map(|subvolume| subvolume.trim_start_matches('/').to_owned())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const FEDORA: &str = "
# /etc/fstab
UUID=5d3c0b62 /                       btrfs   subvol=root,compress=zstd:1 0 0
UUID=1e2f       /boot                   ext4    defaults        1 2
UUID=ABCD-1234          /boot/efi               vfat    umask=0077,shortname=winnt 0 2
UUID=5d3c0b62 /home                   btrfs   subvol=home,compress=zstd:1 0 0
LABEL=data /mnt/My\\040Data ext4 defaults 0 2
";

    #[test]
    fn reads_fedora_s_subvolumes_and_escaped_paths() {
        let entries = parse(FEDORA);
        assert_eq!(entries.len(), 5);
        assert_eq!(entries[0].subvolume().as_deref(), Some("root"));
        assert_eq!(entries[3].subvolume().as_deref(), Some("home"));
        assert_eq!(entries[4].file, "/mnt/My Data");
        assert_eq!(entries[2].option("umask"), Some("0077"));
    }
}
