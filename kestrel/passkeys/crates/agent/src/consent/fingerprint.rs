use tokio::sync::mpsc;
use tokio::task::JoinHandle;

use super::authenticate::{Reply, Session};

const RESTARTS: u32 = 1;
const NOT_RECOGNIZED: &str = "Fingerprint not recognized. Try again.";

pub enum Scan {
    Matched,
    Hint(String),
    Lost,
}

pub struct Reader {
    events: mpsc::UnboundedReceiver<Scan>,
    task: JoinHandle<()>,
}

impl Reader {
    pub async fn start(user: &str) -> Option<(Self, String)> {
        let (session, reply) = Session::start(user, "fingerprint").await.ok()?;
        let Reply::Message { text, error: false } = reply else {
            return None;
        };
        let (sender, events) = mpsc::unbounded_channel();
        let task = tokio::spawn(listen(user.to_owned(), session, sender));
        Some((Self { events, task }, text))
    }

    pub async fn scan(&mut self) -> Scan {
        self.events.recv().await.unwrap_or(Scan::Lost)
    }
}

impl Drop for Reader {
    fn drop(&mut self) {
        self.task.abort();
    }
}

async fn listen(user: String, mut session: Session, events: mpsc::UnboundedSender<Scan>) {
    let mut restarts = 0;
    loop {
        let event = match session.answer(None).await {
            Ok(Reply::Message { text, error }) => Scan::Hint(if error {
                NOT_RECOGNIZED.to_owned()
            } else {
                text
            }),
            Ok(Reply::Failure) if restarts < RESTARTS => {
                restarts += 1;
                match Session::start(&user, "fingerprint").await {
                    Ok((restarted, Reply::Message { .. })) => {
                        session = restarted;
                        Scan::Hint(NOT_RECOGNIZED.to_owned())
                    }
                    _ => Scan::Lost,
                }
            }
            Ok(Reply::Success) => Scan::Matched,
            Ok(Reply::Question | Reply::Failure) | Err(_) => Scan::Lost,
        };
        let finished = !matches!(event, Scan::Hint(_));
        if events.send(event).is_err() || finished {
            return;
        }
    }
}
