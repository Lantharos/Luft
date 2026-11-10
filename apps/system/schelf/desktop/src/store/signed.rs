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
const LENGTH: usize = size_of::<u64>();

static KEYS: Mutex<Option<Arc<Keys>>> = Mutex::new(None);

/// How long a copy on disk is used without asking schelf.store whether it changed.
#[derive(Clone, Copy)]
pub enum Age {
    Within(Duration),
    Current,
}

/// A document as schelf.store answered: its bytes, its seal and the tag to
/// ask with whether it changed.
struct Stored {
    body: Vec<u8>,
    seal: Vec<u8>,
    tag: Option<String>,
}

impl Stored {
    /// The copy as one file, so a document and its seal never part: the
    /// bytes, the seal, the tag, then the lengths of the last two.
    fn pack(&self) -> Vec<u8> {
        let tag = self.tag.as_deref().unwrap_or_default().as_bytes();
        [
            &self.body,
            &self.seal,
            tag,
            &(self.seal.len() as u64).to_le_bytes(),
            &(tag.len() as u64).to_le_bytes(),
        ]
        .concat()
    }

    fn unpack(mut bytes: Vec<u8>) -> Option<Self> {
        let mut length = || {
            let at = bytes.len().checked_sub(LENGTH)?;
            let length = u64::from_le_bytes(bytes[at..].try_into().ok()?);
            bytes.truncate(at);
            usize::try_from(length).ok()
        };
        let tag_length = length()?;
        let seal_length = length()?;
        let tag = bytes.split_off(bytes.len().checked_sub(tag_length)?);
        let seal = bytes.split_off(bytes.len().checked_sub(seal_length)?);
        Some(Self {
            body: bytes,
            seal,
            tag: String::from_utf8(tag).ok().filter(|tag| !tag.is_empty()),
        })
    }
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

    fn younger_than(&self, age: Duration) -> bool {
        self.path
            .metadata()
            .and_then(|metadata| metadata.modified())
            .ok()
            .and_then(|modified| SystemTime::now().duration_since(modified).ok())
            .is_some_and(|elapsed| elapsed < age)
    }

    fn read(&self) -> Option<Stored> {
        Stored::unpack(fs::read(&self.path).ok()?)
    }

    fn touch(&self) {
        let _ = fs::File::options()
            .append(true)
            .open(&self.path)
            .and_then(|file| file.set_modified(SystemTime::now()));
    }

    fn store(&self, stored: &Stored) {
        let _ = luft_app::files::replace(&self.path, &stored.pack());
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

/// The document's bytes with what `check` makes of them and their seal. A
/// copy on disk is used when it's recent enough, otherwise schelf.store is
/// asked again, and the copy on disk stands in when it can't be reached.
/// Only what passes `check` is used or kept, so a damaged copy on disk is
/// fetched anew rather than asked about by its tag.
fn load<T>(
    document: &str,
    age: Age,
    check: impl Fn(&[u8], &Seal) -> Result<T, String>,
) -> Result<(Vec<u8>, T), String> {
    let cached = Cached::of(document);
    let trusted = |stored: &Stored| check(&stored.body, &Seal::read(&stored.seal)?);
    let on_disk = cached
        .read()
        .and_then(|copy| Some((trusted(&copy).ok()?, copy)));
    let recent = matches!(age, Age::Within(age) if cached.younger_than(age));
    let (held, tag) = match on_disk {
        Some((checked, copy)) if recent => return Ok((copy.body, checked)),
        Some((checked, copy)) => (Some((copy.body, checked)), copy.tag),
        None => (None, None),
    };
    let url = format!("{DOWNLOADS}{document}");
    let fetched = get(&url, tag.as_deref()).and_then(|answer| match answer {
        Answer::Same => Ok(None),
        Answer::Changed { body, tag } => {
            let seal = bytes(&format!("{url}{SEAL}"))?;
            let fresh = Stored { body, seal, tag };
            let checked = trusted(&fresh)?;
            cached.store(&fresh);
            Ok(Some((fresh.body, checked)))
        }
    });
    match fetched {
        Ok(Some(fresh)) => Ok(fresh),
        Ok(None) => {
            cached.touch();
            held.ok_or_else(|| OFFLINE.to_owned())
        }
        Err(error) if error == MISSING => Err(error),
        Err(error) => held.ok_or(error),
    }
}

fn keys(age: Age) -> Result<Arc<Keys>, String> {
    let mut slot = KEYS.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    if let (Some(keys), Age::Within(_)) = (slot.as_ref(), age) {
        return Ok(keys.clone());
    }
    let (_, keys) = load(STORE_KEYS, age, Keys::read)?;
    let keys = Arc::new(keys);
    *slot = Some(keys.clone());
    Ok(keys)
}

/// A document from schelf.store, checked against the store's keys before
/// anything reads it or it's kept on disk.
pub fn fetch(document: &str, age: Age) -> Result<Vec<u8>, String> {
    let (body, ()) = load(document, age, |body, seal| {
        keys(age)?
            .verify(body, seal)
            .or_else(|_| keys(Age::Current)?.verify(body, seal))
    })?;
    Ok(body)
}

#[cfg(test)]
mod tests {
    use super::Stored;

    #[test]
    fn a_stored_document_reads_back_whole_or_not_at_all() {
        let stored = Stored {
            body: b"{\"apps\":[]}".to_vec(),
            seal: b"{\"key\":\"k\",\"sig\":\"s\"}".to_vec(),
            tag: Some("\"abc\"".into()),
        };
        let packed = stored.pack();
        let read = Stored::unpack(packed.clone()).unwrap();
        assert_eq!(read.body, stored.body);
        assert_eq!(read.seal, stored.seal);
        assert_eq!(read.tag, stored.tag);
        assert!(Stored::unpack(packed[packed.len() - 12..].to_vec()).is_none());
        assert!(Stored::unpack(stored.body).is_none());
    }
}
