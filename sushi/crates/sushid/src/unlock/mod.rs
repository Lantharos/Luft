mod ask;
mod words;

use luft_recovery_key::{OLD_LETTERS, Reading, WORDS};
use sushi::ipc::password::{PasswordRequests, Request, Secret};
use sushi::scene::Prompt;
use sushi::terminal::{Key, Terminal};

use ask::Ask;
use words::{Entry, Words};

const MISTYPED: &str = "One of the words isn't right. Check them against your recovery key.";

pub struct Unlock {
    request: Request,
    ask: Ask,
    secret: Secret,
    rejected: bool,
    caps_lock: bool,
    incomplete: bool,
    pub prompt: Prompt,
}

pub enum Typed {
    Nothing,
    Changed,
    Answered,
}

#[derive(Default)]
pub struct Answered {
    last: Option<(String, Ask)>,
    pins: Vec<String>,
}

impl Answered {
    fn record(&mut self, request: &Request, ask: &Ask) {
        if matches!(ask, Ask::Pin { .. }) && !self.pins.contains(&request.id) {
            self.pins.push(request.id.clone());
        }
        self.last = Some((request.id.clone(), ask.clone()));
    }

    fn rejects(&self, request: &Request, ask: &Ask) -> bool {
        self.last
            .as_ref()
            .is_some_and(|(id, last)| *id == request.id && last == ask)
    }
}

impl Unlock {
    pub fn next(requests: &PasswordRequests, answered: &Answered, now: f32) -> Option<Self> {
        let request = requests.pending().into_iter().next()?;
        let ask = Ask::of(&request, answered.pins.contains(&request.id));
        let rejected = answered.rejects(&request, &ask);
        let mut unlock = Self {
            prompt: Prompt {
                shake_started: rejected.then_some(now),
                ..Prompt::default()
            },
            request,
            ask,
            secret: Secret::default(),
            rejected,
            caps_lock: false,
            incomplete: false,
        };
        unlock.refresh();
        Some(unlock)
    }

    fn letters_note(&self, letters: usize) -> (String, f32) {
        match letters {
            OLD_LETTERS => ("Press Enter to unlock".to_owned(), 0.7),
            letters if letters > OLD_LETTERS => (
                format!("A recovery key of letters has {OLD_LETTERS}, this is more"),
                1.0,
            ),
            letters if self.incomplete => (
                format!("{letters} of {OLD_LETTERS} letters. Type the rest first."),
                1.0,
            ),
            letters => (format!("{letters} of {OLD_LETTERS} letters"), 0.5),
        }
    }

    fn words_note(&self, words: Words) -> (String, f32) {
        match words {
            Words {
                unknown: Some(index),
                ..
            } => (
                format!(
                    "Word {} isn't a recovery key word. Check how it's spelled.",
                    index + 1
                ),
                1.0,
            ),
            Words {
                holds: Some(true), ..
            } => ("Press Enter to unlock".to_owned(), 0.7),
            Words {
                holds: Some(false), ..
            } => (MISTYPED.to_owned(), 1.0),
            Words { typed: 0, .. } => (
                "Type the first 4 letters of each word, then press Space".to_owned(),
                0.5,
            ),
            Words { typed, .. } if self.incomplete => (
                format!("{typed} of {WORDS} words. Type the rest first."),
                1.0,
            ),
            Words { typed, .. } => (format!("{typed} of {WORDS} words"), 0.5),
        }
    }

    fn key_note(&self) -> (String, f32) {
        match words::read(self.secret.bytes()) {
            Entry::Letters(letters) => self.letters_note(letters),
            Entry::Words(words) => self.words_note(words),
        }
    }

    fn refresh(&mut self) {
        let copy = self.ask.copy();
        let only_a_key = self.ask.wants_only_a_recovery_key();
        self.prompt.title = copy.title;
        self.prompt.explanation = copy.explanation;
        self.prompt.placeholder = copy.placeholder.to_owned();
        self.prompt.typed = self.secret.characters();
        self.prompt.key = only_a_key.then(|| words::shown(self.secret.bytes()));
        self.prompt.note = if self.rejected {
            Some((copy.rejected.to_owned(), 1.0))
        } else if self.caps_lock && !only_a_key {
            Some(("Caps Lock is on".to_owned(), 0.7))
        } else if only_a_key {
            Some(self.key_note())
        } else {
            self.ask
                .can_go_back()
                .then(|| ("Press Esc to go back".to_owned(), 0.5))
        };
    }

    fn ready_to_answer(&self) -> bool {
        !self.ask.wants_only_a_recovery_key()
            || matches!(
                luft_recovery_key::read(self.secret.bytes()),
                Reading::Key(_)
            )
    }

    fn next_word(&mut self) {
        if words::can_move_on(self.secret.bytes()) {
            self.secret.push(' ');
        }
    }

    pub fn is_live(&self) -> bool {
        self.request.is_live()
    }

    pub fn set_caps_lock(&mut self, on: bool) {
        if self.caps_lock != on {
            self.caps_lock = on;
            self.refresh();
        }
    }

    pub fn type_keys(
        &mut self,
        terminal: &mut Terminal,
        answered: &mut Answered,
        now: f32,
    ) -> Typed {
        let keys = terminal.keys();
        if keys.is_empty() {
            return Typed::Nothing;
        }
        let only_a_key = self.ask.wants_only_a_recovery_key();
        for key in keys {
            match key {
                Key::Text(' ') | Key::Tab if only_a_key => {
                    self.incomplete = false;
                    self.next_word();
                }
                Key::Text(character) => {
                    self.incomplete = false;
                    self.secret.push(character);
                }
                Key::Erase => {
                    self.incomplete = false;
                    self.secret.pop();
                }
                Key::Clear => {
                    self.incomplete = false;
                    self.secret.clear();
                }
                Key::Escape if self.ask.can_go_back() => {
                    let _ = self.request.cancel();
                    self.secret.clear();
                    return Typed::Answered;
                }
                Key::Enter if !self.ready_to_answer() => {
                    self.incomplete = true;
                    self.prompt.shake_started = Some(now);
                }
                Key::Enter => {
                    if self.ask.accepts_recovery_key() {
                        self.secret.tidy_recovery_key();
                    }
                    let _ = self.request.answer(&self.secret);
                    self.secret.clear();
                    answered.record(&self.request, &self.ask);
                    return Typed::Answered;
                }
                _ => {}
            }
        }
        self.rejected &= self.secret.characters() == 0;
        self.refresh();
        Typed::Changed
    }
}
