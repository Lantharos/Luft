use std::thread;
use std::time::{Duration, Instant};

use luft_sign_in_wire::{Notice, Problem, Question, Reply, Token};

use super::conversation::Conversation;
use crate::card::{self, Error, Found};
use crate::store::{SmartCard, Store};

const PATIENCE: Duration = Duration::from_secs(120);
const LOOK_EVERY: Duration = Duration::from_millis(500);

pub fn problem(error: Error) -> Problem {
    match error {
        Error::WrongPin => Problem::WrongPin { tries_left: None },
        Error::Blocked => Problem::Blocked,
        Error::Failed(reason) => Problem::Failed(reason),
    }
}

fn find(conversation: &mut Conversation, cards: &[SmartCard]) -> Result<(Found, SmartCard), Reply> {
    let started = Instant::now();
    let mut asked = false;
    loop {
        for found in card::inserted().unwrap_or_default() {
            if let Some(card) = cards
                .iter()
                .find(|card| card.certificate == found.certificate)
            {
                return Ok((found, card.clone()));
            }
        }
        if !asked {
            asked = true;
            conversation
                .tell(Notice::InsertCard)
                .map_err(|_| Reply::Refused(Problem::TimedOut))?;
        }
        if conversation.gone() || started.elapsed() > PATIENCE {
            return Err(Reply::Refused(Problem::TimedOut));
        }
        thread::sleep(LOOK_EVERY);
    }
}

/// Signs in with a card someone enrolled, and has `watch` notice its
/// reader, so taking the card out locks the screen.
pub fn verify(conversation: &mut Conversation, uid: u32, watch: impl FnOnce(String)) -> Reply {
    let person = match Store::system().person(uid) {
        Ok(person) => person,
        Err(error) => return Reply::Refused(Problem::Failed(error.to_string())),
    };
    if person.cards.is_empty() {
        return Reply::Refused(Problem::NothingEnrolled);
    }
    let (found, enrolled) = match find(conversation, &person.cards) {
        Ok(found) => found,
        Err(reply) => return reply,
    };
    let pin = match conversation.ask(Question::CardPin) {
        Ok(pin) => String::from_utf8_lossy(pin.expose()).into_owned(),
        Err(_) => return Reply::Refused(Problem::TimedOut),
    };
    match card::prove(&found, &pin, enrolled.wrap.as_ref()) {
        Ok(secret) => {
            watch(found.reader.clone());
            Reply::Verified(secret.map(|secret| Token {
                id: enrolled.id.clone(),
                secret: secret.to_vec().into(),
                enrolled: person.enrolled(),
            }))
        }
        Err(error) => Reply::Refused(problem(error)),
    }
}
