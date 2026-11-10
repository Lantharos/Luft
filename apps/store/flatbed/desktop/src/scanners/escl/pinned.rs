use std::io::{Read, Write};
use std::sync::{Arc, Mutex};

use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::crypto::{CryptoProvider, verify_tls12_signature, verify_tls13_signature};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::{ClientConfig, ClientConnection, DigitallySignedStruct, SignatureScheme, StreamOwned};
use sha2::{Digest, Sha256};
use ureq::Error;
use ureq::unversioned::transport::{
    Buffers, ConnectionDetails, Connector, Either, LazyBuffers, NextTimeout, Transport,
    TransportAdapter,
};

/// The certificate a scanner is known by. Scanners sign their own, so no
/// authority vouches for them: Flatbed remembers the one a scanner showed
/// first and only talks to whoever shows it again.
#[derive(Clone, Debug, Default)]
pub struct Pin {
    expected: Option<String>,
    shown: Arc<Mutex<Option<String>>>,
}

impl Pin {
    pub fn expecting(expected: Option<String>) -> Self {
        Self {
            expected,
            shown: Arc::default(),
        }
    }

    fn shown(&self) -> Option<String> {
        self.shown.lock().expect("pin lock").clone()
    }

    /// The certificate to remember, when the scanner showed its first one.
    pub fn first(&self) -> Option<String> {
        self.shown().filter(|_| self.expected.is_none())
    }

    pub fn changed(&self) -> bool {
        self.expected.is_some()
            && self
                .shown()
                .is_some_and(|shown| Some(shown) != self.expected)
    }
}

#[derive(Debug)]
struct Pinned {
    pin: Pin,
    provider: Arc<CryptoProvider>,
}

impl ServerCertVerifier for Pinned {
    fn verify_server_cert(
        &self,
        end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &ServerName<'_>,
        _ocsp_response: &[u8],
        _now: UnixTime,
    ) -> Result<ServerCertVerified, rustls::Error> {
        let shown: String = Sha256::digest(end_entity)
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect();
        *self.pin.shown.lock().expect("pin lock") = Some(shown);
        if self.pin.changed() {
            return Err(rustls::Error::General(
                "the scanner's certificate changed".into(),
            ));
        }
        Ok(ServerCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        signed: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        let algorithms = &self.provider.signature_verification_algorithms;
        verify_tls12_signature(message, cert, signed, algorithms)
    }

    fn verify_tls13_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        signed: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        let algorithms = &self.provider.signature_verification_algorithms;
        verify_tls13_signature(message, cert, signed, algorithms)
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        self.provider
            .signature_verification_algorithms
            .supported_schemes()
    }
}

/// Wraps a connection to an `https` scanner in TLS that holds it to `pin`.
#[derive(Debug)]
pub struct PinnedTls {
    config: Arc<ClientConfig>,
}

impl PinnedTls {
    pub fn new(pin: &Pin) -> Self {
        let provider = Arc::new(rustls::crypto::ring::default_provider());
        let config = ClientConfig::builder_with_provider(provider.clone())
            .with_safe_default_protocol_versions()
            .expect("ring supports the default TLS versions")
            .dangerous()
            .with_custom_certificate_verifier(Arc::new(Pinned {
                pin: pin.clone(),
                provider,
            }))
            .with_no_client_auth();
        Self {
            config: Arc::new(config),
        }
    }
}

impl<In: Transport> Connector<In> for PinnedTls {
    type Out = Either<In, PinnedTransport>;

    fn connect(
        &self,
        details: &ConnectionDetails,
        chained: Option<In>,
    ) -> Result<Option<Self::Out>, Error> {
        let Some(transport) = chained else {
            return Ok(None);
        };
        if !details.needs_tls() {
            return Ok(Some(Either::A(transport)));
        }
        let host = details.uri.host().unwrap_or_default();
        let name = ServerName::try_from(host.trim_matches(['[', ']']).to_owned())
            .map_err(|_| Error::Tls("the scanner's address can't be used for TLS"))?;
        let mut conn = ClientConnection::new(self.config.clone(), name)?;
        let mut sock = TransportAdapter::new(transport.boxed());
        sock.set_timeout(details.timeout);
        conn.complete_io(&mut sock)?;
        Ok(Some(Either::B(PinnedTransport {
            buffers: LazyBuffers::new(
                details.config.input_buffer_size(),
                details.config.output_buffer_size(),
            ),
            stream: StreamOwned { conn, sock },
        })))
    }
}

pub struct PinnedTransport {
    buffers: LazyBuffers,
    stream: StreamOwned<ClientConnection, TransportAdapter>,
}

impl std::fmt::Debug for PinnedTransport {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.debug_struct("PinnedTransport").finish()
    }
}

impl Transport for PinnedTransport {
    fn buffers(&mut self) -> &mut dyn Buffers {
        &mut self.buffers
    }

    fn transmit_output(&mut self, amount: usize, timeout: NextTimeout) -> Result<(), Error> {
        self.stream.get_mut().set_timeout(timeout);
        let output = &self.buffers.output()[..amount];
        self.stream.write_all(output)?;
        Ok(())
    }

    fn await_input(&mut self, timeout: NextTimeout) -> Result<bool, Error> {
        self.stream.get_mut().set_timeout(timeout);
        let input = self.buffers.input_append_buf();
        let amount = self.stream.read(input)?;
        self.buffers.input_appended(amount);
        Ok(amount > 0)
    }

    fn is_open(&mut self) -> bool {
        self.stream.get_mut().get_mut().is_open()
    }

    fn is_tls(&self) -> bool {
        true
    }
}
