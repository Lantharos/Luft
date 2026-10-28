use std::fs::{DirBuilder, OpenOptions};
use std::io::Write;
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};

use anyhow::Result;
use luft_keyring_vault::{
    CHIP_KEY_SIZE, ChipWrap, Contents, Header, MasterKey, PasswordWrap, Stored,
};

use super::deployment::Deployment;

const VAULT: &str = ".local/share/luft-keyring/vault";
const STATE: &str = "lib/luft-keyring";
const HANDOFF: &str = "handoff";

pub fn prepare(deployment: &Deployment, home: &Path, uid: &str, password: &str) -> Result<PathBuf> {
    let key = MasterKey::generate()?;
    let mut handoff = [0; CHIP_KEY_SIZE];
    getrandom::fill(&mut handoff)?;
    let header = Header {
        password: Some(PasswordWrap::create(&key, password.as_bytes())?),
        chip: Some(ChipWrap::create(&key, &handoff)?),
    };
    Stored::save(&home.join(VAULT), &header, &key, &Contents::fresh())?;
    let state = deployment.var(STATE);
    DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(&state)?;
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(state.join(uid).with_extension(HANDOFF))?;
    file.write_all(&handoff)?;
    file.sync_all()?;
    Ok(state)
}

pub fn forget_handoffs() -> Result<()> {
    let state = Path::new("/var").join(STATE);
    for entry in std::fs::read_dir(&state).into_iter().flatten().flatten() {
        if entry
            .path()
            .extension()
            .is_some_and(|extension| extension == HANDOFF)
        {
            std::fs::remove_file(entry.path())?;
        }
    }
    Ok(())
}
