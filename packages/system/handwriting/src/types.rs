use serde::{Deserialize, Serialize};
use specta::Type;

/// A point of a stroke, in any unit as long as every point of a line uses the same one.
pub type Point = (f64, f64);

/// The points a pen passed through between touching down and lifting.
pub type Stroke = Vec<Point>;

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct HandwritingDownload {
    pub received: u64,
    pub total: u64,
    pub problem: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct HandwritingModel {
    pub name: String,
    pub licence: String,
    pub credit: String,
    pub homepage: String,
    pub size: u64,
    pub installed: bool,
    pub download: Option<HandwritingDownload>,
}
