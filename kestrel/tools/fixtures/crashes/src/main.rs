//! Crashes the way a check asks, each way with a crash of its own: `segv`
//! reads memory that isn't there, `abort`, `ill` and `fpe` end on those
//! signals, and `panic` and `panic-other` panic on a worker thread with the
//! program's own path in the message, which a report has to leave out, and
//! keep running for a moment, the way a service does when one task panics.

use std::time::Duration;

const UNMAPPED: usize = 16;
const KEEPS_RUNNING: Duration = Duration::from_secs(3);

#[inline(never)]
fn read_unmapped() -> u8 {
    unsafe { std::ptr::without_provenance::<u8>(UNMAPPED).read_volatile() }
}

#[inline(never)]
fn end_on(signal: libc::c_int) {
    unsafe { libc::raise(signal) };
}

fn program() -> String {
    std::env::current_exe()
        .unwrap_or_default()
        .display()
        .to_string()
}

fn panic_on_a_worker(other: bool) {
    let worker = std::thread::spawn(move || {
        if other {
            panic!("the crash fixture at {} panicked elsewhere", program());
        }
        panic!("the crash fixture at {} panicked as asked", program());
    });
    let _ = worker.join();
    std::thread::sleep(KEEPS_RUNNING);
}

fn main() {
    luft_dbus::panics::report();
    match std::env::args().nth(1).as_deref() {
        Some("segv") => std::process::exit(i32::from(read_unmapped())),
        Some("abort") => std::process::abort(),
        Some("ill") => end_on(libc::SIGILL),
        Some("fpe") => end_on(libc::SIGFPE),
        Some("panic") => panic_on_a_worker(false),
        Some("panic-other") => panic_on_a_worker(true),
        _ => eprintln!("Usage: luft-crash-fixture segv | abort | ill | fpe | panic | panic-other"),
    }
}
