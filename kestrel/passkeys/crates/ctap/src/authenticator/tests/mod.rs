mod assertion;
mod registration;
mod tokens;

use std::cell::RefCell;
use std::collections::VecDeque;

use ciborium::Value;
use p256::ecdsa::signature::{Signer, Verifier};
use p256::ecdsa::{DerSignature, SigningKey, VerifyingKey};
use p256::elliptic_curve::Generate;
use sha2::{Digest, Sha256};
use zeroize::Zeroizing;

use super::Authenticator;
use crate::cbor::{self, Fields};
use crate::model::{Credential, NewCredential, Protection, PublicKey, RelyingParty, User};
use crate::pin::protocol::{KeyAgreement, Protocol};
use crate::platform::{Consent, Platform, Prompt, Purpose};
use crate::status::{Result, Status};

const SPEC_MAKE_CREDENTIAL: &str = "01a5015820687134968222ec17202e42505f8ed2b16ae22f16bb05b88c25db9e602645f14102a26269646b6578616d706c652e636f6d646e616d656441636d6503a462696458203082019330820138a0030201023082019330820138a0030201023082019330826469636f6e782b68747470733a2f2f706963732e6578616d706c652e636f6d2f30302f702f61426a6a6a707150622e706e67646e616d65766a6f686e70736d697468406578616d706c652e636f6d6b646973706c61794e616d656d4a6f686e20502e20536d6974680482a263616c672664747970656a7075626c69632d6b6579a263616c6739010064747970656a7075626c69632d6b657907a162726bf5";
const SPEC_GET_ASSERTION: &str = "02a4016b6578616d706c652e636f6d025820687134968222ec17202e42505f8ed2b16ae22f16bb05b88c25db9e602645f1410382a26269645840f22006de4f905af68a43942f024f2a5ece603d9c6d4b3df8be08ed01fc442646d034858ac75bed3fd580bf9808d94fcbee82b9b2ef6677af0adcc35852ea6b9e64747970656a7075626c69632d6b6579a26269645832030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030364747970656a7075626c69632d6b657905a1627576f5";
const SPEC_CREDENTIAL_ID: &str = "f22006de4f905af68a43942f024f2a5ece603d9c6d4b3df8be08ed01fc442646d034858ac75bed3fd580bf9808d94fcbee82b9b2ef6677af0adcc35852ea6b9e";
const SPEC_CLIENT_DATA_HASH: &str =
    "687134968222ec17202e42505f8ed2b16ae22f16bb05b88c25db9e602645f141";
const EXAMPLE_COM_HASH: &str = "a379a6f6eeafb9a55e378c118034e2751e682fab9f2d30ab13d2125586ce1947";

const UP: u8 = 0x01;
const UV: u8 = 0x04;
const BACKUP: u8 = 0x08 | 0x10;
const ATTESTED: u8 = 0x40;
const EXTENSIONS: u8 = 0x80;

fn hex(text: &str) -> Vec<u8> {
    (0..text.len())
        .step_by(2)
        .map(|index| u8::from_str_radix(&text[index..index + 2], 16).unwrap())
        .collect()
}

type Seen = (Purpose, Option<String>, Vec<Option<String>>);

struct Stored {
    credential: Credential,
    key: SigningKey,
    counter: u32,
    random: [u8; 32],
}

#[derive(Default)]
struct Mock {
    stored: RefCell<Vec<Stored>>,
    answers: RefCell<VecDeque<Result<Consent>>>,
    prompts: RefCell<Vec<Seen>>,
}

impl Mock {
    fn answer(&self, answer: Result<Consent>) {
        self.answers.borrow_mut().push_back(answer);
    }

    fn insert(
        &self,
        id: Vec<u8>,
        rp_id: &str,
        user: &str,
        discoverable: bool,
        protection: Protection,
    ) {
        let key = SigningKey::generate();
        let public_key = PublicKey::from_p256(&key.verifying_key().into());
        let credential = Credential {
            id,
            rp: RelyingParty {
                id: rp_id.into(),
                name: None,
            },
            user: User {
                id: user.as_bytes().to_vec(),
                name: Some(user.into()),
                display_name: None,
            },
            public_key,
            discoverable,
            protection,
        };
        self.stored.borrow_mut().push(Stored {
            credential,
            key,
            counter: 0,
            random: crate::random(),
        });
    }

    fn verifying_key(&self, id: &[u8]) -> VerifyingKey {
        *self
            .stored
            .borrow()
            .iter()
            .find(|stored| stored.credential.id == id)
            .unwrap()
            .key
            .verifying_key()
    }

    fn purposes(&self) -> Vec<Purpose> {
        self.prompts
            .borrow()
            .iter()
            .map(|(purpose, ..)| *purpose)
            .collect()
    }
}

impl Platform for Mock {
    async fn ask(&self, prompt: Prompt<'_>) -> Result<Consent> {
        let accounts = prompt
            .accounts
            .iter()
            .map(|user| user.name.clone())
            .collect();
        self.prompts
            .borrow_mut()
            .push((prompt.purpose, prompt.rp_id.map(str::to_owned), accounts));
        let default = if prompt.needs_verification() {
            Consent::Verified { account: 0 }
        } else {
            Consent::Confirmed
        };
        self.answers.borrow_mut().pop_front().unwrap_or(Ok(default))
    }

    async fn credentials(&self, rp_id: &str) -> Result<Vec<Credential>> {
        Ok(self
            .stored
            .borrow()
            .iter()
            .map(|stored| stored.credential.clone())
            .filter(|credential| credential.rp.id == rp_id)
            .collect())
    }

