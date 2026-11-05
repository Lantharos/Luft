use std::env;
use std::path::PathBuf;

const SYSTEM_FLATPAKS: &str = "/var/lib/flatpak/app";

/// Where this person's files are. Apps installed either way are found from here, so tests can use a scratch folder.
#[derive(Clone)]
pub struct Home {
    pub home: PathBuf,
    pub config: PathBuf,
    pub data: PathBuf,
}

impl Home {
    pub fn current() -> Self {
        let home = PathBuf::from(env::var_os("HOME").expect("a session always has HOME"));
        Self {
            config: env::var_os("XDG_CONFIG_HOME")
                .map_or_else(|| home.join(".config"), PathBuf::from),
            data: env::var_os("XDG_DATA_HOME")
                .map_or_else(|| home.join(".local/share"), PathBuf::from),
            home,
        }
    }

    /// The folder an app installed as a Flatpak keeps its files in, inside the sandbox's home.
    pub fn sandbox(&self, app: &str) -> PathBuf {
        self.home.join(".var/app").join(app)
    }

    fn flatpak_folders(&self) -> [PathBuf; 2] {
        [
            self.data.join("flatpak/app"),
            PathBuf::from(SYSTEM_FLATPAKS),
        ]
    }

    pub fn has_flatpak(&self, app: &str) -> bool {
        self.flatpak_folders()
            .iter()
            .any(|folder| folder.join(app).is_dir())
    }

    /// The folders that change when a Flatpak is installed or removed.
    pub fn installations(&self) -> Vec<PathBuf> {
        self.flatpak_folders()
            .into_iter()
            .filter(|folder| folder.is_dir())
            .collect()
    }
}

pub fn on_path(name: &str) -> Option<PathBuf> {
    env::split_paths(&env::var_os("PATH")?)
        .map(|folder| folder.join(name))
        .find(|program| program.is_file())
}

/// The extension's own folder, which holds what each app's theme needs.
pub fn extension_folder() -> PathBuf {
    PathBuf::from(env::var_os("LUFT_EXTENSION_DIR").expect("Kestrel sets it"))
}
