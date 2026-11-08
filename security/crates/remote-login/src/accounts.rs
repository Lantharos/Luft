use std::io;
use std::path::PathBuf;

use nix::unistd::{Uid, User};
use rustix::thread::{
    Gid, Uid as ThreadUid, set_thread_groups, set_thread_res_gid, set_thread_res_uid,
};
use tokio::sync::oneshot;

const FIRST_PERSON: u32 = 1000;
const NOBODY: u32 = 65534;

pub struct Account {
    pub name: String,
    pub home: PathBuf,
    uid: u32,
    gid: u32,
}

impl Account {
    fn person(user: User) -> Option<Self> {
        let uid = user.uid.as_raw();
        (uid >= FIRST_PERSON && uid != NOBODY).then(|| Self {
            name: user.name,
            home: user.dir,
            uid,
            gid: user.gid.as_raw(),
        })
    }

    pub fn by_uid(uid: u32) -> Option<Self> {
        User::from_uid(Uid::from_raw(uid))
            .ok()
            .flatten()
            .and_then(Self::person)
    }

    pub fn by_name(name: &str) -> Option<Self> {
        User::from_name(name).ok().flatten().and_then(Self::person)
    }

    pub async fn run_as<T: Send + 'static>(
        self,
        work: impl FnOnce(&Self) -> io::Result<T> + Send + 'static,
    ) -> io::Result<T> {
        let (sender, answer) = oneshot::channel();
        std::thread::spawn(move || {
            let _ = sender.send(self.become_self().and_then(|()| work(&self)));
        });
        answer.await.map_err(io::Error::other)?
    }

    fn become_self(&self) -> io::Result<()> {
        let gid = Gid::from_raw(self.gid);
        let uid = ThreadUid::from_raw(self.uid);
        set_thread_groups(&[])?;
        set_thread_res_gid(gid, gid, gid)?;
        set_thread_res_uid(uid, uid, uid)?;
        Ok(())
    }
}
