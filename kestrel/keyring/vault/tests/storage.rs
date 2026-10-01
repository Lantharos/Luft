use std::collections::BTreeMap;

use luft_keyring_vault::{
    Action, AuditLog, ChipWrap, Collection, Contents, Error, Header, Item, MasterKey, PasswordWrap,
    Record, Secret, Stored,
};

fn sample() -> Contents {
    let mut login = Collection::new("login", "Login");
    let attributes = BTreeMap::from([("service".to_owned(), "github.com".to_owned())]);
    login.add(Item::new(
        "GitHub".into(),
        attributes,
        Secret::copy_of(b"hunter2"),
        "text/plain".into(),
    ));
    Contents {
        collections: vec![login],
        ..Contents::default()
    }
}

#[test]
fn contents_come_back_only_with_the_master_key_through_either_wrap() {
    let folder = tempfile::tempdir().unwrap();
    let path = folder.path().join("vault");
    let key = MasterKey::generate().unwrap();
    let chip_key = [7; 32];
    let header = Header {
        password: Some(PasswordWrap::create(&key, b"correct horse").unwrap()),
        chip: Some(ChipWrap::create(&key, &chip_key).unwrap()),
    };
    Stored::save(&path, &header, &key, &sample()).unwrap();

    let stored = Stored::load(&path).unwrap().unwrap();
    let by_password = stored
        .header
        .password
        .as_ref()
        .unwrap()
        .open(b"correct horse")
        .unwrap();
    let by_chip = stored
        .header
        .chip
        .as_ref()
        .unwrap()
        .open(&chip_key)
        .unwrap();
    for key in [by_password, by_chip] {
        let item = &stored.open(&key).unwrap().collections[0].items[0];
        assert_eq!(item.secret.expose(), b"hunter2");
    }

    assert!(matches!(
        stored.header.password.as_ref().unwrap().open(b"wrong"),
        Err(Error::WrongPassword)
    ));
    assert!(matches!(
        stored.header.chip.as_ref().unwrap().open(&[8; 32]),
        Err(Error::WrongKey)
    ));
    assert!(matches!(
        stored.open(&MasterKey::generate().unwrap()),
        Err(Error::WrongKey)
    ));
}

#[test]
fn a_changed_header_no_longer_opens() {
    let folder = tempfile::tempdir().unwrap();
    let path = folder.path().join("vault");
    let key = MasterKey::generate().unwrap();
    let header = Header {
        password: Some(PasswordWrap::create(&key, b"pw").unwrap()),
        chip: None,
    };
    Stored::save(&path, &header, &key, &sample()).unwrap();

    let mut bytes = std::fs::read(&path).unwrap();
    let stripped = Header {
        password: None,
        chip: None,
    };
    let mut encoded = Vec::new();
    ciborium::into_writer(&stripped, &mut encoded).unwrap();
    let length = u32::from_le_bytes(bytes[9..13].try_into().unwrap()) as usize;
    let body = bytes.split_off(13 + length);
    bytes.truncate(9);
    bytes.extend_from_slice(&u32::try_from(encoded.len()).unwrap().to_le_bytes());
    bytes.extend_from_slice(&encoded);
    bytes.extend_from_slice(&body);
    std::fs::write(&path, bytes).unwrap();

    assert!(matches!(
        Stored::load(&path).unwrap().unwrap().open(&key),
        Err(Error::WrongKey)
    ));
}

#[test]
fn audit_records_are_readable_only_with_the_key() {
    let folder = tempfile::tempdir().unwrap();
    let log = AuditLog::new(folder.path().join("audit"));
    let key = MasterKey::generate().unwrap();
    let record = Record {
        time: 1,
        app: "flatpak:org.mozilla.firefox".into(),
        app_name: "Firefox".into(),
        action: Action::Read,
        target: "GitHub".into(),
    };
    log.append(&key, &record).unwrap();
    log.append(&key, &record).unwrap();

    assert_eq!(log.read(&key).unwrap(), vec![record.clone(), record]);
    assert!(
        log.read(&MasterKey::generate().unwrap())
            .unwrap()
            .is_empty()
    );
}
