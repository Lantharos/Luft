mod access;
mod formats;
mod import;
mod ownership;

use std::path::PathBuf;
use std::sync::Arc;

use tokio::sync::Notify;

use luft_keyring_vault::{
    AuditLog, ChipWrap, Contents, Error, Header, MasterKey, PasswordWrap, Record, Stored, now,
};

pub use access::{Decision, PORTAL_SCHEMA, decide};
pub use import::{ImportError, pending_sources, read_source};

pub struct Paths {
    pub folder: PathBuf,
    pub legacy: PathBuf,
}

impl Paths {
    pub fn from_environment() -> Self {
        let data = std::env::var_os("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|| {
                PathBuf::from(std::env::var_os("HOME").unwrap_or_default()).join(".local/share")
            });
        Self {
            folder: data.join("luft-keyring"),
            legacy: data.join("keyrings"),
        }
    }

    fn vault(&self) -> PathBuf {
        self.folder.join("vault")
    }

    fn audit(&self) -> PathBuf {
        self.folder.join("audit")
    }
}

struct Unlocked {
    key: MasterKey,
    contents: Contents,
}

pub struct Keyring {
    pub changes: Arc<Notify>,
    paths: Paths,
    header: Option<Header>,
    unlocked: Option<Unlocked>,
    index: Option<Contents>,
}

impl Keyring {
    pub fn open(paths: Paths) -> Result<Self, Error> {
        let header = Stored::load(&paths.vault())?.map(|stored| stored.header);
        Ok(Self {
            changes: Arc::default(),
            paths,
            header,
            unlocked: None,
            index: None,
        })
    }

    pub fn exists(&self) -> bool {
        self.header.is_some()
    }

    pub fn is_locked(&self) -> bool {
        self.unlocked.is_none()
    }

    pub fn legacy_folder(&self) -> &std::path::Path {
        &self.paths.legacy
    }

    pub fn password_wrap(&self) -> Option<PasswordWrap> {
        self.header.as_ref()?.password.clone()
    }

    pub fn chip_wrap(&self) -> Option<ChipWrap> {
        self.header.as_ref()?.chip.clone()
    }

    pub fn has_chip_wrap(&self) -> bool {
        self.header
            .as_ref()
            .is_some_and(|header| header.chip.is_some())
    }

    pub fn contents(&self) -> Option<&Contents> {
        self.unlocked.as_ref().map(|unlocked| &unlocked.contents)
    }

    pub fn view(&self) -> Option<&Contents> {
        self.contents().or(self.index.as_ref())
    }

    pub fn key(&self) -> Option<&MasterKey> {
        self.unlocked.as_ref().map(|unlocked| &unlocked.key)
    }

    pub fn install(&mut self, key: MasterKey) -> Result<(), Error> {
        let stored = Stored::load(&self.paths.vault())?
            .ok_or(Error::Corrupt("the keyring file is missing"))?;
        let contents = stored.open(&key)?;
        self.header = Some(stored.header);
        self.index = None;
        self.unlocked = Some(Unlocked { key, contents });
        Ok(())
    }

    pub fn create(
        &mut self,
        key: MasterKey,
        password: PasswordWrap,
        contents: Contents,
    ) -> Result<(), Error> {
        let header = Header {
            password: Some(password),
            chip: None,
        };
        Stored::save(&self.paths.vault(), &header, &key, &contents)?;
        self.header = Some(header);
        self.unlocked = Some(Unlocked { key, contents });
        Ok(())
    }

    pub fn lock(&mut self) {
        if let Some(unlocked) = self.unlocked.take() {
            self.index = Some(unlocked.contents.without_secrets());
        }
    }

    pub fn edit<T>(&mut self, change: impl FnOnce(&mut Contents) -> T) -> Result<T, Error> {
        let unlocked = self.unlocked.as_mut().ok_or(Error::WrongKey)?;
        let result = change(&mut unlocked.contents);
        let header = self
            .header
            .as_ref()
            .ok_or(Error::Corrupt("the keyring has no header"))?;
        Stored::save(
            &self.paths.vault(),
            header,
            &unlocked.key,
            &unlocked.contents,
        )?;
        self.changes.notify_one();
        Ok(result)
    }

    pub fn set_password_wrap(&mut self, wrap: PasswordWrap) -> Result<(), Error> {
        self.edit_header(|header| header.password = Some(wrap))
    }

    pub fn set_chip_wrap(&mut self, wrap: Option<ChipWrap>) -> Result<(), Error> {
        self.edit_header(|header| header.chip = wrap)
    }

    fn edit_header(&mut self, change: impl FnOnce(&mut Header)) -> Result<(), Error> {
        let unlocked = self.unlocked.as_ref().ok_or(Error::WrongKey)?;
        let mut header = self.header.clone().unwrap_or_default();
        change(&mut header);
        Stored::save(
            &self.paths.vault(),
            &header,
            &unlocked.key,
            &unlocked.contents,
        )?;
        self.header = Some(header);
        Ok(())
    }

    pub fn adopt(&mut self, app: &crate::identity::App) {
        let Some(contents) = self.contents() else {
            return;
        };
        let previous = ownership::predecessors(contents, app);
        if previous.is_empty() {
            return;
        }
        if let Err(error) =
            self.edit(|contents| ownership::hand_over(contents, &previous, &app.key))
        {
            eprintln!("Couldn't carry an app's access over: {error}");
        }
    }

    pub fn release_misclaimed(&mut self) {
        if !self.contents().is_some_and(ownership::has_misclaimed) {
            return;
        }
        if let Err(error) = self.edit(ownership::release_misclaimed) {
            eprintln!("Couldn't release items a keyring tool claimed: {error}");
        }
    }

    pub fn audit(&self) -> AuditLog {
        AuditLog::new(self.paths.audit())
    }

    pub fn record(
        &self,
        app: &crate::identity::App,
        action: luft_keyring_vault::Action,
        target: &str,
    ) {
        let Some(key) = self.key() else { return };
        let record = Record {
            time: now(),
            app: app.key.clone(),
            app_name: app.name.clone(),
            action,
            target: target.to_owned(),
        };
        self.changes.notify_one();
        if let Err(error) = self.audit().append(key, &record) {
            eprintln!("Couldn't add to the access history: {error}");
        }
    }
}
