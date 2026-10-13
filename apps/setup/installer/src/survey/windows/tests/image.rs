use std::fs::{self, File};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::{Duration, SystemTime};

const IMAGE_SIZE: u64 = 32 << 20;
const TOOLS: [&str; 4] = ["mkntfs", "ntfscluster", "ntfs-3g", "unshare"];
const POPULATE: &str =
    r#"ntfs-3g "$1" "$2" && cp -r --preserve=timestamps "$3"/. "$2"/ && umount "$2""#;

pub(super) struct Image {
    directory: PathBuf,
    pub(super) path: PathBuf,
}

pub(super) struct Entry {
    pub(super) path: &'static str,
    pub(super) contents: Vec<u8>,
    pub(super) age_days: u64,
}

impl Image {
    pub(super) fn build(name: &str, entries: &[Entry]) -> Option<Self> {
        if TOOLS.iter().any(|tool| !installed(tool)) {
            eprintln!(
                "skipping: {} are needed to build NTFS images",
                TOOLS.join(", ")
            );
            return None;
        }
        let directory =
            std::env::temp_dir().join(format!("luft-windows-{}-{name}", std::process::id()));
        let staging = directory.join("staging");
        let mountpoint = directory.join("mount");
        fs::create_dir_all(&staging).unwrap();
        fs::create_dir_all(&mountpoint).unwrap();
        let image = Self {
            path: directory.join("volume.img"),
            directory,
        };

        for entry in entries {
            let path = staging.join(entry.path);
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            fs::write(&path, &entry.contents).unwrap();
            let age = Duration::from_secs(entry.age_days * 86_400);
            File::options()
                .write(true)
                .open(&path)
                .unwrap()
                .set_modified(SystemTime::now() - age)
                .unwrap();
        }

        File::create(&image.path)
            .unwrap()
            .set_len(IMAGE_SIZE)
            .unwrap();
        run(Command::new("mkntfs")
            .args(["-F", "-Q", "-q"])
            .arg(&image.path));
        if !entries.is_empty() {
            run(Command::new("unshare")
                .args([
                    "--map-root-user",
                    "--map-auto",
                    "--mount",
                    "sh",
                    "-c",
                    POPULATE,
                    "sh",
                ])
                .args([&image.path, &mountpoint, &staging]));
        }
        Some(image)
    }

    pub(super) fn open(&self) -> File {
        File::open(&self.path).unwrap()
    }

    pub(super) fn used_bytes(&self) -> u64 {
        let output = Command::new("ntfscluster")
            .arg("-i")
            .arg(&self.path)
            .output()
            .unwrap();
        let report = String::from_utf8(output.stdout).unwrap();
        let field = |label: &str| -> u64 {
            report
                .lines()
                .find_map(|line| line.strip_prefix(label)?.trim().strip_prefix(':'))
                .unwrap()
                .trim()
                .parse()
                .unwrap()
        };
        field("bytes per volume") - field("bytes of free space")
    }
}

impl Drop for Image {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.directory).unwrap();
    }
}

fn installed(tool: &str) -> bool {
    Command::new("sh")
        .args(["-c", r#"command -v "$1""#, "sh", tool])
        .stdout(Stdio::null())
        .status()
        .unwrap()
        .success()
}

fn run(command: &mut Command) {
    let output = command.output().unwrap();
    assert!(
        output.status.success(),
        "{command:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}
