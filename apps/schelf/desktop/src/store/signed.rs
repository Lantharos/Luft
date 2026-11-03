use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};

use luft_software::http::{self, MISSING, OFFLINE};

use super::DOWNLOADS;
use super::trust::{Keys, Seal};
use crate::catalog::cache;

const STORE_KEYS: &str = "trust/v1/store-keys.json";
const SEAL: &str = ".sig";
const TAG: &str = ".etag";

static KEYS: Mutex<Option<Arc<Keys>>> = Mutex::new(None);

/// How long a copy on disk is used without asking schelf.store whether it changed.
#[derive(Clone, Copy)]
pub enum Age {
    Within(Duration),
    Current,
}

struct Cached {
    path: PathBuf,
}

impl Cached {
    fn of(document: &str) -> Self {
        Self {
            path: cache::folder().join("store").join(document),
        }
    }

    fn sibling(&self, suffix: &str) -> PathBuf {
        let mut name = self.path.clone().into_os_string();
        name.push(suffix);
        PathBuf::from(name)
    }

    fn younger_than(&self, age: Duration) -> bool {
        self.path
            .metadata()
            .and_then(|metadata| metadata.modified())
            .ok()
            .and_then(|modified| SystemTime::now().duration_since(modified).ok())
            .is_some_and(|elapsed| elapsed < age)
    }

    fn read(&self) -> Option<(Vec<u8>, Vec<u8>)> {
        Some((fs::read(&self.path).ok()?, fs::read(self.sibling(SEAL)).ok()?))
    }

    fn tag(&self) -> Option<String> {
        fs::read_to_string(self.sibling(TAG)).ok()
    }

    fn touch(&self) {
        let _ = fs::File::options()
            .append(true)
            .open(&self.path)
            .and_then(|file| file.set_modified(SystemTime::now()));
    }

    fn store(&self, body: &[u8], seal: &[u8], tag: Option<&str>) {
        let _ = luft_app::files::replace(&self.sibling(SEAL), seal);
        let _ = luft_app::files::replace(&self.path, body);
        match tag {
            Some(tag) => {
                let _ = luft_app::files::replace(&self.sibling(TAG), tag.as_bytes());
            }
            None => {
                let _ = fs::remove_file(self.sibling(TAG));
            }
        }
    }
}

enum Answer {
    Changed { body: Vec<u8>, tag: Option<String> },
    Same,
}

fn get(url: &str, tag: Option<&str>) -> Result<Answer, String> {
    let mut request = http::agent().get(url);
    if let Some(tag) = tag {
        request = request.header("if-none-match", tag);
    }
    match request.call() {
        Ok(response) if response.status() == 304 => Ok(Answer::Same),
        Ok(response) => {
            let tag = response
                .headers()
                .get("etag")
                .and_then(|value| value.to_str().ok())
                .map(str::to_owned);
            let body = response
                .into_body()
                .with_config()
                .limit(64 * 1024 * 1024)
                .read_to_vec()
                .map_err(|_| OFFLINE.to_string())?;
            Ok(Answer::Changed { body, tag })
        }
        Err(error) => Err(http::failure(error)),
    }
}

fn bytes(url: &str) -> Result<Vec<u8>, String> {
    match get(url, None)? {
        Answer::Changed { body, .. } => Ok(body),
        Answer::Same => Err(OFFLINE.into()),
    }
}

/// The document's bytes and seal, from disk when they're recent enough,
/// otherwise asked for again, falling back to the copy on disk when
/// schelf.store can't be reached.
fn load(document: &str, age: Age) -> Result<(Vec<u8>, Seal), String> {
    let cached = Cached::of(document);
    let on_disk = cached.read();
    if let (Age::Within(age), Some((body, seal))) = (age, &on_disk)
        && cached.younger_than(age)
    {
        return Ok((body.clone(), Seal::read(seal)?));
    }
    let url = format!("{DOWNLOADS}{document}");
    let tag = on_disk.as_ref().and(cached.tag());
    let fetched = get(&url, tag.as_deref()).and_then(|answer| match answer {
        Answer::Same => on_disk.clone().ok_or_else(|| OFFLINE.to_owned()),
        Answer::Changed { body, tag } => {
            let seal = bytes(&format!("{url}{SEAL}"))?;
            cached.store(&body, &seal, tag.as_deref());
            Ok((body, seal))
        }
    });
    match fetched {
        Ok((body, seal)) => {
            cached.touch();
            Ok((body, Seal::read(&seal)?))
        }
        Err(error) if error == MISSING => Err(error),
        Err(error) => {
            let (body, seal) = on_disk.ok_or(error)?;
            Ok((body, Seal::read(&seal)?))
        }
    }
}

fn keys(age: Age) -> Result<Arc<Keys>, String> {
    let mut slot = KEYS.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    if let (Some(keys), Age::Within(_)) = (slot.as_ref(), age) {
        return Ok(keys.clone());
    }
    let (body, seal) = load(STORE_KEYS, age)?;
    let keys = Arc::new(Keys::read(&body, &seal)?);
    *slot = Some(keys.clone());
    Ok(keys)
}

/// A document from schelf.store, checked against the store's keys before
/// anything reads it.
pub fn fetch(document: &str, age: Age) -> Result<Vec<u8>, String> {
    let (body, seal) = load(document, age)?;
    if keys(age)?.verify(&body, &seal).is_ok() {
        return Ok(body);
    }
    keys(Age::Current)?.verify(&body, &seal)?;
    Ok(body)
}
