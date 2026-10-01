use std::net::TcpListener;
use std::process::{Child, Command};
use std::time::Duration;

use luft_keyring_wire::Problem;
use tss_esapi::handles::PcrHandle;
use tss_esapi::interface_types::algorithm::HashingAlgorithm;
use tss_esapi::structures::{Digest, DigestValues};

use super::Chip;

struct Swtpm {
    process: Child,
    port: u16,
    _state: tempfile::TempDir,
}

impl Swtpm {
    fn start() -> Self {
        let state = tempfile::tempdir().unwrap();
        let port = free_port();
        let process = Command::new("swtpm")
            .args(["socket", "--tpm2", "--flags", "not-need-init,startup-clear"])
            .args(["--server", &format!("type=tcp,port={port}")])
            .args(["--ctrl", &format!("type=tcp,port={}", port + 1)])
            .args(["--tpmstate", &format!("dir={}", state.path().display())])
            .spawn()
            .expect("swtpm is installed");
        std::thread::sleep(Duration::from_millis(300));
        Self {
            process,
            port,
            _state: state,
        }
    }

    fn chip(&self) -> Chip {
        Chip::open(&format!("swtpm:host=127.0.0.1,port={}", self.port)).unwrap()
    }
}

impl Drop for Swtpm {
    fn drop(&mut self) {
        let _ = self.process.kill();
        let _ = self.process.wait();
    }
}

fn free_port() -> u16 {
    loop {
        let port = TcpListener::bind("127.0.0.1:0")
            .unwrap()
            .local_addr()
            .unwrap()
            .port();
        if TcpListener::bind(("127.0.0.1", port + 1)).is_ok() {
            return port;
        }
    }
}

fn extend_secure_boot_pcr(chip: &mut Chip) {
    let mut values = DigestValues::new();
    values.set(
        HashingAlgorithm::Sha256,
        Digest::try_from(vec![1; 32]).unwrap(),
    );
    chip.context
        .execute_with_nullauth_session(|context| context.pcr_extend(PcrHandle::Pcr7, values))
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

    extend_secure_boot_pcr(&mut chip);
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
