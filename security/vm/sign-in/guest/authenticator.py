#!/usr/bin/python3
"""A FIDO2 security key in software, on /dev/uhid, for sign-in checks: CTAP 2.0 with
PIN protocol 1 and hmac-secret, touched at once. It keeps its secrets in STATE."""
import json
import os
import struct
import sys
from hashlib import sha256
from hmac import new as hmac

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

STATE = sys.argv[1] if len(sys.argv) > 1 else "/var/lib/sign-in-check/key.json"
UHID_CREATE2, UHID_OUTPUT, UHID_INPUT2 = 11, 6, 12
EVENT_SIZE = 4380
REPORT = 64
DESCRIPTOR = bytes.fromhex("06d0f10901a1010920150026ff007508954081020921150026ff00750895409102c0")
AAGUID = bytes(16)
OK, INVALID_CBOR, NO_CREDENTIALS, PIN_INVALID, PIN_BLOCKED, PIN_AUTH_INVALID, PIN_NOT_SET, PIN_REQUIRED = 0, 0x12, 0x2E, 0x31, 0x32, 0x33, 0x35, 0x36
UP, UV, AT, ED = 0x01, 0x04, 0x40, 0x80


def encode(value):
    def head(major, length):
        if length < 24:
            return bytes([major << 5 | length])
        for size, code in ((1, 24), (2, 25), (4, 26), (8, 27)):
            if length < 1 << (8 * size):
                return bytes([major << 5 | code]) + length.to_bytes(size, "big")
        raise ValueError(length)

    if isinstance(value, bool):
        return bytes([0xF5 if value else 0xF4])
    if isinstance(value, int):
        return head(0, value) if value >= 0 else head(1, -1 - value)
    if isinstance(value, bytes):
        return head(2, len(value)) + value
    if isinstance(value, str):
        data = value.encode()
        return head(3, len(data)) + data
    if isinstance(value, list):
        return head(4, len(value)) + b"".join(encode(item) for item in value)
    if isinstance(value, dict):
        items = sorted((encode(key), encode(item)) for key, item in value.items())
        items.sort(key=lambda pair: (len(pair[0]), pair[0]))
        return head(5, len(items)) + b"".join(key + item for key, item in items)
    raise TypeError(value)


def decode(data, at=0):
    first = data[at]
    major, info = first >> 5, first & 31
    at += 1
    if info < 24:
        length = info
    else:
        size = {24: 1, 25: 2, 26: 4, 27: 8}[info]
        length = int.from_bytes(data[at:at + size], "big")
        at += size
    if major == 0:
        return length, at
    if major == 1:
        return -1 - length, at
    if major == 2:
        return bytes(data[at:at + length]), at + length
    if major == 3:
        return data[at:at + length].decode(), at + length
    if major == 4:
        items = []
        for _ in range(length):
            item, at = decode(data, at)
            items.append(item)
        return items, at
    if major == 5:
        found = {}
        for _ in range(length):
            key, at = decode(data, at)
            found[key], at = decode(data, at)
        return found, at
    if major == 7:
        return {20: False, 21: True}[info], at
    raise ValueError(first)


def aes(key, data, decrypt=False):
    cipher = Cipher(algorithms.AES(key), modes.CBC(bytes(16)))
    worker = cipher.decryptor() if decrypt else cipher.encryptor()
    return worker.update(data) + worker.finalize()


def cose(public):
    numbers = public.public_numbers()
    return {1: 2, 3: -25, -1: 1, -2: numbers.x.to_bytes(32, "big"), -3: numbers.y.to_bytes(32, "big")}


def point(key):
    numbers = ec.EllipticCurvePublicNumbers(int.from_bytes(key[-2], "big"), int.from_bytes(key[-3], "big"), ec.SECP256R1())
    return numbers.public_key()


