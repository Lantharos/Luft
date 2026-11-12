use std::net::TcpListener;
use std::os::fd::AsRawFd;
use std::os::unix::process::CommandExt;
use std::process::{Child, Command};
use std::time::{Duration, Instant};

use luft_keyring_wire::Problem;
use tss_esapi::handles::PcrHandle;
use tss_esapi::interface_types::algorithm::HashingAlgorithm;
use tss_esapi::structures::{Digest, DigestValues};

use super::Chip;

const STARTING: Duration = Duration::from_secs(10);

/// A software TPM on a command port of its own. Its control port, the next
/// one up, stays bound by the test, so no other test's TPM takes the pair.
struct Swtpm {
    process: Child,
    port: u16,
    _control: TcpListener,
    _state: tempfile::TempDir,
}

impl Swtpm {
    fn start() -> Self {
        let deadline = Instant::now() + STARTING;
        loop {
            let mut tpm = Self::spawn();
            while tpm.process.try_wait().unwrap().is_none() {
                if Chip::open(&tpm.tcti()).is_ok() {
                    return tpm;
                }
                assert!(Instant::now() < deadline, "swtpm didn't start");
                std::thread::sleep(Duration::from_millis(5));
            }
        }
    }

    fn spawn() -> Self {
        let state = tempfile::tempdir().unwrap();
        let (port, control) = command_port_below_a_control_port();
        let fd = control.as_raw_fd();
        let mut swtpm = Command::new("swtpm");
        swtpm
            .args(["socket", "--tpm2", "--flags", "not-need-init,startup-clear"])
            .args(["--server", &format!("type=tcp,port={port}")])
            .args(["--ctrl", &format!("type=tcp,fd={fd}")])
            .args(["--tpmstate", &format!("dir={}", state.path().display())]);
        // SAFETY: fcntl is safe to call between fork and exec.
        unsafe {
            swtpm.pre_exec(move || match libc::fcntl(fd, libc::F_SETFD, 0) {
                -1 => Err(std::io::Error::last_os_error()),
                _ => Ok(()),
            });
        }
        Self {
            process: swtpm.spawn().expect("swtpm is installed"),
            port,
            _control: control,
            _state: state,
        }
    }

    fn tcti(&self) -> String {
        format!("swtpm:host=127.0.0.1,port={}", self.port)
    }

    fn chip(&self) -> Chip {
        Chip::open(&self.tcti()).unwrap()
    }
}

impl Drop for Swtpm {
    fn drop(&mut self) {
        let _ = self.process.kill();
        let _ = self.process.wait();
    }
}

fn command_port_below_a_control_port() -> (u16, TcpListener) {
    loop {
        let port = TcpListener::bind("127.0.0.1:0")
            .unwrap()
            .local_addr()
            .unwrap()
            .port();
        if let Ok(control) = TcpListener::bind(("127.0.0.1", port + 1)) {
            return (port, control);
        }
    }
}

fn extend(chip: &mut Chip, pcr: PcrHandle) {
    let mut values = DigestValues::new();
    values.set(
        HashingAlgorithm::Sha256,
        Digest::try_from(vec![1; 32]).unwrap(),
    );
    chip.context
        .execute_with_nullauth_session(|context| context.pcr_extend(pcr, values))
        .unwrap();
}

#[test]
fn a_seal_opens_until_the_secure_boot_state_changes() {
    let tpm = Swtpm::start();
    let mut chip = tpm.chip();
    let blob = chip.seal(&[42; 32], None).unwrap();

    assert_eq!(chip.unseal(&blob, None).unwrap().as_slice(), &[42; 32]);
    assert_eq!(
        tpm.chip().unseal(&blob, None).unwrap().as_slice(),
        &[42; 32]
    );

    extend(&mut chip, PcrHandle::Pcr7);
    assert_eq!(chip.unseal(&blob, None), Err(Problem::PolicyChanged));
}

#[test]
fn a_seal_opens_only_on_the_system_it_was_made_on() {
    let tpm = Swtpm::start();
    let mut chip = tpm.chip();
    let blob = chip.seal(&[7; 32], None).unwrap();

    extend(&mut chip, PcrHandle::Pcr15);
    assert_eq!(chip.unseal(&blob, None), Err(Problem::PolicyChanged));
}

#[test]
fn a_pin_seal_needs_the_pin_and_locks_out_guessing() {
    let tpm = Swtpm::start();
    let mut chip = tpm.chip();
    let blob = chip.seal(&[9; 32], Some(b"2468")).unwrap();

    assert_eq!(chip.unseal(&blob, None), Err(Problem::WrongPin));
    assert_eq!(
        chip.unseal(&blob, Some(b"2468")).unwrap().as_slice(),
        &[9; 32]
    );

    let mut outcomes = (0..5).map(|_| chip.unseal(&blob, Some(b"0000")).unwrap_err());
    assert_eq!(outcomes.next(), Some(Problem::WrongPin));
    assert!(outcomes.any(|outcome| outcome == Problem::LockedOut));
}

#[test]
fn chip_keys_sign_only_with_their_auth() {
    let tpm = Swtpm::start();
    let mut chip = tpm.chip();
    let key = chip.create_key(b"key auth").unwrap();
    assert_eq!((key.point.0.len(), key.point.1.len()), (32, 32));

    let (r, s) = chip.sign(&key, b"key auth", &[3; 32]).unwrap();
    assert!(!r.is_empty() && !s.is_empty());
    assert!(chip.sign(&key, b"other", &[3; 32]).is_err());
}
