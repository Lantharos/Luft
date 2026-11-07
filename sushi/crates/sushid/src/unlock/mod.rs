mod ask;

use sushi::ipc::password::{PasswordRequests, RECOVERY_KEY_LETTERS, Request, Secret};
use sushi::scene::{Prompt, ShownKey};
use sushi::terminal::{Key, Terminal};

use ask::Ask;

const NOT_A_RECOVERY_KEY: &str =
    "Recovery keys only use the letters B C D E F G H I J K L N R T U V";

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

    fn key_note(&self) -> Option<(String, f32)> {
        let typed = self.secret.characters();
        match self.secret.recovery_key_letters() {
            None => Some((NOT_A_RECOVERY_KEY.to_owned(), 1.0)),
            Some(RECOVERY_KEY_LETTERS) => Some(("Press Enter to unlock".to_owned(), 0.7)),
            Some(letters) if letters > RECOVERY_KEY_LETTERS => Some((
                format!("A recovery key has {RECOVERY_KEY_LETTERS} characters, this is more"),
                1.0,
            )),
            Some(letters) if self.incomplete => Some((
                format!("{letters} of {RECOVERY_KEY_LETTERS} characters. Type the rest first."),
                1.0,
            )),
            Some(letters) if typed > 0 => Some((
                format!("{letters} of {RECOVERY_KEY_LETTERS} characters"),
                0.5,
            )),
            Some(_) => None,
        }
    }

    fn refresh(&mut self) {
        let copy = self.ask.copy();
        let only_a_key = self.ask.wants_only_a_recovery_key();
        self.prompt.title = copy.title;
        self.prompt.explanation = copy.explanation;
        self.prompt.placeholder = copy.placeholder.to_owned();
        self.prompt.typed = self.secret.characters();
        self.prompt.key = only_a_key.then(|| ShownKey::new(self.secret.recovery_key_shown()));
        self.prompt.note = if self.rejected {
            Some((copy.rejected.to_owned(), 1.0))
        } else if self.caps_lock && !only_a_key {
            Some(("Caps Lock is on".to_owned(), 0.7))
        } else if only_a_key {
            self.key_note()
        } else {
            self.ask
                .can_go_back()
                .then(|| ("Press Esc to go back".to_owned(), 0.5))
        };
    }

    fn ready_to_answer(&self) -> bool {
        !self.ask.wants_only_a_recovery_key()
            || self.secret.recovery_key_letters() == Some(RECOVERY_KEY_LETTERS)
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
        for key in keys {
            match key {
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
