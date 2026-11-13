use std::marker::PhantomData;

use schelf_core::store::invited;
use schelf_publish::client::{Dashboard, Error, Json, STORE_ORIGIN};
use serde::Serialize;
use serde_json::value::RawValue;
use specta::datatype::DataType;
use specta::{Type, Types};

/// The TypeScript type the page reads an answer of schelf.store as.
pub trait Shape {
    const NAME: &'static str;
}

/// schelf.store's JSON, handed to the page as the store sent it.
#[derive(Serialize)]
#[serde(transparent)]
pub struct Store<S> {
    json: Box<RawValue>,
    #[serde(skip)]
    shape: PhantomData<S>,
}

impl<S: Shape> Type for Store<S> {
    fn definition(_: &mut Types) -> DataType {
        DataType::Reference(specta_typescript::define(format!(
            "import(\"#lib/developer/store.js\").{}",
            S::NAME
        )))
    }
}

/// What asking schelf.store came to, with the cases the page shows its own way.
#[derive(Serialize, Type)]
#[serde(
    tag = "state",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Fetched<T> {
    Ready { data: T },
    Offline,
    SignedOut,
    Failed { error: String },
}

/// The store the developer view talks to. Debug builds take another one from
/// `SCHELF_API`, as the schelf command does, to develop against a stand-in.
fn origin() -> String {
    #[cfg(debug_assertions)]
    if let Ok(origin) = std::env::var("SCHELF_API") {
        return origin.trim_end_matches('/').to_owned();
    }
    STORE_ORIGIN.to_owned()
}

/// Asks schelf.store as the person signed in on this computer.
pub fn ask<S>(
    call: impl FnOnce(&Dashboard) -> Result<Json, Error>,
) -> Result<Fetched<Store<S>>, String> {
    let Some(token) = invited::token()? else {
        return Ok(Fetched::SignedOut);
    };
    Ok(match call(&Dashboard::new(&origin(), &token)) {
        Ok(json) => Fetched::Ready {
            data: Store {
                json: json.raw,
                shape: PhantomData,
            },
        },
        Err(Error::Unreachable(_)) => Fetched::Offline,
        Err(error) if error.status() == Some(401) => {
            invited::signed_out()?;
            Fetched::SignedOut
        }
        Err(error) => Fetched::Failed {
            error: error.message(),
        },
    })
}
