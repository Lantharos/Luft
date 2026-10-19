const DRIVERS: [&str; 6] = ["amdgpu", "radeon", "i915", "xe", "nouveau", "nvidia"];

pub fn is_driver_message(text: &str) -> bool {
    if let Some(rest) = text.strip_prefix("NVRM: ") {
        return nvrm(rest);
    }
    if text.starts_with("nvidia-modeset: ") {
        return true;
    }
    if let Some(rest) = text.strip_prefix("[drm:") {
        return drm_function(rest);
    }
    text.split_once(' ').is_some_and(|(driver, rest)| {
        DRIVERS.contains(&driver) && device(rest).is_some_and(|rest| rest.starts_with(": "))
    })
}

fn nvrm(rest: &str) -> bool {
    let device_then =
        |rest: &str, after: &str| device(rest).is_some_and(|rest| rest.starts_with(after));
    if let Some(rest) = rest.strip_prefix("Xid (PCI:") {
        return device_then(rest, "): ");
    }
    if let Some(rest) = rest.strip_prefix("GPU at PCI:") {
        return device_then(rest, ": ");
    }
    rest.strip_prefix("GPU ")
        .is_some_and(|rest| device_then(rest, ": "))
}

fn drm_function(rest: &str) -> bool {
    let Some((function, rest)) = rest.split_once(" [") else {
        return false;
    };
    let Some((module, rest)) = rest.split_once("]] ") else {
        return false;
    };
    is_identifier(function) && is_identifier(module) && rest.starts_with("*ERROR* ")
}

fn is_identifier(text: &str) -> bool {
    !text.is_empty()
        && text
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'_')
}

fn device(text: &str) -> Option<&str> {
    let rest = hex(text, 4)?.strip_prefix(':')?;
    let rest = hex(rest, 2)?.strip_prefix(':')?;
    let rest = hex(rest, 2)?;
    Some(
        rest.strip_prefix('.')
            .and_then(|function| hex(function, 1))
            .unwrap_or(rest),
    )
}

fn hex(text: &str, length: usize) -> Option<&str> {
    let digits = text.get(..length)?;
    digits
        .bytes()
        .all(|byte| byte.is_ascii_hexdigit())
        .then(|| &text[length..])
}

#[cfg(test)]
mod tests {
    use super::is_driver_message;

    #[test]
    fn recognises_driver_reports() {
        for text in [
            "NVRM: Xid (PCI:0000:01:00): 79, pid='<unknown>', name=<unknown>, GPU has fallen off the bus.",
            "NVRM: GPU 0000:01:00.0: GPU has fallen off the bus.",
            "amdgpu 0000:03:00.0: amdgpu: GPU reset begin!",
            "i915 0000:00:02.0: [drm] GPU HANG: ecode 12:1:85dffffb",
            "[drm:amdgpu_job_timedout [amdgpu]] *ERROR* ring gfx timeout, signaled seq=1, emitted seq=3",
            "nvidia-modeset: ERROR: GPU:0: Idling display engine timed out",
        ] {
            assert!(is_driver_message(text), "{text}");
        }
    }

    #[test]
    fn ignores_process_names_in_kernel_reports() {
        for text in [
            "GPU HANG[4242]: segfault at 0 ip 0000 sp 0000 error 4 in a.out[1000,2000]",
            "xe 0000:00:02.0[4242]: segfault at 0 ip 0000 sp 0000 error 4 in GPU HANG",
            "i915 GPU HANG invoked oom-killer: gfp_mask=0xcc0(GFP_KERNEL), order=0",
            "NVRM: Xid (PCI:[4242]: segfault at 0 ip 0000 sp 0000 error 4",
            "[drm:a [b]] *ER[4242]: segfault at 0 in flip_done timed out",
        ] {
            assert!(!is_driver_message(text), "{text}");
        }
    }
}
