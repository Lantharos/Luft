use std::fs::{self, DirBuilder};
use std::io::{self, Write};
use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::OnceLock;
use std::sync::atomic::{AtomicU64, Ordering};

use image::DynamicImage;

use super::seccomp;

const SHARED_ROOT_LINKS: [&str; 4] = ["/bin", "/lib", "/lib64", "/sbin"];
const SYSTEM_FILES: [&str; 5] = [
    "/etc/ld.so.cache",
    "/etc/alternatives",
    "/etc/fonts",
    "/var/cache/fontconfig",
    "/var/lib/flatpak/appstream",
];
const OUTPUT_NAME: &str = "thumbnail.png";

pub struct Sandbox {
    folder: PathBuf,
}

impl Sandbox {
    pub fn new() -> io::Result<Self> {
        static NEXT: AtomicU64 = AtomicU64::new(0);
        let folder = dirs::runtime_dir()
            .unwrap_or_else(std::env::temp_dir)
            .join(format!(
                "luft-thumbnail-{}-{}",
                std::process::id(),
                NEXT.fetch_add(1, Ordering::Relaxed)
            ));
        DirBuilder::new().mode(0o700).create(&folder)?;
        Ok(Self { folder })
    }

    pub fn output(&self) -> PathBuf {
        self.folder.join(OUTPUT_NAME)
    }

    pub fn thumbnail(&self) -> Result<DynamicImage, String> {
        let output = self.output();
        if !fs::symlink_metadata(&output).is_ok_and(|metadata| metadata.is_file()) {
            return Err("The thumbnailer wrote no image".to_string());
        }
        image::open(output).map_err(|error| error.to_string())
    }

    pub fn command(
        &self,
        input: &Path,
        program: &str,
        arguments: &[String],
    ) -> io::Result<Command> {
        let (filter, mut writer) = io::pipe()?;
        writer.write_all(&seccomp::no_new_namespaces())?;
        drop(writer);
        let mut command = Command::new("bwrap");
        command
            .args(base_arguments())
            .arg("--ro-bind")
            .args([input, input])
            .arg("--bind")
            .args([&self.folder, &self.folder])
            .args(["--seccomp", "0", "--", program])
            .args(arguments)
            .stdin(filter);
        Ok(command)
    }
}

impl Drop for Sandbox {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.folder);
    }
}

fn base_arguments() -> &'static [String] {
    static ARGUMENTS: OnceLock<Vec<String>> = OnceLock::new();
    ARGUMENTS.get_or_init(|| {
        let mut arguments = strings(&[
            "--unshare-all",
            "--die-with-parent",
            "--new-session",
            "--clearenv",
            "--ro-bind",
            "/usr",
            "/usr",
        ]);
        for link in SHARED_ROOT_LINKS {
            match fs::read_link(link) {
                Ok(target) => arguments.extend([
                    "--symlink".to_string(),
                    target.to_string_lossy().into_owned(),
                    link.to_string(),
                ]),
                Err(_) => arguments.extend(strings(&["--ro-bind-try", link, link])),
            }
        }
        let user_appstream = dirs::data_dir().map(|data| data.join("flatpak/appstream"));
        for file in SYSTEM_FILES
            .into_iter()
            .map(PathBuf::from)
            .chain(user_appstream)
        {
            let file = file.to_string_lossy().into_owned();
            arguments.extend(["--ro-bind-try".to_string(), file.clone(), file]);
        }
        arguments.extend(strings(&[
            "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp", "--chdir", "/",
        ]));
        arguments.extend(environment());
        arguments.extend(gstreamer_cache());
        arguments
    })
}

fn environment() -> Vec<String> {
    let home = dirs::home_dir().map_or_else(
        || "/tmp".to_string(),
        |home| home.to_string_lossy().into_owned(),
    );
    [
        ("PATH", "/usr/bin"),
        ("HOME", home.as_str()),
        ("LC_ALL", "C.UTF-8"),
        ("GIO_USE_VFS", "local"),
    ]
    .into_iter()
    .flat_map(|(name, value)| strings(&["--setenv", name, value]))
    .collect()
}

fn gstreamer_cache() -> Vec<String> {
    let Some(folder) =
        dirs::cache_dir().map(|cache| cache.join("com.lantharos.thumbnailers/gstreamer-1.0"))
    else {
        return Vec::new();
    };
    if DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(&folder)
        .is_err()
    {
        return Vec::new();
    }
    let registry = folder.join("registry.bin");
    let folder = folder.to_string_lossy().into_owned();
    vec![
        "--setenv".to_string(),
        "GST_REGISTRY_1_0".to_string(),
        registry.to_string_lossy().into_owned(),
        "--bind".to_string(),
        folder.clone(),
        folder,
    ]
}

fn strings(values: &[&str]) -> Vec<String> {
    values.iter().map(|value| value.to_string()).collect()
}