class Key:
    def __init__(self):
        self.agreement = ec.generate_private_key(ec.SECP256R1())
        self.token = os.urandom(32)
        self.state = {"pin": None, "retries": 8, "credentials": {}}
        if os.path.exists(STATE):
            with open(STATE) as saved:
                self.state = json.load(saved)

    def save(self):
        os.makedirs(os.path.dirname(STATE), exist_ok=True)
        with open(STATE, "w") as saved:
            json.dump(self.state, saved)

    def shared(self, platform):
        return sha256(self.agreement.exchange(ec.ECDH(), point(platform))).digest()

    def info(self, _):
        return OK, {1: ["FIDO_2_0"], 2: ["hmac-secret"], 3: AAGUID,
                    4: {"rk": False, "up": True, "plat": False, "clientPin": self.state["pin"] is not None},
                    5: 1200, 6: [1]}

    def client_pin(self, request):
        command = request[2]
        if command == 1:
            return OK, {3: self.state["retries"]}
        if command == 2:
            return OK, {1: cose(self.agreement.public_key())}
        shared = self.shared(request[3])
        if command == 3:
            if self.state["pin"] is not None:
                return PIN_AUTH_INVALID, None
            if hmac(shared, request[5], "sha256").digest()[:16] != request[4]:
                return PIN_AUTH_INVALID, None
            pin = aes(shared, request[5], decrypt=True).rstrip(b"\0")
            self.state["pin"] = sha256(pin).hexdigest()[:32]
            self.save()
            return OK, None
        if command == 5:
            if self.state["pin"] is None:
                return PIN_NOT_SET, None
            if self.state["retries"] == 0:
                return PIN_BLOCKED, None
            if aes(shared, request[6], decrypt=True).hex() != self.state["pin"]:
                self.state["retries"] -= 1
                self.save()
                return PIN_INVALID, None
            self.state["retries"] = 8
            self.save()
            return OK, {2: aes(shared, self.token)}
        return INVALID_CBOR, None

    def make_credential(self, request):
        if self.state["pin"] is not None and 8 not in request:
            return PIN_REQUIRED, None
        if 8 in request and hmac(self.token, request[1], "sha256").digest()[:16] != request[8]:
            return PIN_AUTH_INVALID, None
        private = ec.generate_private_key(ec.SECP256R1())
        credential = os.urandom(32)
        self.state["credentials"][credential.hex()] = {
            "key": private.private_numbers().private_value.to_bytes(32, "big").hex(),
            "uv": os.urandom(32).hex(), "plain": os.urandom(32).hex(), "rp": request[2]["id"]}
        self.save()
        public = cose(private.public_key()) | {3: -7}
        flags = UP | AT | ED | (UV if 8 in request else 0)
        attested = AAGUID + len(credential).to_bytes(2, "big") + credential + encode(public)
        data = sha256(request[2]["id"].encode()).digest() + bytes([flags]) + bytes(4) + attested + encode({"hmac-secret": True})
        return OK, {1: "none", 2: data, 3: {}}

    def get_assertion(self, request):
        for allowed in request.get(3, []):
            stored = self.state["credentials"].get(allowed["id"].hex())
            if stored and stored["rp"] == request[1]:
                break
        else:
            return NO_CREDENTIALS, None
        verified = 6 in request
        if verified and hmac(self.token, request[2], "sha256").digest()[:16] != request[6]:
            return PIN_AUTH_INVALID, None
        present = request.get(5, {}).get("up", True)
        flags = (UP if present else 0) | (UV if verified else 0)
        extensions = {}
        asked = request.get(4, {}).get("hmac-secret")
        if asked:
            shared = self.shared(asked[1])
            if hmac(shared, asked[2], "sha256").digest()[:16] != asked[3]:
                return INVALID_CBOR, None
            salt = aes(shared, asked[2], decrypt=True)
            random = bytes.fromhex(stored["uv" if verified else "plain"])
            output = b"".join(hmac(random, salt[at:at + 32], "sha256").digest() for at in range(0, len(salt), 32))
            extensions["hmac-secret"] = aes(shared, output)
        if extensions:
            flags |= ED
        data = sha256(request[1].encode()).digest() + bytes([flags]) + (1).to_bytes(4, "big") + (encode(extensions) if extensions else b"")
        private = ec.derive_private_key(int(stored["key"], 16), ec.SECP256R1())
        signature = private.sign(data + request[2], ec.ECDSA(hashes.SHA256()))
        return OK, {1: {"id": allowed["id"], "type": "public-key"}, 2: data, 3: signature}

    def answer(self, payload):
        handlers = {0x01: self.make_credential, 0x02: self.get_assertion, 0x04: self.info, 0x06: self.client_pin}
        handler = handlers.get(payload[0])
        if handler is None:
            return bytes([0x01])
        request = decode(payload, 1)[0] if len(payload) > 1 else {}
        status, response = handler(request)
        return bytes([status]) + (encode(response) if response is not None else b"")


def frames(channel, command, data):
    first = struct.pack(">IBH", channel, command, len(data)) + data[:57]
    yield first.ljust(REPORT, b"\0")
    rest, sequence = data[57:], 0
    while rest:
        yield (struct.pack(">IB", channel, sequence) + rest[:59]).ljust(REPORT, b"\0")
        rest, sequence = rest[59:], sequence + 1


def main():
    key = Key()
    uhid = os.open("/dev/uhid", os.O_RDWR)
    create = struct.pack("<I128s64s64sHHIIII", UHID_CREATE2, b"Luft check key", b"", b"", len(DESCRIPTOR), 0x03, 0x1209, 0x4C55, 1, 0)
    os.write(uhid, (create + DESCRIPTOR).ljust(EVENT_SIZE, b"\0"))
    channels = 0
    pending = {}

    def send(channel, command, data):
        for frame in frames(channel, command, data):
            os.write(uhid, struct.pack("<IH", UHID_INPUT2, REPORT).ljust(6, b"\0")[:6] + frame + bytes(EVENT_SIZE - 6 - REPORT))

    while True:
        event = os.read(uhid, EVENT_SIZE)
        if struct.unpack_from("<I", event)[0] != UHID_OUTPUT:
            continue
        size = struct.unpack_from("<H", event, 4 + 4096)[0]
        report = event[4:4 + size]
        if len(report) == REPORT + 1:
            report = report[1:]
        channel = struct.unpack_from(">I", report)[0]
        if report[4] & 0x80:
            command, length = report[4], struct.unpack_from(">H", report, 5)[0]
            pending[channel] = [command, length, bytearray(report[7:7 + length])]
        elif channel in pending:
            pending[channel][2] += report[5:5 + pending[channel][1] - len(pending[channel][2])]
        else:
            continue
        command, length, data = pending[channel]
        if len(data) < length:
            continue
        del pending[channel]
        if command == 0x86:
            channels += 1
            send(channel, 0x86, bytes(data[:8]) + struct.pack(">I", channels) + bytes([2, 1, 0, 0, 0x04 | 0x08]))
        elif command == 0x90:
            send(channel, 0x90, key.answer(bytes(data)))
        elif command == 0x81:
            send(channel, 0x81, bytes(data))
        elif command != 0x91:
            send(channel, 0xBF, bytes([0x01]))


main()