    async fn all_credentials(&self) -> Result<Vec<Credential>> {
        Ok(self
            .stored
            .borrow()
            .iter()
            .map(|stored| stored.credential.clone())
            .collect())
    }

    async fn create(&self, request: NewCredential) -> Result<Credential> {
        let id = crate::random::<16>().to_vec();
        let name = request.user.name.clone().unwrap_or_default();
        self.insert(
            id.clone(),
            &request.rp.id,
            &name,
            request.discoverable,
            request.protection,
        );
        let mut stored = self.stored.borrow_mut();
        let last = stored.last_mut().unwrap();
        last.credential.user = request.user;
        last.credential.rp = request.rp;
        Ok(last.credential.clone())
    }

    async fn next_count(&self, id: &[u8]) -> Result<u32> {
        let mut stored = self.stored.borrow_mut();
        let entry = stored
            .iter_mut()
            .find(|stored| stored.credential.id == id)
            .ok_or(Status::NoCredentials)?;
        entry.counter += 1;
        Ok(entry.counter)
    }

    async fn sign(&self, id: &[u8], message: &[u8]) -> Result<Vec<u8>> {
        let stored = self.stored.borrow();
        let entry = stored
            .iter()
            .find(|stored| stored.credential.id == id)
            .ok_or(Status::NoCredentials)?;
        let signature: DerSignature = entry.key.sign(message);
        Ok(signature.as_bytes().to_vec())
    }

    async fn hmac_secret(
        &self,
        id: &[u8],
        verified: bool,
        salts: &[u8],
    ) -> Result<Zeroizing<Vec<u8>>> {
        let stored = self.stored.borrow();
        let entry = stored
            .iter()
            .find(|stored| stored.credential.id == id)
            .ok_or(Status::NoCredentials)?;
        let random = entry.random.map(|byte| byte ^ u8::from(verified));
        Ok(Zeroizing::new(
            salts
                .chunks(32)
                .flat_map(|salt| Protocol::Two.authenticate(&random, salt))
                .collect(),
        ))
    }

    async fn delete(&self, id: &[u8]) -> Result<()> {
        self.stored
            .borrow_mut()
            .retain(|stored| stored.credential.id != id);
        Ok(())
    }

    async fn update_user(&self, id: &[u8], user: User) -> Result<()> {
        let mut stored = self.stored.borrow_mut();
        stored
            .iter_mut()
            .find(|stored| stored.credential.id == id)
            .ok_or(Status::NoCredentials)?
            .credential
            .user = user;
        Ok(())
    }
}

fn send(authenticator: &mut Authenticator<Mock>, request: &[u8]) -> std::result::Result<Value, u8> {
    let reply = pollster::block_on(authenticator.handle(request));
    match reply[0] {
        0 if reply.len() == 1 => Ok(Value::Null),
        0 => Ok(cbor::decode(&reply[1..]).unwrap()),
        status => Err(status),
    }
}

fn command(
    authenticator: &mut Authenticator<Mock>,
    code: u8,
    body: Value,
) -> std::result::Result<Value, u8> {
    send(authenticator, &[vec![code], cbor::encode(&body)].concat())
}

fn entries(value: &Value) -> Fields<'_> {
    Fields::new(value).unwrap()
}

fn bytes<'a>(fields: &Fields<'a>, key: impl Into<Value>) -> &'a [u8] {
    cbor::bytes(fields.required(key).unwrap()).unwrap()
}

struct Parsed {
    flags: u8,
    counter: u32,
    credential_id: Option<Vec<u8>>,
    extensions: Option<Value>,
}

fn parse_auth_data(auth_data: &[u8]) -> Parsed {
    let flags = auth_data[32];
    let counter = u32::from_be_bytes(auth_data[33..37].try_into().unwrap());
    let mut rest = &auth_data[37..];
    let mut credential_id = None;
    if flags & ATTESTED != 0 {
        assert_eq!(&rest[..16], &crate::auth_data::AAGUID);
        let length = usize::from(u16::from_be_bytes([rest[16], rest[17]]));
        credential_id = Some(rest[18..18 + length].to_vec());
        let mut reader = &rest[18 + length..];
        let _: Value = ciborium::from_reader(&mut reader).unwrap();
        rest = reader;
    }
    let extensions = (flags & EXTENSIONS != 0).then(|| cbor::decode(rest).unwrap());
    Parsed {
        flags,
        counter,
        credential_id,
        extensions,
    }
}

fn make_credential(
    authenticator: &mut Authenticator<Mock>,
    rp_id: &str,
    user: &str,
    extra: Vec<(i64, Value)>,
) -> Value {
    let mut body = vec![
        (0x01, Value::Bytes(vec![1; 32])),
        (0x02, cbor::map([("id", Value::from(rp_id))])),
        (
            0x03,
            cbor::map([
                ("id", Value::Bytes(user.as_bytes().to_vec())),
                ("name", Value::from(user)),
            ]),
        ),
        (
            0x04,
            Value::Array(vec![cbor::map([
                ("alg", Value::from(-7)),
                ("type", Value::from("public-key")),
            ])]),
        ),
    ];
    body.extend(extra);
    command(authenticator, 0x01, cbor::map(body)).unwrap()
}

fn resident(authenticator: &mut Authenticator<Mock>, rp_id: &str, user: &str) -> Vec<u8> {
    let response = make_credential(
        authenticator,
        rp_id,
        user,
        vec![(0x07, cbor::map([("rk", Value::from(true))]))],
    );
    parse_auth_data(bytes(&entries(&response), 0x02))
        .credential_id
        .unwrap()
}
