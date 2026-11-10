mod identity;

use std::sync::{Arc, LazyLock};

pub use identity::{Identity, fingerprint};
use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::crypto::{CryptoProvider, WebPkiSupportedAlgorithms, verify_tls12_signature, verify_tls13_signature};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::server::danger::{ClientCertVerified, ClientCertVerifier};
use rustls::{
    CertificateError, ClientConfig, DigitallySignedStruct, DistinguishedName, Error, ServerConfig, SignatureScheme,
};

static PROVIDER: LazyLock<Arc<CryptoProvider>> = LazyLock::new(|| Arc::new(rustls::crypto::ring::default_provider()));

fn algorithms() -> &'static WebPkiSupportedAlgorithms {
    &PROVIDER.signature_verification_algorithms
}

pub fn server_config(identity: &Identity) -> Result<Arc<ServerConfig>, Error> {
    let config = ServerConfig::builder_with_provider(PROVIDER.clone())
        .with_safe_default_protocol_versions()?
        .with_client_cert_verifier(Arc::new(AnySelfSignedCertificate))
        .with_single_cert(vec![identity.certificate.clone()], identity.key())?;
    Ok(Arc::new(config))
}

pub fn client_config(identity: &Identity, expected: Option<&str>) -> Result<Arc<ClientConfig>, Error> {
    let config = ClientConfig::builder_with_provider(PROVIDER.clone())
        .with_safe_default_protocol_versions()?
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(Pinned(expected.map(str::to_ascii_uppercase))))
        .with_client_auth_cert(vec![identity.certificate.clone()], identity.key())?;
    Ok(Arc::new(config))
}

#[derive(Debug)]
struct AnySelfSignedCertificate;

impl ClientCertVerifier for AnySelfSignedCertificate {
    fn offer_client_auth(&self) -> bool {
        true
    }

    fn client_auth_mandatory(&self) -> bool {
        false
    }

    fn root_hint_subjects(&self) -> &[DistinguishedName] {
        &[]
    }

    fn verify_client_cert(
        &self,
        _end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _now: UnixTime,
    ) -> Result<ClientCertVerified, Error> {
        Ok(ClientCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        verify_tls12_signature(message, cert, dss, algorithms())
    }

    fn verify_tls13_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        verify_tls13_signature(message, cert, dss, algorithms())
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        algorithms().supported_schemes()
    }
}

#[derive(Debug)]
struct Pinned(Option<String>);

impl ServerCertVerifier for Pinned {
    fn verify_server_cert(
        &self,
        end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &ServerName<'_>,
        _ocsp_response: &[u8],
        _now: UnixTime,
    ) -> Result<ServerCertVerified, Error> {
        match &self.0 {
            Some(expected) if *expected != fingerprint(end_entity) => {
                Err(Error::InvalidCertificate(CertificateError::ApplicationVerificationFailure))
            }
            _ => Ok(ServerCertVerified::assertion()),
        }
    }

    fn verify_tls12_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        verify_tls12_signature(message, cert, dss, algorithms())
    }

    fn verify_tls13_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        verify_tls13_signature(message, cert, dss, algorithms())
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        algorithms().supported_schemes()
    }
}
