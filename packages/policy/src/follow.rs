use std::collections::HashMap;
use std::io;
use std::path::{Path, PathBuf};
use std::time::Duration;

use futures_util::StreamExt;
use inotify::{EventStream, Inotify, WatchDescriptor, WatchMask, Watches};

use crate::Policy;
use crate::load::FOLDERS;

const SETTLE: Duration = Duration::from_millis(150);
const BUFFER: usize = 4096;

/// Follows the policy folders and has the policy as it is now, waiting for the files in them to
/// change, and for a folder that doesn't exist yet to appear.
pub struct Follow {
    folders: Vec<PathBuf>,
    watches: Watches,
    watched: HashMap<PathBuf, WatchDescriptor>,
    events: EventStream<Vec<u8>>,
    current: Policy,
}

fn content() -> WatchMask {
    WatchMask::CREATE
        | WatchMask::DELETE
        | WatchMask::CLOSE_WRITE
        | WatchMask::MOVED_FROM
        | WatchMask::MOVED_TO
        | WatchMask::DELETE_SELF
        | WatchMask::MOVE_SELF
}

fn appearing() -> WatchMask {
    WatchMask::CREATE | WatchMask::MOVED_TO | WatchMask::DELETE_SELF | WatchMask::MOVE_SELF
}

fn nearest_existing(folder: &Path) -> &Path {
    folder
        .ancestors()
        .find(|ancestor| ancestor.is_dir())
        .unwrap_or(Path::new("/"))
}

impl Follow {
    pub fn start() -> io::Result<Self> {
        Self::folders(FOLDERS.iter().map(PathBuf::from).collect())
    }

    /// Follows the folders given, read in that order, the way [`Policy::from_folders`] does.
    pub fn folders(folders: Vec<PathBuf>) -> io::Result<Self> {
        let inotify = Inotify::init()?;
        let watches = inotify.watches();
        let events = inotify.into_event_stream(vec![0; BUFFER])?;
        let mut follow = Self {
            folders,
            watches,
            watched: HashMap::new(),
            events,
            current: Policy::default(),
        };
        follow.watch()?;
        follow.current = follow.read();
        Ok(follow)
    }

    pub fn current(&self) -> &Policy {
        &self.current
    }

    /// Waits until the policy changes, and gives the new one.
    pub async fn changed(&mut self) -> io::Result<&Policy> {
        loop {
            self.events
                .next()
                .await
                .ok_or_else(|| io::Error::other("the policy folders stopped being watched"))??;
            while let Ok(Some(event)) = tokio::time::timeout(SETTLE, self.events.next()).await {
                event?;
            }
            self.watch()?;
            let policy = self.read();
            if policy != self.current {
                self.current = policy;
                return Ok(&self.current);
            }
        }
    }

    fn read(&self) -> Policy {
        let folders: Vec<&Path> = self.folders.iter().map(PathBuf::as_path).collect();
        Policy::from_folders(&folders)
    }

    fn watch(&mut self) -> io::Result<()> {
        let wanted: HashMap<PathBuf, WatchMask> = self
            .folders
            .iter()
            .map(|folder| {
                let watched = nearest_existing(folder);
                let mask = if watched == folder {
                    content()
                } else {
                    appearing()
                };
                (watched.to_owned(), mask)
            })
            .collect();
        let watches = &mut self.watches;
        self.watched.retain(|path, descriptor| {
            let keep = wanted.contains_key(path);
            if !keep {
                let _ = watches.remove(descriptor.clone());
            }
            keep
        });
        for (path, mask) in wanted {
            let descriptor = self.watches.add(&path, mask)?;
            self.watched.insert(path, descriptor);
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::fs;

    use tempfile::TempDir;

    use super::*;

    async fn next(follow: &mut Follow) -> Policy {
        tokio::time::timeout(Duration::from_secs(5), follow.changed())
            .await
            .expect("the change is seen")
            .unwrap()
            .clone()
    }

    #[tokio::test]
    async fn sees_files_change_and_folders_appear() {
        let root = TempDir::new().unwrap();
        let local = root.path().join("etc/luft/policy.d");
        let image = root.path().join("usr/policy.d");
        fs::create_dir_all(&image).unwrap();
        let mut follow = Follow::folders(vec![local.clone(), image.clone()]).unwrap();
        assert_eq!(follow.current(), &Policy::default());

        fs::create_dir_all(&local).unwrap();
        fs::write(local.join("10-name.toml"), "organization.name = \"Acme\"\n").unwrap();
        let policy = next(&mut follow).await;
        assert_eq!(policy.organization.name.as_deref(), Some("Acme"));

        fs::write(image.join("10-lock.toml"), "[remote-login]\nallowed = false\n").unwrap();
        let policy = next(&mut follow).await;
        assert!(!policy.remote_login.allowed);
        assert_eq!(policy.organization.name.as_deref(), Some("Acme"));

        fs::remove_dir_all(&local).unwrap();
        let policy = next(&mut follow).await;
        assert_eq!(policy.organization.name, None);
    }
}
