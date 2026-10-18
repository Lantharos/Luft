import base64
import json
import pathlib
import struct
import subprocess
import sys
import tempfile

MEASURED = {
    ".linux", ".osrel", ".cmdline", ".initrd", ".ucode", ".splash", ".dtb", ".dtbauto",
    ".hwids", ".efifw", ".uname", ".sbat", ".pcrpkey", ".profile",
}
SIGNED_PHASE = "enter-initrd"


def sections(image):
    header = struct.unpack_from("<I", image, 0x3C)[0]
    count = struct.unpack_from("<H", image, header + 6)[0]
    table = header + 24 + struct.unpack_from("<H", image, header + 20)[0]
    for index in range(count):
        name, size, _, raw_size, offset = struct.unpack_from("<8sIIII", image, table + 40 * index)
        yield name.rstrip(b"\0").decode(), image[offset:offset + min(size, raw_size)]


def main_profile(image):
    base, profile, profiles = {}, {}, 0
    for name, data in sections(image):
        if name == ".profile":
            profiles += 1
        if profiles > 1:
            break
        (profile if profiles else base)[name] = data
    return base | profile


def predicted(measured, work, policyref):
    arguments = []
    for name, data in measured.items():
        path = work / name.lstrip(".")
        path.write_bytes(data)
        arguments.append(f"--{name.lstrip('.')}={path}")
    if policyref:
        arguments.append(f"--policyref={policyref}")
    report = subprocess.run(
        ["/usr/lib/systemd/systemd-measure", "policy-digest", "--json=short", "--bank=sha256",
         f"--phase={SIGNED_PHASE}", *arguments],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(report)["sha256"][0]


def verified(public_key, signed, signature, work):
    (work / "signed").write_bytes(bytes.fromhex(signed))
    (work / "signature").write_bytes(base64.b64decode(signature))
    return subprocess.run(
        ["openssl", "dgst", "-sha256", "-verify", public_key, "-signature", work / "signature",
         work / "signed"],
        capture_output=True,
    ).returncode == 0


def problems(uki, public_key):
    profile = main_profile(pathlib.Path(uki).read_bytes())
    if profile.get(".pcrpkey") != pathlib.Path(public_key).read_bytes():
        yield "its .pcrpkey isn't the PCR policy key the system enrolls with"
    signatures = json.loads(profile.get(".pcrsig", b"{}")).get("sha256", [])
    if not signatures:
        yield "it has no PCR 11 signature for the sha256 bank"
    measured = {name: data for name, data in profile.items() if name in MEASURED}
    with tempfile.TemporaryDirectory() as work:
        for signature in signatures:
            expected = predicted(measured, pathlib.Path(work), signature.get("ref"))
            if signature["pol"] != expected["pol"]:
                yield f"its {signature.get('ref', 'plain')} signature is for another PCR 11 than its own sections"
            elif not verified(public_key, expected["tbs"], signature["sig"], pathlib.Path(work)):
                yield f"its {signature.get('ref', 'plain')} signature doesn't verify with the PCR policy key"


found = list(problems(*sys.argv[1:]))
for problem in found:
    print(f"{sys.argv[1]} wouldn't unlock a disk with the TPM: {problem}", file=sys.stderr)
sys.exit(1 if found else 0)
