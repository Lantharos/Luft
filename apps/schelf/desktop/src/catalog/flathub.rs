use std::marker::PhantomData;
use std::time::Duration;

use luft_software::http::{self, MISSING, OFFLINE};
use serde::Serialize;
use serde::de::DeserializeOwned;
use serde_json::value::RawValue;
use specta::datatype::DataType;
use specta::{Type, Types};

use super::cache::Entry;

const API: &str = "https://flathub.org/api/v2/";
const FRESH: Duration = Duration::from_secs(6 * 60 * 60);

/// The TypeScript type the page reads a Flathub answer as.
pub trait Shape {
    const NAME: &'static str;
}

pub enum HitPage {}
pub enum Appstream {}
pub enum Summary {}

impl Shape for HitPage {
    const NAME: &'static str = "HitPage";
}

impl Shape for Appstream {
    const NAME: &'static str = "Appstream";
}

impl Shape for Summary {
    const NAME: &'static str = "Summary";
}

/// Flathub's JSON, handed to the page as Flathub sent it.
#[derive(Serialize)]
#[serde(transparent)]
pub struct Flathub<S> {
    json: Box<RawValue>,
    #[serde(skip)]
    shape: PhantomData<S>,
}

impl<S: Shape> Type for Flathub<S> {
    fn definition(_: &mut Types) -> DataType {
        DataType::Reference(specta_typescript::define(format!(
            "import(\"#lib/catalog/flathub.js\").{}",
            S::NAME
        )))
    }
}

impl<S> Flathub<S> {
    pub fn read<T: DeserializeOwned>(&self) -> Result<T, String> {
        serde_json::from_str(self.json.get()).map_err(|error| error.to_string())
    }
}

fn answer<S>(text: String) -> Result<Flathub<S>, String> {
    RawValue::from_string(text)
        .map(|json| Flathub {
            json,
            shape: PhantomData,
        })
        .map_err(|_| OFFLINE.to_string())
}

fn cached<S>(
    entry: Entry,
    fetch: impl FnOnce() -> Result<String, String>,
) -> Result<Flathub<S>, String> {
    if let Some(text) = entry.fresh(FRESH) {
        return answer(text);
    }
    match fetch().and_then(|text| answer(text.clone()).map(|answer| (text, answer))) {
        Ok((text, answer)) => {
            entry.store(&text);
            Ok(answer)
        }
        Err(error) if error == MISSING => Err(error),
        Err(error) => entry.stale().map_or(Err(error), answer),
    }
}

fn segment(text: &str) -> Result<&str, String> {
    let valid = !text.is_empty()
        && text
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._-".contains(character));
    valid.then_some(text).ok_or_else(|| MISSING.to_owned())
}

fn get<S>(path: String) -> Result<Flathub<S>, String> {
    cached(Entry::new("flathub", &path), || {
        http::text(&format!("{API}{path}"))
    })
}

pub fn collection(name: &str, page: u32, per_page: u32) -> Result<Flathub<HitPage>, String> {
    get(format!(
        "collection/{}?page={page}&per_page={per_page}",
        segment(name)?
    ))
}

pub fn category(id: &str, page: u32, per_page: u32) -> Result<Flathub<HitPage>, String> {
    get(format!(
        "collection/category/{}?page={page}&per_page={per_page}",
        segment(id)?
    ))
}

pub fn appstream(id: &str) -> Result<Flathub<Appstream>, String> {
    get(format!("appstream/{}", segment(id)?))
}

pub fn summary(id: &str) -> Result<Flathub<Summary>, String> {
    get(format!("summary/{}", segment(id)?))
}

pub fn search(query: &str) -> Result<Flathub<HitPage>, String> {
    let body = serde_json::json!({ "query": query, "filters": [], "hitsPerPage": 60, "page": 1 })
        .to_string();
    cached(Entry::new("search", &query.to_lowercase()), || {
        http::agent()
            .post(format!("{API}search"))
            .header("content-type", "application/json")
            .send(body.as_str())
            .map_err(http::failure)
            .and_then(http::read)
    })
}
