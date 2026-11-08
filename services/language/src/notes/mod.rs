mod grammar;
mod languages;

use anyhow::{Context, Result};
use luft_language::types::{
    Definition, Heading, HeadingRequest, Notes, NotesRequest, Point, Question, Task,
};
use serde::Deserialize;

use crate::model::Writer;

const LONGEST_NOTES: usize = 2048;
const LONGEST_HEADING: usize = 512;

const NOTES_SYSTEM: &str = "You write study notes for a student from the transcript of part of a school class. The transcript comes from speech recognition, so it has mistakes: read past them using the context, and spell terms correctly. Each line starts with its number in brackets.

Write the notes in {language}, whatever languages the class speaks. Keep only what matters for learning the subject:
- points: what the teacher teaches, such as facts, ideas, explanations, rules, examples and steps, each as one short, complete sentence. Combine lines that say the same thing.
- definitions: terms the teacher defines or explains, each with its meaning.
- homework: homework, assignments, tests and deadlines, each with when it's due as the teacher said it, or null when no time was said.
- questions: questions about the subject asked in class, each with the answer given in class, or null.
Leave out greetings, attendance, telling students off, discipline, jokes, small talk, organisation that isn't homework or a test, and anything off topic. Never add anything that wasn't said. Each item gives the number of the line it comes from. When there's nothing worth noting, the lists stay empty.";

const HEADING_SYSTEM: &str = "You give a school class a title and a summary from the key points of the notes taken in it. The title names the topic in a few words, like a heading in a notebook. The summary says what the class covered in two or three sentences. Write both in {language}.";

#[derive(Deserialize)]
struct Written {
    points: Vec<WrittenPoint>,
    definitions: Vec<WrittenDefinition>,
    homework: Vec<WrittenTask>,
    questions: Vec<WrittenQuestion>,
}

#[derive(Deserialize)]
struct WrittenPoint {
    text: String,
    line: usize,
}

#[derive(Deserialize)]
struct WrittenDefinition {
    term: String,
    meaning: String,
    line: usize,
}

#[derive(Deserialize)]
struct WrittenTask {
    task: String,
    due: Option<String>,
    line: usize,
}

#[derive(Deserialize)]
struct WrittenQuestion {
    question: String,
    answer: Option<String>,
    line: usize,
}

fn filled(text: &str) -> Option<String> {
    let text = text.trim();
    (!text.is_empty()).then(|| text.to_owned())
}

pub fn notes(writer: &Writer, request: &NotesRequest) -> Result<Notes> {
    if request.lines.is_empty() {
        return Ok(Notes::default());
    }
    let transcript: String = request
        .lines
        .iter()
        .enumerate()
        .map(|(index, line)| format!("[{index}] {}\n", line.text.trim()))
        .collect();
    let system = NOTES_SYSTEM.replace("{language}", languages::name(&request.language));
    let answer = writer.write(&system, &transcript, grammar::NOTES, LONGEST_NOTES)?;
    let written: Written =
        serde_json::from_str(&answer).context("The notes didn't come out whole")?;
    let at = |line: usize| request.lines[line.min(request.lines.len() - 1)].at;
    Ok(Notes {
        points: written
            .points
            .into_iter()
            .filter_map(|point| {
                Some(Point {
                    text: filled(&point.text)?,
                    at: at(point.line),
                })
            })
            .collect(),
        definitions: written
            .definitions
            .into_iter()
            .filter_map(|definition| {
                Some(Definition {
                    term: filled(&definition.term)?,
                    meaning: filled(&definition.meaning)?,
                    at: at(definition.line),
                })
            })
            .collect(),
        homework: written
            .homework
            .into_iter()
            .filter_map(|task| {
                Some(Task {
                    task: filled(&task.task)?,
                    due: task.due.as_deref().and_then(filled),
                    at: at(task.line),
                })
            })
            .collect(),
        questions: written
            .questions
            .into_iter()
            .filter_map(|question| {
                Some(Question {
                    question: filled(&question.question)?,
                    answer: question.answer.as_deref().and_then(filled),
                    at: at(question.line),
                })
            })
            .collect(),
    })
}

pub fn heading(writer: &Writer, request: &HeadingRequest) -> Result<Heading> {
    let system = HEADING_SYSTEM.replace("{language}", languages::name(&request.language));
    let points: String = request
        .points
        .iter()
        .map(|point| format!("- {}\n", point.trim()))
        .collect();
    let answer = writer.write(&system, &points, grammar::HEADING, LONGEST_HEADING)?;
    serde_json::from_str(&answer).context("The heading didn't come out whole")
}

#[cfg(test)]
mod check;
