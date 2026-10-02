use super::input::Input;
use super::learned::Learned;
use super::words::Candidate;
use super::{Engine, rules::Rules};

const REMEMBERED: usize = 32;

#[derive(Default)]
pub struct Session {
    pending: Vec<char>,
    converted: String,
    composing: Option<Vec<char>>,
    before: String,
    candidates: Vec<Candidate>,
    cursor: usize,
    committed: String,
}

pub struct Response {
    pub handled: bool,
    pub commit: String,
}

fn remember(before: &mut String, text: &str) {
    before.push_str(text);
    let excess = before.chars().count().saturating_sub(REMEMBERED);
    if excess > 0 {
        let cut = before
            .char_indices()
            .nth(excess)
            .map_or(before.len(), |(index, _)| index);
        before.drain(..cut);
    }
}

fn resolve(rules: &Rules, pending: &mut Vec<char>, before: &str, finished: bool) -> String {
    let mut produced = String::new();
    while !pending.is_empty() {
        let keys: String = pending.iter().collect();
        if !finished && rules.waits(&keys) {
            break;
        }
        let context = format!("{before}{produced}");
        let (consumed, text) = rules.longest(pending, &context).map_or_else(
            || (1, pending[0].to_string()),
            |(consumed, text)| (consumed, text.to_owned()),
        );
        pending.drain(..consumed);
        produced.push_str(&text);
    }
    produced
}

impl Session {
    pub fn is_active(&self) -> bool {
        !self.pending.is_empty() || !self.converted.is_empty() || self.composing.is_some()
    }

    pub fn reset(&mut self) {
        self.pending.clear();
        self.converted.clear();
        self.composing = None;
        self.candidates.clear();
        self.cursor = 0;
    }

    pub fn forget(&mut self) {
        self.reset();
        self.before.clear();
    }

    pub fn surrounding(&mut self, text: &str) {
        self.before.clear();
        remember(&mut self.before, text);
    }

    pub fn preedit(&self, engine: &Engine) -> String {
        if let Some(sequence) = &self.composing {
            return format!("{}{}", self.converted, sequence.iter().collect::<String>());
        }
        self.reading(engine)
    }

    fn reading(&self, engine: &Engine) -> String {
        let mut pending = self.pending.clone();
        let context = format!("{}{}", self.before, self.converted);
        format!(
            "{}{}",
            self.converted,
            resolve(&engine.rules, &mut pending, &context, true)
        )
    }

    pub fn candidates(&self) -> &[Candidate] {
        &self.candidates
    }

    pub fn cursor(&self) -> usize {
        self.cursor
    }

    fn produce(&mut self, engine: &Engine, text: &str) {
        if engine.has_words() {
            self.converted.push_str(text);
        } else {
            self.commit(text);
        }
    }

    fn advance(&mut self, engine: &Engine, finished: bool) {
        let context = format!("{}{}", self.before, self.converted);
        let produced = resolve(&engine.rules, &mut self.pending, &context, finished);
        if !produced.is_empty() {
            self.produce(engine, &produced);
        }
    }

    fn refresh(&mut self, engine: &Engine, learned: &Learned) {
        self.cursor = 0;
        self.candidates = if engine.has_words() && self.is_active() {
            engine.words.lookup(&self.reading(engine), learned)
        } else {
            Vec::new()
        };
    }

    fn commit(&mut self, text: &str) {
        self.committed.push_str(text);
        remember(&mut self.before, text);
    }

    fn flush(&mut self, engine: &Engine) {
        self.composing = None;
        self.advance(engine, true);
        let converted = std::mem::take(&mut self.converted);
        self.commit(&converted);
        self.candidates.clear();
        self.cursor = 0;
    }

    fn select(&mut self, engine: &Engine, learned: &mut Learned, index: usize) {
        let Some(candidate) = self.candidates.get(index).cloned() else {
            return;
        };
        self.advance(engine, true);
        self.commit(&candidate.text);
        if engine.learns {
            learned.bump(&candidate.keys, &candidate.text);
        }
        let cut = self
            .converted
            .char_indices()
            .nth(candidate.consumes)
            .map_or(self.converted.len(), |(index, _)| index);
        self.converted.drain(..cut);
        self.refresh(engine, learned);
    }

