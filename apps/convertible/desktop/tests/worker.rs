mod common;

use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdout, Command, Stdio};
use std::thread;
use std::time::Duration;

use common::{fixture, job, only_entries};
use convertible_lib::engine::job::Job;
use convertible_lib::worker::{ARGUMENT, Reply, Request};
use tempfile::tempdir;

const HOLD: Duration = Duration::from_millis(400);

fn slow_job(folder: &std::path::Path) -> Job {
    let mut slow = job(&[&fixture("clip.webm")], folder, "slow.webm", "webm");
    slow.options.height = Some(1440);
    slow
}

fn start(job: &Job) -> (Child, BufReader<ChildStdout>) {
    let mut worker = Command::new(env!("CARGO_BIN_EXE_convertible"))
        .arg(ARGUMENT)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();
    let request = Request::Convert {
        job: Box::new(job.clone()),
    };
    let mut line = serde_json::to_vec(&request).unwrap();
    line.push(b'\n');
    worker.stdin.take().unwrap().write_all(&line).unwrap();
    let replies = BufReader::new(worker.stdout.take().unwrap());
    (worker, replies)
}

fn next_reply(replies: &mut BufReader<ChildStdout>) -> Reply {
    let mut line = String::new();
    replies.read_line(&mut line).unwrap();
    serde_json::from_str(&line).unwrap()
}

fn signal(worker: &Child, signal: libc::c_int) {
    unsafe {
        libc::kill(worker.id() as i32, signal);
    }
}

#[test]
fn a_worker_told_to_stop_takes_its_partial_file_with_it() {
    let folder = tempdir().unwrap();
    let slow = slow_job(folder.path());
    let (mut worker, mut replies) = start(&slow);
    assert!(matches!(next_reply(&mut replies), Reply::Progress(_)));
    assert!(slow.temp.exists());
    signal(&worker, libc::SIGTERM);
    worker.wait().unwrap();
    assert!(only_entries(folder.path()).is_empty());
}

#[test]
fn a_paused_worker_stops_writing_and_finishes_when_resumed() {
    let folder = tempdir().unwrap();
    let slow = slow_job(folder.path());
    let (mut worker, mut replies) = start(&slow);
    assert!(matches!(next_reply(&mut replies), Reply::Progress(_)));
    signal(&worker, libc::SIGSTOP);
    thread::sleep(HOLD);
    let written = fs::metadata(&slow.temp).unwrap().len();
    thread::sleep(HOLD);
    assert_eq!(fs::metadata(&slow.temp).unwrap().len(), written);
    signal(&worker, libc::SIGCONT);
    loop {
        match next_reply(&mut replies) {
            Reply::Converted(path) => {
                assert_eq!(path, slow.destination);
                break;
            }
            Reply::Failed(message) => panic!("{message}"),
            _ => {}
        }
    }
    worker.wait().unwrap();
    assert_eq!(only_entries(folder.path()), ["slow.webm"]);
}
