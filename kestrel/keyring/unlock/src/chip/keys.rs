use luft_keyring_wire::{Problem, TpmKey};
use tss_esapi::constants::tss::{TPM2_RH_NULL, TPM2_ST_HASHCHECK};
use tss_esapi::structures::{Auth, Digest, Public, Signature, SignatureScheme};
use tss_esapi::traits::Marshall;
use tss_esapi::tss2_esys::TPMT_TK_HASHCHECK;

use super::{Chip, failed, problem, templates};

impl Chip {
    pub fn create_key(&mut self, auth: &[u8]) -> Result<TpmKey, Problem> {
        let public = templates::signing_key().map_err(failed)?;
        let auth = Auth::try_from(auth.to_vec()).map_err(failed)?;
        let session = self.hmac_session()?;
        let parent = self.parent;
        let created = self.context.execute_with_session(Some(session), |context| {
            context.create(parent, public, Some(auth), None, None, None)
        });
        self.flush_session(session);
        let created = created.map_err(failed)?;
        let Public::Ecc { unique, .. } = &created.out_public else {
            return Err(Problem::Failed(
                "the security chip made an unexpected key".into(),
            ));
        };
        Ok(TpmKey {
            point: (unique.x().value().to_vec(), unique.y().value().to_vec()),
            public: created.out_public.marshall().map_err(failed)?,
            private: created.out_private.value().to_vec(),
        })
    }

    pub fn sign(
        &mut self,
        key: &TpmKey,
        auth: &[u8],
        digest: &[u8],
    ) -> Result<(Vec<u8>, Vec<u8>), Problem> {
        let object = self.load(&key.public, &key.private).map_err(failed)?;
        let result = self.sign_loaded(object, auth, digest);
        let _ = self.context.flush_context(object.into());
        result
    }

    fn sign_loaded(
        &mut self,
        object: tss_esapi::handles::KeyHandle,
        auth: &[u8],
        digest: &[u8],
    ) -> Result<(Vec<u8>, Vec<u8>), Problem> {
        self.context
            .tr_set_auth(
                object.into(),
                Auth::try_from(auth.to_vec()).map_err(failed)?,
            )
            .map_err(failed)?;
        let digest = Digest::try_from(digest.to_vec()).map_err(failed)?;
        let ticket = TPMT_TK_HASHCHECK {
            tag: TPM2_ST_HASHCHECK,
            hierarchy: TPM2_RH_NULL,
            digest: Default::default(),
        };
        let ticket = ticket.try_into().map_err(failed)?;
        let session = self.hmac_session()?;
        let signature = self.context.execute_with_session(Some(session), |context| {
            context.sign(object, digest, SignatureScheme::Null, ticket)
        });
        self.flush_session(session);
        match signature.map_err(problem)? {
            Signature::EcDsa(signature) => Ok((
                signature.signature_r().value().to_vec(),
                signature.signature_s().value().to_vec(),
            )),
            _ => Err(Problem::Failed(
                "the security chip made an unexpected signature".into(),
            )),
        }
    }
}
