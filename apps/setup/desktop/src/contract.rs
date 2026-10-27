use std::marker::PhantomData;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::datatype::DataType;
use specta::{Type, Types};

/// A type of the installer service's JSON, which the page describes in TypeScript.
pub trait Shape {
    const NAME: &'static str;
}

pub enum Survey {}
pub enum InstallPlan {}
pub enum Regional {}

impl Shape for Survey {
    const NAME: &'static str = "Survey";
}

impl Shape for InstallPlan {
    const NAME: &'static str = "InstallPlan";
}

impl Shape for Regional {
    const NAME: &'static str = "Regional";
}

/// JSON the page and the installer service hand each other through the app untouched.
#[derive(Serialize, Deserialize)]
#[serde(transparent, bound = "")]
pub struct Contract<S> {
    pub value: Value,
    #[serde(skip)]
    shape: PhantomData<S>,
}

impl<S: Shape> Type for Contract<S> {
    fn definition(_: &mut Types) -> DataType {
        DataType::Reference(specta_typescript::define(format!(
            "import(\"#lib/bridge/installer.js\").{}",
            S::NAME
        )))
    }
}
