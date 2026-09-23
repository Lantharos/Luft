//! PCR-policy unseal using EFI TCG2 SubmitCommand.

use alloc::vec;
use alloc::vec::Vec;

use uefi::boot::{self, SearchType};
use uefi::proto::tcg::v2::Tcg;
use uefi::{Error, Identify, Result};

use super::marshal::{
    build_no_session_cmd, build_session_cmd, response_handles, response_parameter, response_rc,
    write_tpm2b, write_u16, write_u32, TPM2_CC_CONTEXT_LOAD, TPM2_CC_POLICY_PCR,
    TPM2_CC_START_AUTH_SESSION, TPM2_CC_UNSEAL, TPM_ALG_SHA256, TPM_RC_SUCCESS, TPM_SE_SESSION,
};

const DEFAULT_PCRS: &[u32] = &[0, 2, 4, 7];

pub fn try_unseal_sealed_ctx(sealed_ctx: &[u8], _policy_digest: Option<&[u8]>) -> Option<Vec<u8>> {
    let mut tcg = open_tcg()?;
    let sealed_handle = context_load(&mut tcg, sealed_ctx)?;
    let session_handle = start_auth_session(&mut tcg)?;
    policy_pcr(&mut tcg, session_handle, DEFAULT_PCRS)?;
    unseal(&mut tcg, sealed_handle, session_handle)
}

fn open_tcg() -> Option<uefi::boot::ScopedProtocol<Tcg>> {
    let handle = boot::locate_handle_buffer(SearchType::ByProtocol(&Tcg::GUID))
        .ok()?
        .first()
        .copied()?;
    boot::open_protocol_exclusive::<Tcg>(handle).ok()
}

fn submit(tcg: &mut Tcg, cmd: &[u8]) -> Result<Vec<u8>> {
    let mut out = vec![0u8; 4096];
    tcg.submit_command(cmd, &mut out).map_err(|e: Error| e)?;
    let size = u32::from_be_bytes(out[2..6].try_into().unwrap()).min(out.len() as u32) as usize;
    out.truncate(size.max(10));
    Ok(out)
}

fn ensure_rc(resp: &[u8]) -> Option<()> {
    match response_rc(resp) {
        Some(TPM_RC_SUCCESS) => Some(()),
        _ => None,
    }
}

fn context_load(tcg: &mut Tcg, ctx: &[u8]) -> Option<u32> {
    let mut params = Vec::new();
    write_tpm2b(&mut params, ctx);
    let resp = submit(tcg, &build_no_session_cmd(TPM2_CC_CONTEXT_LOAD, &params)).ok()?;
    ensure_rc(&resp)?;
    response_handles(&resp).into_iter().next()
}

fn start_auth_session(tcg: &mut Tcg) -> Option<u32> {
    let mut params = Vec::new();
    write_u32(&mut params, 0x4000_0009);
    write_u32(&mut params, 0x4000_0009);
    write_tpm2b(&mut params, &[]);
    write_tpm2b(&mut params, &[]);
    params.push(TPM_SE_SESSION);
    write_u16(&mut params, 0x0010);
    write_u16(&mut params, 0);
    params.push(0);
    write_u32(&mut params, TPM_ALG_SHA256 as u32);
    let resp = submit(tcg, &build_no_session_cmd(TPM2_CC_START_AUTH_SESSION, &params)).ok()?;
    ensure_rc(&resp)?;
    response_handles(&resp).into_iter().next()
}

fn policy_pcr(tcg: &mut Tcg, session: u32, pcrs: &[u32]) -> Option<()> {
    let mut pcr_select = [0u8; 3];
    for pcr in pcrs {
        if *pcr < 24 {
            pcr_select[(pcr / 8) as usize] |= 1 << (pcr % 8);
        }
    }
    let mut params = Vec::new();
    write_u32(&mut params, 0xffff_ffff);
    write_u32(&mut params, 1);
    write_u16(&mut params, TPM_ALG_SHA256);
    params.push(3);
    params.extend_from_slice(&pcr_select);
    let cmd = build_session_cmd(TPM2_CC_POLICY_PCR, session, session, &params);
    let resp = submit(tcg, &cmd).ok()?;
    ensure_rc(&resp)
}

fn unseal(tcg: &mut Tcg, object: u32, session: u32) -> Option<Vec<u8>> {
    let cmd = build_session_cmd(TPM2_CC_UNSEAL, object, session, &[]);
    let resp = submit(tcg, &cmd).ok()?;
    ensure_rc(&resp)?;
    let param = response_parameter(&resp)?;
    if param.len() < 2 {
        return None;
    }
    let len = u16::from_be_bytes(param[0..2].try_into().ok()?) as usize;
    if param.len() < 2 + len {
        return None;
    }
    Some(param[2..2 + len].to_vec())
}