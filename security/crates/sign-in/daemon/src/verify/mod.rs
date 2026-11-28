mod card;
mod conversation;
mod key;

use std::io;
use std::os::fd::AsRawFd;
use std::os::unix::net::UnixStream;
use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;
use luft_sign_in_wire::{Problem, Question, Reply, Request, Way, read};
use tokio::net::UnixListener;
use zbus::Connection;

use crate::card::Watches;
use crate::recovery;
use crate::store::Store;
use crate::ways::{self, Ways};
use conversation::Conversation;

const REQUEST_PATIENCE: Duration = Duration::from_secs(10);

pub struct Verifier {
    pub connection: Connection,
    pub idle: Arc<Idle>,
    pub watches: Arc<Watches>,
}

impl Verifier {
    pub async fn serve(self: Arc<Self>, listener: UnixListener) -> io::Result<()> {
        loop {
            let (stream, _) = listener.accept().await?;
            let verifier = self.clone();
            tokio::spawn(async move {
                let idle = verifier.idle.clone();
                let _activity = idle.hold();
                let Ok(stream) = stream.into_std() else {
                    return;
                };
                let handle = tokio::runtime::Handle::current();
                let _ = tokio::task::spawn_blocking(move || verifier.answer(stream, &handle)).await;
            });
        }
    }

    fn answer(&self, stream: UnixStream, runtime: &tokio::runtime::Handle) {
        if peer_uid(&stream) != Some(0) || stream.set_nonblocking(false).is_err() {
            return;
        }
        let _ = stream.set_read_timeout(Some(REQUEST_PATIENCE));
        let mut conversation = Conversation::new(stream);
        let Ok(request) = read::<Request>(conversation.stream()) else {
            return;
        };
        let reply = match request {
            Request::PasswordAllowed { user } => Reply::Allowed(password_allowed(&user)),
            Request::Verify { user, way } => {
                let Some(uid) = ways::uid_of(&user) else {
                    let _ = conversation.reply(&Reply::Refused(Problem::NothingEnrolled));
                    return;
                };
                let reply = match way {
                    Way::SecurityKey => key::verify(&mut conversation, uid),
                    Way::SmartCard => card::verify(&mut conversation, uid, |reader| {
                        let _guard = runtime.enter();
                        self.watches
                            .arm(uid, reader, self.connection.clone(), self.idle.clone());
                    }),
                    Way::RecoveryKey => runtime.block_on(self.recover(&mut conversation, uid)),
                };
                if let Reply::Refused(problem) = &reply {
                    eprintln!("Signing {user} in with {way:?} didn't work: {problem:?}");
                }
                reply
            }
            Request::Answer(_) => return,
        };
        let _ = conversation.reply(&reply);
    }

    async fn recover(&self, conversation: &mut Conversation, uid: u32) -> Reply {
        let Ok(words) = conversation.ask(Question::RecoveryKey) else {
            return Reply::Refused(Problem::TimedOut);
        };
        let words = String::from_utf8_lossy(words.expose()).into_owned();
        if !recovery::opens_the_disk(&self.connection, &words).await {
            return Reply::Refused(Problem::WrongRecoveryKey);
        }
        match Store::system().change(uid, |person| person.password = true) {
            Ok(_) => Reply::PasswordBack,
            Err(error) => Reply::Refused(Problem::Failed(error.to_string())),
        }
    }
}

fn password_allowed(user: &str) -> bool {
    let Some(uid) = ways::uid_of(user) else {
        return true;
    };
    Store::system()
        .person(uid)
        .map(|person| Ways::of(&person, ways::has_fingerprints(user)).password())
        .unwrap_or(true)
}

fn peer_uid(stream: &UnixStream) -> Option<u32> {
    let mut credentials = libc::ucred {
        pid: 0,
        uid: 0,
        gid: 0,
    };
    let mut length = size_of::<libc::ucred>() as libc::socklen_t;
    let result = unsafe {
        libc::getsockopt(
            stream.as_raw_fd(),
            libc::SOL_SOCKET,
            libc::SO_PEERCRED,
            (&raw mut credentials).cast(),
            &raw mut length,
        )
    };
    (result == 0).then_some(credentials.uid)
}
