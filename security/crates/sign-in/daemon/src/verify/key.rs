use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};

use luft_sign_in_wire::{Notice, Problem, Question, Reply, Token};

use super::conversation::{Conversation, hung_up};
use crate::card::random;
use crate::fido::{self, Device, Error};
use crate::store::{SecurityKey, Store};

const PATIENCE: Duration = Duration::from_secs(120);
const LOOK_EVERY: Duration = Duration::from_millis(400);

pub fn problem(error: Error, device: &Device) -> Problem {
    match error {
        Error::WrongPin => Problem::WrongPin {
            tries_left: device.pin_tries_left(),
        },
        Error::PinBlocked => Problem::Blocked,
        Error::TimedOut => Problem::TimedOut,
        Error::PinTooSimple | Error::NoCredential => Problem::NotEnrolledHere,
        Error::Failed(reason) => Problem::Failed(reason),
    }
}

/// Waits for a plugged-in key that holds one of `keys`, asking for it to be
/// plugged in only when none is there yet.
fn find(
    conversation: &mut Conversation,
    keys: &[SecurityKey],
) -> Result<(Device, SecurityKey), Reply> {
    let started = Instant::now();
    let mut asked = false;
    let mut probed = Vec::new();
    loop {
        for plugged in fido::plugged().unwrap_or_default() {
            if probed.contains(&plugged.path) {
                continue;
            }
            probed.push(plugged.path.clone());
            let Ok(device) = Device::open(&plugged.path) else {
                continue;
            };
            if let Some(key) = keys
                .iter()
                .find(|key| device.holds(&key.credential).unwrap_or(false))
            {
                return Ok((device, key.clone()));
            }
        }
        if !asked {
            asked = true;
            conversation
                .tell(Notice::PlugInKey)
                .map_err(|_| Reply::Refused(Problem::TimedOut))?;
        }
        if conversation.gone() || started.elapsed() > PATIENCE {
            return Err(Reply::Refused(Problem::TimedOut));
        }
        thread::sleep(LOOK_EVERY);
        probed.retain(|path| std::path::Path::new(path).exists());
    }
}

/// Runs `wait` while cancelling it on the key the moment the module hangs
/// up, so a touch nobody gives doesn't hold the key.
pub fn cancellable<T>(conversation: &Conversation, device: &Device, wait: impl FnOnce() -> T) -> T {
    let done = Arc::new(AtomicBool::new(false));
    let fd = conversation.raw_fd();
    thread::scope(|scope| {
        let watching = done.clone();
        scope.spawn(move || {
            while !watching.load(Ordering::Relaxed) {
                if hung_up(fd, 200) {
                    device.cancel();
                    return;
                }
            }
        });
        let result = wait();
        done.store(true, Ordering::Relaxed);
        result
    })
}

pub fn verify(conversation: &mut Conversation, uid: u32) -> Reply {
    let person = match Store::system().person(uid) {
        Ok(person) => person,
        Err(error) => return Reply::Refused(Problem::Failed(error.to_string())),
    };
    if person.keys.is_empty() {
        return Reply::Refused(Problem::NothingEnrolled);
    }
    let (device, key) = match find(conversation, &person.keys) {
        Ok(found) => found,
        Err(reply) => return reply,
    };
    let pin = if device.verifies_by_itself() && !device.has_pin() {
        None
    } else {
        match conversation.ask(Question::KeyPin) {
            Ok(pin) => Some(String::from_utf8_lossy(pin.expose()).into_owned()),
            Err(_) => return Reply::Refused(Problem::TimedOut),
        }
    };
    if conversation.tell(Notice::TouchKey).is_err() {
        return Reply::Refused(Problem::TimedOut);
    }
    let challenge = random::<32>();
    let asserted = cancellable(conversation, &device, || {
        device.assert(&key.credential(), &challenge, &key.salt(), pin.as_deref())
    });
    match asserted {
        Ok(assertion) if assertion.verified => {
            Reply::Verified(assertion.secret.map(|secret| Token {
                id: key.id.clone(),
                secret: secret.into(),
                enrolled: person.enrolled(),
            }))
        }
        Ok(_) => Reply::Refused(Problem::Failed("the key's answer didn't check out".into())),
        Err(error) => Reply::Refused(problem(error, &device)),
    }
}
