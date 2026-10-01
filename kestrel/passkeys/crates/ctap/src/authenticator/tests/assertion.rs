use super::*;

#[test]
fn answers_the_spec_assertion_request_for_a_listed_credential() {
    let mock = Mock::default();
    mock.insert(
        hex(SPEC_CREDENTIAL_ID),
        "example.com",
        "john",
        false,
        Protection::UvOptional,
    );
    let mut authenticator = Authenticator::new(mock);
    let response = send(&mut authenticator, &hex(SPEC_GET_ASSERTION)).unwrap();
    let fields = entries(&response);
    assert_eq!(
        bytes(&entries(fields.required(0x01).unwrap()), "id"),
        hex(SPEC_CREDENTIAL_ID).as_slice()
    );
    let auth_data = bytes(&fields, 0x02);
    let parsed = parse_auth_data(auth_data);
    assert_eq!(parsed.flags, UP | UV);
    assert_eq!(parsed.counter, 1);
    assert!(fields.get(0x04).is_none());

    let message = [auth_data, hex(SPEC_CLIENT_DATA_HASH).as_slice()].concat();
    let signature = DerSignature::try_from(bytes(&fields, 0x03)).unwrap();
    authenticator
        .platform()
        .verifying_key(&hex(SPEC_CREDENTIAL_ID))
        .verify(&message, &signature)
        .unwrap();
}

#[test]
fn signs_in_with_a_discoverable_passkey_without_claiming_backup() {
    let mut authenticator = Authenticator::new(Mock::default());
    let id = resident(&mut authenticator, "github.com", "kristof");
    let request = cbor::map([
        (0x01, Value::from("github.com")),
        (0x02, Value::Bytes(Sha256::digest(b"client data").to_vec())),
    ]);
    let response = command(&mut authenticator, 0x02, request).unwrap();
    let fields = entries(&response);
    let auth_data = bytes(&fields, 0x02);
    let parsed = parse_auth_data(auth_data);
    assert_eq!(parsed.flags, UP | UV);
    assert_eq!(parsed.flags & BACKUP, 0);
    let user = entries(fields.required(0x04).unwrap());
    assert_eq!(
        cbor::text(user.required("name").unwrap()).unwrap(),
        "kristof"
    );

    let message = [auth_data, Sha256::digest(b"client data").as_slice()].concat();
    let signature = DerSignature::try_from(bytes(&fields, 0x03)).unwrap();
    authenticator
        .platform()
        .verifying_key(&id)
        .verify(&message, &signature)
        .unwrap();
}

#[test]
fn returns_the_account_picked_in_the_prompt() {
    let mut authenticator = Authenticator::new(Mock::default());
    resident(&mut authenticator, "github.com", "work");
    let personal = resident(&mut authenticator, "github.com", "personal");
    authenticator
        .platform()
        .answer(Ok(Consent::Verified { account: 1 }));
    let request = cbor::map([
        (0x01, Value::from("github.com")),
        (0x02, Value::Bytes(vec![0; 32])),
    ]);
    let response = command(&mut authenticator, 0x02, request).unwrap();
    let fields = entries(&response);
    assert_eq!(
        bytes(&entries(fields.required(0x01).unwrap()), "id"),
        personal.as_slice()
    );
    assert_eq!(fields.get(0x06), Some(&Value::from(true)));
    assert!(fields.get(0x05).is_none());
    let accounts = &authenticator.platform().prompts.borrow()[2].2;
    assert_eq!(
        accounts,
        &[Some("work".to_owned()), Some("personal".to_owned())]
    );
}

#[test]
fn silent_probes_skip_the_prompt_and_hide_protected_passkeys() {
    let mock = Mock::default();
    mock.insert(
        vec![1; 16],
        "bank.example",
        "me",
        true,
        Protection::UvRequired,
    );
    mock.insert(
        vec![2; 16],
        "bank.example",
        "me",
        true,
        Protection::UvOptional,
    );
    let mut authenticator = Authenticator::new(mock);
    let probe = |id: u8| {
        cbor::map([
            (0x01, Value::from("bank.example")),
            (0x02, Value::Bytes(vec![0; 32])),
            (
                0x03,
                Value::Array(vec![crate::model::descriptor(&[id; 16])]),
            ),
            (0x05, cbor::map([("up", Value::from(false))])),
        ])
    };
    assert_eq!(
        command(&mut authenticator, 0x02, probe(1)),
        Err(Status::NoCredentials.code())
    );
    let response = command(&mut authenticator, 0x02, probe(2)).unwrap();
    assert_eq!(parse_auth_data(bytes(&entries(&response), 0x02)).flags, 0);
    assert!(authenticator.platform().prompts.borrow().is_empty());
}
