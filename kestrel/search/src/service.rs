use std::path::Path;
use std::sync::mpsc::Sender;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use luft_dbus_macros::introspect;
use zbus::{fdo, interface};

use crate::contents::{Store, snippet, words};
use crate::index::{Shared, Wake};

pub const NAME: &str = "com.lantharos.Search";
pub const PATH: &str = "/com/lantharos/Search";
const MOST_RESULTS: u32 = 50;

pub struct Search {
    pub names: Shared,
    pub store: Arc<Mutex<Store>>,
    pub wake: Sender<Wake>,
}

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs() as i64)
}

#[introspect]
#[interface(name = "com.lantharos.Search")]
impl Search {
    fn find(&self, query: &str, limit: u32) -> Vec<(String, bool, f64)> {
        let names = self.names.read().unwrap().clone();
        names
            .find(query, limit.min(MOST_RESULTS) as usize, now())
            .into_iter()
            .map(|hit| (hit.path, hit.folder, f64::from(hit.score)))
            .collect()
    }

    async fn find_text(&self, query: String, limit: u32) -> fdo::Result<Vec<(String, String)>> {
        let store = self.store.clone();
        let found = tokio::task::spawn_blocking(move || {
            let words = words(&query);
            let paths = store
                .lock()
                .unwrap()
                .search(&words, limit.min(MOST_RESULTS) as usize)?;
            Ok::<_, rusqlite::Error>(
                paths
                    .into_iter()
                    .filter(|path| Path::new(path).exists())
                    .map(|path| {
                        let snippet = snippet(Path::new(&path), &words);
                        (path, snippet)
                    })
                    .collect(),
            )
        })
        .await
        .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        found.map_err(|error| fdo::Error::Failed(error.to_string()))
    }

    fn refresh(&self) {
        let _ = self.wake.send(Wake::Searching);
    }
}