    fn compose(&mut self, engine: &Engine, learned: &mut Learned, character: char) -> bool {
        let Some(sequence) = self.composing.as_mut() else {
            return false;
        };
        sequence.push(character);
        let keys: String = sequence.iter().collect();
        if engine.sequences.waits(&keys) {
            return true;
        }
        if let Some((_, text)) = engine
            .sequences
            .longest(sequence, "")
            .filter(|(length, _)| *length == sequence.len())
        {
            let text = text.to_owned();
            self.composing = None;
            self.produce(engine, &text);
        } else {
            let shorter: Vec<char> = sequence[..sequence.len() - 1].to_vec();
            let matched = engine
                .sequences
                .longest(&shorter, "")
                .filter(|(length, _)| *length == shorter.len() && !shorter.is_empty())
                .map(|(_, text)| text.to_owned());
            self.composing = None;
            if let Some(text) = matched {
                self.produce(engine, &text);
                if !self.handle(engine, learned, Input::Text(character)) {
                    self.flush(engine);
                    self.commit(&character.to_string());
                }
            }
        }
        self.refresh(engine, learned);
        true
    }

    fn accepts(&self, engine: &Engine, character: char) -> bool {
        if engine.has_words() {
            return engine.vocabulary.contains(&character);
        }
        let mut keys: String = self.pending.iter().collect();
        keys.push(character);
        engine.rules.continues(&keys) || engine.rules.starts(character)
    }

    fn handle(&mut self, engine: &Engine, learned: &mut Learned, input: Input) -> bool {
        if input == Input::Compose && engine.compose.is_some() && self.composing.is_none() {
            self.advance(engine, true);
            self.composing = Some(Vec::new());
            return true;
        }
        if let Input::Text(character) = input
            && self.compose(engine, learned, character)
        {
            return true;
        }
        if let Some(sequence) = self.composing.as_mut() {
            match input {
                Input::BackSpace => {
                    if sequence.pop().is_none() {
                        self.composing = None;
                    }
                }
                Input::Escape => self.composing = None,
                _ => return false,
            }
            return true;
        }
        if let Input::Text(character) = input {
            let picks = !self.candidates.is_empty() && !engine.vocabulary.contains(&character);
            if let Some(digit) = character
                .to_digit(10)
                .filter(|digit| picks && (1..=9).contains(digit))
            {
                let page_start = self.cursor - self.cursor % engine.page;
                self.select(engine, learned, page_start + digit as usize - 1);
                return true;
            }
            if self.accepts(engine, character) {
                self.pending.push(character);
                self.advance(engine, false);
                self.refresh(engine, learned);
                return true;
            }
            return false;
        }
        if !self.is_active() {
            return false;
        }
        let paged = |cursor: usize, forward: bool, total: usize, page: usize| {
            let start = cursor - cursor % page;
            if forward {
                (start + page).min(total.saturating_sub(1))
            } else {
                start.saturating_sub(page)
            }
        };
        match input {
            Input::Space if engine.has_words() => {
                if self.candidates.is_empty() {
                    self.flush(engine);
                } else {
                    self.select(engine, learned, self.cursor);
                }
            }
            Input::Return if engine.has_words() => self.flush(engine),
            Input::Escape => self.reset(),
            Input::BackSpace => {
                if self.pending.pop().is_none() {
                    self.converted.pop();
                }
                self.refresh(engine, learned);
            }
            Input::Up if !self.candidates.is_empty() => self.cursor = self.cursor.saturating_sub(1),
            Input::Down if !self.candidates.is_empty() => {
                self.cursor = (self.cursor + 1).min(self.candidates.len() - 1);
            }
            Input::PageUp if !self.candidates.is_empty() => {
                self.cursor = paged(self.cursor, false, self.candidates.len(), engine.page);
            }
            Input::PageDown if !self.candidates.is_empty() => {
                self.cursor = paged(self.cursor, true, self.candidates.len(), engine.page);
            }
            _ => {
                self.flush(engine);
                return false;
            }
        }
        true
    }

    pub fn pick(&mut self, engine: &Engine, learned: &mut Learned, index: usize) -> Response {
        let handled = index < self.candidates.len();
        self.select(engine, learned, index);
        Response {
            handled,
            commit: std::mem::take(&mut self.committed),
        }
    }

    pub fn feed(&mut self, engine: &Engine, learned: &mut Learned, input: Input) -> Response {
        let handled = self.handle(engine, learned, input);
        Response {
            handled,
            commit: std::mem::take(&mut self.committed),
        }
    }
}
