use std::sync::mpsc::{self, Sender};

use tokio::sync::oneshot;

const NICENESS: libc::c_int = 19;
const IOPRIO_WHO_PROCESS: libc::c_int = 1;
const IOPRIO_CLASS_IDLE: libc::c_int = 3;
const IOPRIO_CLASS_SHIFT: libc::c_int = 13;

fn idle_current_thread() {
    let idle = libc::sched_param { sched_priority: 0 };
    unsafe {
        libc::sched_setscheduler(0, libc::SCHED_IDLE, &idle);
        libc::setpriority(libc::PRIO_PROCESS, libc::gettid() as libc::id_t, NICENESS);
        libc::syscall(
            libc::SYS_ioprio_set,
            IOPRIO_WHO_PROCESS,
            0,
            IOPRIO_CLASS_IDLE << IOPRIO_CLASS_SHIFT,
        );
    }
}

type Job = Box<dyn FnOnce() + Send>;

pub struct Background(Sender<Job>);

impl Background {
    pub fn start() -> Self {
        let (jobs, queue) = mpsc::channel::<Job>();
        std::thread::Builder::new()
            .name("background".into())
            .spawn(move || {
                idle_current_thread();
                queue.into_iter().for_each(|job| job());
            })
            .expect("the background thread starts");
        Self(jobs)
    }

    pub async fn run<T: Send + 'static>(&self, work: impl FnOnce() -> T + Send + 'static) -> T {
        let (done, result) = oneshot::channel();
        self.0
            .send(Box::new(move || {
                let _ = done.send(work());
            }))
            .expect("the background thread runs as long as the service");
        result.await.expect("background work always answers")
    }
}
