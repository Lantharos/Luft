mod keys;
mod probe;
mod templates;
#[cfg(test)]
mod tests;

use luft_keyring_wire::{Chip as ChipState, Problem};
use serde::{Deserialize, Serialize};
use sha2::{Digest as _, Sha256};
use tss_esapi::Context;
use tss_esapi::attributes::SessionAttributesBuilder;
use tss_esapi::constants::SessionType;
use tss_esapi::constants::response_code::Tss2ResponseCodeKind;
use tss_esapi::handles::{KeyHandle, SessionHandle};
use tss_esapi::interface_types::algorithm::HashingAlgorithm;
use tss_esapi::interface_types::session_handles::{AuthSession, PolicySession};
use tss_esapi::structures::{
    Auth, Digest, PcrSelectionList, PcrSelectionListBuilder, PcrSlot, Private, Public,
    SensitiveData, SymmetricDefinition,
};
use tss_esapi::traits::{Marshall, UnMarshall};
use zeroize::Zeroizing;

pub const POLICY_PCRS: [u8; 1] = [7];

pub struct Chip {
    context: Context,
    parent: KeyHandle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SealedBlob {
    pub public: Vec<u8>,
    pub private: Vec<u8>,
    pub pin: bool,
    pub pcrs: Vec<u8>,
}

impl Chip {
    pub fn open(tcti: &str) -> Result<Self, ChipState> {
        let (context, parent) = probe::open(tcti)?;
        Ok(Self { context, parent })
    }

    pub fn seal(&mut self, secret: &[u8], pin: Option<&[u8]>) -> Result<SealedBlob, Problem> {
        let policy = self.policy_digest(pin.is_some())?;
        let public = templates::sealed_secret(policy, pin.is_some()).map_err(failed)?;
        let sensitive = SensitiveData::try_from(secret.to_vec()).map_err(failed)?;
        let auth = pin.map(pin_auth).transpose()?;
        let session = self.hmac_session()?;
        let parent = self.parent;
        let created = self.context.execute_with_session(Some(session), |context| {
            context.create(parent, public, auth, Some(sensitive), None, None)
        });
        self.flush_session(session);
        let created = created.map_err(failed)?;
        Ok(SealedBlob {
            public: created.out_public.marshall().map_err(failed)?,
            private: created.out_private.value().to_vec(),
            pin: pin.is_some(),
            pcrs: POLICY_PCRS.to_vec(),
        })
    }

    pub fn unseal(
        &mut self,
        blob: &SealedBlob,
        pin: Option<&[u8]>,
    ) -> Result<Zeroizing<Vec<u8>>, Problem> {
        if blob.pin != pin.is_some() {
            return Err(if blob.pin {
                Problem::WrongPin
            } else {
                Problem::Failed("this seal has no PIN".into())
            });
        }
        let object = self
            .load(&blob.public, &blob.private)
            .map_err(|_| Problem::PolicyChanged)?;
        let result = self.unseal_loaded(object, pin);
        let _ = self.context.flush_context(object.into());
        result
    }

    fn unseal_loaded(
        &mut self,
        object: KeyHandle,
        pin: Option<&[u8]>,
    ) -> Result<Zeroizing<Vec<u8>>, Problem> {
        if let Some(pin) = pin {
            self.context
                .tr_set_auth(object.into(), pin_auth(pin)?)
                .map_err(failed)?;
        }
        let session = self.start_session(SessionType::Policy)?;
        let result = self.satisfy_policy(session, pin.is_some()).and_then(|()| {
            self.context
                .execute_with_session(Some(session), |context| context.unseal(object.into()))
                .map(|data| Zeroizing::new(data.value().to_vec()))
                .map_err(problem)
        });
        self.flush_session(session);
        result
    }

    fn policy_digest(&mut self, pin: bool) -> Result<Digest, Problem> {
        let session = self.start_session(SessionType::Trial)?;
        let digest = self.satisfy_policy(session, pin).and_then(|()| {
            self.context
                .policy_get_digest(policy_session(session)?)
                .map_err(failed)
        });
        self.flush_session(session);
        digest
    }

    fn satisfy_policy(&mut self, session: AuthSession, pin: bool) -> Result<(), Problem> {
        let policy = policy_session(session)?;
        self.context
            .policy_pcr(policy, Digest::default(), pcr_selection()?)
            .map_err(problem)?;
        if pin {
            self.context.policy_auth_value(policy).map_err(failed)?;
        }
        Ok(())
    }

    fn load(&mut self, public: &[u8], private: &[u8]) -> tss_esapi::Result<KeyHandle> {
        let public = Public::unmarshall(public)?;
        let private = Private::try_from(private.to_vec())?;
        let session = self.hmac_session().map_err(|_| {
            tss_esapi::Error::WrapperError(tss_esapi::WrapperErrorKind::MissingAuthSession)
        })?;
        let parent = self.parent;
        let loaded = self.context.execute_with_session(Some(session), |context| {
            context.load(parent, private, public)
        });
        self.flush_session(session);
        loaded
    }

    fn hmac_session(&mut self) -> Result<AuthSession, Problem> {
        self.start_session(SessionType::Hmac)
    }

    fn start_session(&mut self, kind: SessionType) -> Result<AuthSession, Problem> {
        let salt = (kind != SessionType::Trial).then_some(self.parent);
        let session = self
            .context
            .start_auth_session(
                salt,
                None,
                None,
                kind,
                SymmetricDefinition::AES_128_CFB,
                HashingAlgorithm::Sha256,
            )
            .map_err(failed)?
            .ok_or_else(|| Problem::Failed("the security chip didn't start a session".into()))?;
        if kind != SessionType::Trial {
            let (attributes, mask) = SessionAttributesBuilder::new()
                .with_decrypt(true)
                .with_encrypt(true)
                .build();
            self.context
                .tr_sess_set_attributes(session, attributes, mask)
                .map_err(failed)?;
        }
        Ok(session)
    }

    fn flush_session(&mut self, session: AuthSession) {
        let _ = self
            .context
            .flush_context(SessionHandle::from(session).into());
    }
}

fn policy_session(session: AuthSession) -> Result<PolicySession, Problem> {
    PolicySession::try_from(session).map_err(failed)
}

fn pcr_selection() -> Result<PcrSelectionList, Problem> {
    PcrSelectionListBuilder::new()
        .with_selection(HashingAlgorithm::Sha256, &[PcrSlot::Slot7])
        .build()
        .map_err(failed)
}

fn pin_auth(pin: &[u8]) -> Result<Auth, Problem> {
    let mut hasher = Sha256::new();
    hasher.update(b"luft-keyring pin\0");
    hasher.update(pin);
    Auth::try_from(hasher.finalize().to_vec()).map_err(failed)
}

fn problem(error: tss_esapi::Error) -> Problem {
    let tss_esapi::Error::Tss2Error(code) = error else {
        return failed(error);
    };
    match code.kind() {
        Some(Tss2ResponseCodeKind::PolicyFail | Tss2ResponseCodeKind::Value) => {
            Problem::PolicyChanged
        }
        Some(Tss2ResponseCodeKind::AuthFail | Tss2ResponseCodeKind::BadAuth) => Problem::WrongPin,
        Some(Tss2ResponseCodeKind::Lockout) => Problem::LockedOut,
        _ => failed(error),
    }
}

fn failed(error: impl std::fmt::Display) -> Problem {
    Problem::Failed(error.to_string())
}
