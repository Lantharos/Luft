//! Big-endian TPM 2.0 command/response helpers.

use alloc::vec::Vec;

pub const TPM_ST_NO_SESSIONS: u16 = 0x8001;
pub const TPM_ST_SESSIONS: u16 = 0x8002;
pub const TPM_RC_SUCCESS: u32 = 0;

pub const TPM2_CC_CONTEXT_LOAD: u32 = 0x0000_0161;
pub const TPM2_CC_START_AUTH_SESSION: u32 = 0x0000_0176;
pub const TPM2_CC_POLICY_PCR: u32 = 0x0000_017F;
pub const TPM2_CC_UNSEAL: u32 = 0x0000_015E;

pub const TPM_ALG_SHA256: u16 = 0x000B;
pub const TPM_SE_SESSION: u8 = 0x00;

pub fn write_u16(buf: &mut Vec<u8>, v: u16) {
    buf.extend_from_slice(&v.to_be_bytes());
}

pub fn write_u32(buf: &mut Vec<u8>, v: u32) {
    buf.extend_from_slice(&v.to_be_bytes());
}

pub fn write_tpm2b(buf: &mut Vec<u8>, data: &[u8]) {
    let len: u16 = data.len().try_into().unwrap_or(0);
    write_u16(buf, len);
    buf.extend_from_slice(data);
}

pub fn build_no_session_cmd(command: u32, params: &[u8]) -> Vec<u8> {
    let size = 10 + params.len();
    let mut out = Vec::with_capacity(size);
    write_u16(&mut out, TPM_ST_NO_SESSIONS);
    write_u32(&mut out, size as u32);
    write_u32(&mut out, command);
    out.extend_from_slice(params);
    out
}

/// Build a one-session authorized TPM command.
pub fn build_session_cmd(command: u32, handle: u32, session: u32, params: &[u8]) -> Vec<u8> {
    let mut handles = Vec::new();
    write_u32(&mut handles, 1);
    write_u32(&mut handles, handle);

    let mut auth = Vec::new();
    write_u32(&mut auth, 9);
    write_u32(&mut auth, session);
    write_u16(&mut auth, 0);
    auth.push(0x01); // continueSession
    write_u16(&mut auth, 0);

    let size = 10 + handles.len() + auth.len() + params.len();
    let mut out = Vec::with_capacity(size);
    write_u16(&mut out, TPM_ST_SESSIONS);
    write_u32(&mut out, size as u32);
    write_u32(&mut out, command);
    out.extend_from_slice(&handles);
    out.extend_from_slice(&auth);
    out.extend_from_slice(params);
    out
}

pub fn response_rc(response: &[u8]) -> Option<u32> {
    if response.len() < 10 {
        return None;
    }
    Some(u32::from_be_bytes(response[6..10].try_into().ok()?))
}

pub fn response_handles(response: &[u8]) -> Vec<u32> {
    if response.len() < 14 {
        return Vec::new();
    }
    let count = response
        .get(10..14)
        .and_then(|s| <[u8; 4]>::try_from(s).ok())
        .map(u32::from_be_bytes)
        .unwrap_or(0) as usize;
    (0..count)
        .filter_map(|i| {
            let start = 14 + i * 4;
            let bytes: [u8; 4] = response.get(start..start + 4)?.try_into().ok()?;
            Some(u32::from_be_bytes(bytes))
        })
        .collect()
}

pub fn response_parameter(response: &[u8]) -> Option<&[u8]> {
    if response.len() < 14 {
        return None;
    }
    let count = u32::from_be_bytes(response[10..14].try_into().ok()?) as usize;
    let mut offset = 14 + count * 4;
    if offset + 4 > response.len() {
        return None;
    }
    let auth_size = u32::from_be_bytes(response[offset..offset + 4].try_into().ok()?) as usize;
    offset += 4 + auth_size;
    if offset + 2 > response.len() {
        return None;
    }
    let param_size = u16::from_be_bytes(response[offset..offset + 2].try_into().ok()?) as usize;
    offset += 2;
    if offset + param_size > response.len() {
        return None;
    }
    Some(&response[offset..offset + param_size])
}