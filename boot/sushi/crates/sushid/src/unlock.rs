use sushi::password::{PasswordRequests, RECOVERY_KEY_LETTERS, Request, Secret};
use sushi::scene::Prompt;
use sushi::terminal::{Key, Terminal};

use crate::ask::Ask;

pub struct Unlock {
    request: Request,
    ask: Ask,
    secret: Secret,
    rejected: bool,
    caps_lock: bool,
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
        };
        unlock.refresh();
        Some(unlock)
    }

    fn refresh(&mut self) {
        let copy = self.ask.copy();
        self.prompt.title = copy.title;
        self.prompt.explanation = copy.explanation;
        self.prompt.placeholder = copy.placeholder.to_owned();
        self.prompt.typed = self.secret.characters();
        let letters = self
            .secret
            .recovery_key_letters()
            .filter(|letters| *letters > 0 && self.ask.wants_only_a_recovery_key());
        self.prompt.note = if self.rejected {
            Some((copy.rejected.to_owned(), 1.0))
        } else if self.caps_lock {
            Some(("Caps Lock is on".to_owned(), 0.7))
        } else {
            letters.map(|letters| {
                (
                    format!("{letters} of {RECOVERY_KEY_LETTERS} characters"),
                    0.5,
                )
            })
        };
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

    pub fn type_keys(&mut self, terminal: &mut Terminal, answered: &mut Answered) -> Typed {
        let keys = terminal.keys();
        if keys.is_empty() {
            return Typed::Nothing;
        }
        for key in keys {
            match key {
                Key::Text(character) => self.secret.push(character),
                Key::Erase => self.secret.pop(),
                Key::Clear => self.secret.clear(),
                Key::Enter => {
                    if self.ask.accepts_recovery_key() {
                        self.secret.tidy_recovery_key();
                    }
                    let _ = self.request.answer(&self.secret);
                    self.secret.clear();
                    answered.record(&self.request, &self.ask);
                    return Typed::Answered;
                }
            }
        }
        self.rejected &= self.secret.characters() == 0;
        self.refresh();
        Typed::Changed
    }
}
