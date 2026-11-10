use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::OpenOptionsExt;
use std::path::Path;

use rcgen::{CertificateParams, DistinguishedName, DnType, KeyPair};
use rustls::pki_types::{CertificateDer, PrivateKeyDer, PrivatePkcs8KeyDer};
use sha2::{Digest, Sha256};

const CERTIFICATE: &str = "certificate.der";
const KEY: &str = "key.der";

pub struct Identity {
    pub certificate: CertificateDer<'static>,
    key: PrivatePkcs8KeyDer<'static>,
    pub fingerprint: String,
}

impl Identity {
    pub fn load_or_create(folder: &Path) -> io::Result<Self> {
        let (certificate, key) = match (fs::read(folder.join(CERTIFICATE)), fs::read(folder.join(KEY))) {
            (Ok(certificate), Ok(key)) => (certificate, key),
            _ => create(folder)?,
        };
        Ok(Self {
            fingerprint: fingerprint(&certificate),
            certificate: CertificateDer::from(certificate),
            key: PrivatePkcs8KeyDer::from(key),
        })
    }

    pub fn key(&self) -> PrivateKeyDer<'static> {
        PrivateKeyDer::Pkcs8(self.key.clone_key())
    }
}

pub fn fingerprint(certificate: &[u8]) -> String {
    Sha256::digest(certificate).iter().map(|byte| format!("{byte:02X}")).collect()
}

fn create(folder: &Path) -> io::Result<(Vec<u8>, Vec<u8>)> {
    let invalid = |error: rcgen::Error| io::Error::new(io::ErrorKind::InvalidData, error);
    let key = KeyPair::generate().map_err(invalid)?;
    let mut params = CertificateParams::new(Vec::<String>::new()).map_err(invalid)?;
    params.distinguished_name = DistinguishedName::new();
    params.distinguished_name.push(DnType::CommonName, "Post");
    let certificate = params.self_signed(&key).map_err(invalid)?.der().to_vec();
    let key = key.serialize_der();
    fs::create_dir_all(folder)?;
    write_private(&folder.join(KEY), &key)?;
    write_private(&folder.join(CERTIFICATE), &certificate)?;
    Ok((certificate, key))
}

fn write_private(path: &Path, contents: &[u8]) -> io::Result<()> {
    let mut file = OpenOptions::new().write(true).create(true).truncate(true).mode(0o600).open(path)?;
    file.write_all(contents)?;
    file.sync_all()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_the_same_identity_across_starts() {
        let folder = tempfile::tempdir().unwrap();
        let first = Identity::load_or_create(folder.path()).unwrap();
        let again = Identity::load_or_create(folder.path()).unwrap();
        assert_eq!(first.fingerprint, again.fingerprint);
        assert_eq!(first.fingerprint, fingerprint(&again.certificate));
        assert_eq!(first.fingerprint.len(), 64);
    }
}
