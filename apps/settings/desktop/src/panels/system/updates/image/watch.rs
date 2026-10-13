use luft_software::image::{self, running};

use super::super::elsewhere::{self, finished};
use super::super::state;

pub fn watch() {
    std::thread::spawn(|| {
        scan();
        let _ = running::watch(scan);
    });
}

pub fn scan() {
    if state::busy() {
        return;
    }
    let Ok(Some(transaction)) = running::running() else {
        return;
    };
    let activity = elsewhere::activity(elsewhere::sent_by(&transaction.sender), transaction.change);
    let address = transaction.address;
    state::start(
        activity,
        move |task| image::follow(&address, Some(task)).or_else(|_| running::wait()),
        finished,
    );
}
