use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct LanguageDownload {
    pub received: u64,
    pub total: u64,
    pub problem: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct LanguageModel {
    pub name: String,
    pub licence: String,
    pub credit: String,
    pub homepage: String,
    pub size: u64,
    pub installed: bool,
    pub download: Option<LanguageDownload>,
}

/// Something said in class, with when it was said in milliseconds from the
/// start of the recording.
#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Line {
    pub at: u64,
    pub text: String,
}

/// Part of a class to make notes of, in the language the notes are written in,
/// such as `sr-Latn`.
#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct NotesRequest {
    pub language: String,
    pub lines: Vec<Line>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Point {
    pub text: String,
    pub at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Definition {
    pub term: String,
    pub meaning: String,
    pub at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Task {
    pub task: String,
    /// When it's due, as the teacher said it, such as "next Tuesday".
    pub due: Option<String>,
    pub at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Question {
    pub question: String,
    pub answer: Option<String>,
    pub at: u64,
}

/// Notes of part of a class. Each item has when it was said, so it leads back
/// to its moment in the recording.
#[derive(Clone, Debug, Default, Serialize, Deserialize, Type)]
pub struct Notes {
    pub points: Vec<Point>,
    pub definitions: Vec<Definition>,
    pub homework: Vec<Task>,
    pub questions: Vec<Question>,
}

/// The key points of a whole class, to give it a title and a summary.
#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct HeadingRequest {
    pub language: String,
    pub points: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Heading {
    pub title: String,
    pub summary: String,
}
