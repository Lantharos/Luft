use super::*;

fn token(
    authenticator: &mut Authenticator<Mock>,
    permissions: u8,
    rp_id: Option<&str>,
) -> [u8; 32] {
    let platform = KeyAgreement::generate();
    let reply = command(
        authenticator,
        0x06,
        cbor::map([(0x01, Value::from(2)), (0x02, Value::from(2))]),
    )
    .unwrap();
    let theirs = PublicKey::from_cose(entries(&reply).required(0x01).unwrap()).unwrap();
    let mut body = vec![
        (0x01, Value::from(2)),
        (0x02, Value::from(6)),
        (
            0x03,
            platform
                .public_key()
                .to_cose(crate::model::ECDH_ES_HKDF_256),
        ),
        (0x09, Value::from(permissions)),
    ];
    body.extend(rp_id.map(|rp_id| (0x0A, Value::from(rp_id))));
    let reply = command(authenticator, 0x06, cbor::map(body)).unwrap();
    let shared = platform.shared_secret(Protocol::Two, &theirs).unwrap();
    shared
        .decrypt(bytes(&entries(&reply), 0x02))
        .unwrap()
        .as_slice()
        .try_into()
        .unwrap()
}

#[test]
fn a_uv_token_authorizes_one_registration() {
    let mut authenticator = Authenticator::new(Mock::default());
    let token = token(&mut authenticator, 0x01, Some("github.com"));
    let param = Protocol::Two.authenticate(&token, &[1; 32]);
    let auth = |param: &[u8]| vec![(0x08, Value::Bytes(param.to_vec())), (0x09, Value::from(2))];
    let response = make_credential(&mut authenticator, "github.com", "kristof", auth(&param));
    assert_eq!(
        parse_auth_data(bytes(&entries(&response), 0x02)).flags & (UP | UV),
        UP | UV
    );
    assert_eq!(authenticator.platform().purposes(), [Purpose::Register]);

    let request = cbor::map(
        [
            vec![
                (0x01, Value::Bytes(vec![1; 32])),
                (0x02, cbor::map([("id", Value::from("github.com"))])),
                (0x03, cbor::map([("id", Value::Bytes(b"second".to_vec()))])),
                (
                    0x04,
                    Value::Array(vec![cbor::map([
                        ("alg", Value::from(-7)),
                        ("type", Value::from("public-key")),
                    ])]),
                ),
            ],
            auth(&param),
        ]
        .concat(),
    );
    assert_eq!(
        command(&mut authenticator, 0x01, request),
        Err(Status::PinAuthInvalid.code())
    );
}

#[test]
fn manages_passkeys_with_a_uv_token() {
    let mut authenticator = Authenticator::new(Mock::default());
    resident(&mut authenticator, "github.com", "kristof");
    let gitlab = resident(&mut authenticator, "gitlab.com", "kristof");
    let token = token(&mut authenticator, 0x04, None);
    let manage =
        |authenticator: &mut Authenticator<Mock>, subcommand: u8, parameters: Option<Value>| {
            let mut message = vec![subcommand];
            message.extend(parameters.as_ref().map(cbor::encode).unwrap_or_default());
            let mut body = vec![(0x01, Value::from(subcommand)), (0x03, Value::from(2))];
            body.extend(parameters.map(|parameters| (0x02, parameters)));
            body.push((
                0x04,
                Value::Bytes(Protocol::Two.authenticate(&token, &message)),
            ));
            command(authenticator, 0x0A, cbor::map(body))
        };

    let metadata = manage(&mut authenticator, 0x01, None).unwrap();
    assert_eq!(entries(&metadata).get(0x01), Some(&Value::from(2)));
    let first = manage(&mut authenticator, 0x02, None).unwrap();
    assert_eq!(entries(&first).get(0x05), Some(&Value::from(2)));
    let second = command(
        &mut authenticator,
        0x0A,
        cbor::map([(0x01, Value::from(0x03))]),
    )
    .unwrap();
    assert_eq!(
        bytes(&entries(&second), 0x04),
        Sha256::digest(b"gitlab.com").as_slice()
    );

    let hash = cbor::map([(0x01, Value::Bytes(Sha256::digest(b"gitlab.com").to_vec()))]);
    let listed = manage(&mut authenticator, 0x04, Some(hash)).unwrap();
    assert_eq!(
        bytes(&entries(entries(&listed).required(0x07).unwrap()), "id"),
        gitlab.as_slice()
    );

    let target = cbor::map([(0x02, crate::model::descriptor(&gitlab))]);
    assert_eq!(
        manage(&mut authenticator, 0x06, Some(target)),
        Ok(Value::Null)
    );
    assert_eq!(authenticator.platform().stored.borrow().len(), 1);
}

#[test]
fn derives_hmac_secrets_bound_to_verification() {
    let mut authenticator = Authenticator::new(Mock::default());
    let response = make_credential(
        &mut authenticator,
        "vault.example",
        "me",
        vec![
            (0x06, cbor::map([("hmac-secret", Value::from(true))])),
            (0x07, cbor::map([("rk", Value::from(true))])),
        ],
    );
    let parsed = parse_auth_data(bytes(&entries(&response), 0x02));
    assert_eq!(
        parsed.extensions,
        Some(cbor::map([("hmac-secret", Value::from(true))]))
    );

    let reply = command(
        &mut authenticator,
        0x06,
        cbor::map([(0x01, Value::from(2)), (0x02, Value::from(2))]),
    )
    .unwrap();
    let theirs = PublicKey::from_cose(entries(&reply).required(0x01).unwrap()).unwrap();
    let platform = KeyAgreement::generate();
    let shared = platform.shared_secret(Protocol::Two, &theirs).unwrap();
    let salt = [9u8; 32];
    let salt_enc = shared.encrypt(&salt);
    let extension = cbor::map([
        (
            0x01,
            platform
                .public_key()
                .to_cose(crate::model::ECDH_ES_HKDF_256),
        ),
        (0x02, Value::Bytes(salt_enc.clone())),
        (0x03, Value::Bytes(shared.authenticate(&salt_enc))),
        (0x04, Value::from(2)),
    ]);
    let request = cbor::map([
        (0x01, Value::from("vault.example")),
        (0x02, Value::Bytes(vec![0; 32])),
        (0x04, cbor::map([("hmac-secret", extension)])),
    ]);
    let response = command(&mut authenticator, 0x02, request).unwrap();
    let extensions = parse_auth_data(bytes(&entries(&response), 0x02))
        .extensions
        .unwrap();
    let output = shared
        .decrypt(bytes(&entries(&extensions), "hmac-secret"))
        .unwrap();

    let random = authenticator.platform().stored.borrow()[0]
        .random
        .map(|byte| byte ^ 1);
    assert_eq!(
        output.as_slice(),
        Protocol::Two.authenticate(&random, &salt).as_slice()
    );
}
