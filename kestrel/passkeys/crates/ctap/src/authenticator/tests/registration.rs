use super::*;

#[test]
fn creates_a_discoverable_passkey_from_the_spec_request() {
    let mut authenticator = Authenticator::new(Mock::default());
    let response = send(&mut authenticator, &hex(SPEC_MAKE_CREDENTIAL)).unwrap();
    let fields = entries(&response);
    assert_eq!(cbor::text(fields.required(0x01).unwrap()).unwrap(), "none");
    let auth_data = bytes(&fields, 0x02);
    assert_eq!(&auth_data[..32], hex(EXAMPLE_COM_HASH).as_slice());
    let parsed = parse_auth_data(auth_data);
    assert_eq!(parsed.flags, UP | UV | ATTESTED);
    assert_eq!(parsed.counter, 0);

    let stored = &authenticator.platform().stored.borrow()[0].credential;
    assert_eq!(parsed.credential_id.unwrap(), stored.id);
    assert!(stored.discoverable);
    assert_eq!(stored.rp.name.as_deref(), Some("Acme"));
    assert_eq!(stored.user.display_name.as_deref(), Some("John P. Smith"));
    let prompts = authenticator.platform().prompts.borrow();
    assert_eq!(
        prompts[0],
        (
            Purpose::Register,
            Some("example.com".into()),
            vec![Some("johnpsmith@example.com".into())]
        )
    );
}

#[test]
fn replaces_a_discoverable_passkey_for_the_same_account() {
    let mut authenticator = Authenticator::new(Mock::default());
    resident(&mut authenticator, "github.com", "kristof");
    let newer = resident(&mut authenticator, "github.com", "kristof");
    let stored = authenticator.platform().stored.borrow();
    assert_eq!(stored.len(), 1);
    assert_eq!(stored[0].credential.id, newer);
}

#[test]
fn refuses_to_register_twice_after_confirmation() {
    let mut authenticator = Authenticator::new(Mock::default());
    let id = resident(&mut authenticator, "github.com", "kristof");
    let exclude = Value::Array(vec![crate::model::descriptor(&id)]);
    let mut body = vec![
        (0x01, Value::Bytes(vec![1; 32])),
        (0x02, cbor::map([("id", Value::from("github.com"))])),
        (0x03, cbor::map([("id", Value::Bytes(b"other".to_vec()))])),
        (
            0x04,
            Value::Array(vec![cbor::map([
                ("alg", Value::from(-7)),
                ("type", Value::from("public-key")),
            ])]),
        ),
    ];
    body.push((0x05, exclude));
    assert_eq!(
        command(&mut authenticator, 0x01, cbor::map(body)),
        Err(Status::CredentialExcluded.code())
    );
    assert_eq!(
        authenticator.platform().purposes(),
        [Purpose::Register, Purpose::AlreadyRegistered]
    );
}

#[test]
fn a_dismissed_prompt_denies_the_operation() {
    let mut authenticator = Authenticator::new(Mock::default());
    authenticator
        .platform()
        .answer(Err(Status::OperationDenied));
    let request = cbor::map([
        (0x01, Value::Bytes(vec![1; 32])),
        (0x02, cbor::map([("id", Value::from("github.com"))])),
        (0x03, cbor::map([("id", Value::Bytes(b"me".to_vec()))])),
        (
            0x04,
            Value::Array(vec![cbor::map([
                ("alg", Value::from(-7)),
                ("type", Value::from("public-key")),
            ])]),
        ),
    ]);
    assert_eq!(
        command(&mut authenticator, 0x01, request),
        Err(Status::OperationDenied.code())
    );
    assert!(authenticator.platform().stored.borrow().is_empty());
}

#[test]
fn refuses_algorithms_other_than_es256() {
    let mut authenticator = Authenticator::new(Mock::default());
    let request = cbor::map([
        (0x01, Value::Bytes(vec![1; 32])),
        (0x02, cbor::map([("id", Value::from("github.com"))])),
        (0x03, cbor::map([("id", Value::Bytes(b"me".to_vec()))])),
        (
            0x04,
            Value::Array(vec![cbor::map([
                ("alg", Value::from(-257)),
                ("type", Value::from("public-key")),
            ])]),
        ),
    ]);
    assert_eq!(
        command(&mut authenticator, 0x01, request),
        Err(Status::UnsupportedAlgorithm.code())
    );
}
