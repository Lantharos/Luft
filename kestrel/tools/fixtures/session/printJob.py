import getpass
import os
import socket
import struct
import sys

PRINT_JOB = 0x0002
CHARSET, LANGUAGE, URI, NAME, MIME, INTEGER = 0x47, 0x48, 0x45, 0x42, 0x49, 0x21
OPERATION, END = 0x01, 0x03


def attribute(tag, name, value):
    value = value if isinstance(value, bytes) else value.encode()
    return bytes([tag]) + struct.pack('>H', len(name)) + name.encode() + struct.pack('>H', len(value)) + value


def request(printer, title, pages, document):
    return b''.join([
        struct.pack('>BBHI', 2, 0, PRINT_JOB, 1), bytes([OPERATION]),
        attribute(CHARSET, 'attributes-charset', 'utf-8'),
        attribute(LANGUAGE, 'attributes-natural-language', 'en'),
        attribute(URI, 'printer-uri', f'ipp://localhost/printers/{printer}'),
        attribute(NAME, 'requesting-user-name', getpass.getuser()),
        attribute(NAME, 'job-name', title),
        attribute(INTEGER, 'job-impressions', struct.pack('>i', pages)),
        attribute(MIME, 'document-format', 'application/pdf'),
        bytes([END]), document,
    ])


printer, title, pages, path = sys.argv[1:]
with open(path, 'rb') as file:
    body = request(printer, title, int(pages), file.read())
with socket.socket(socket.AF_UNIX) as connection:
    connection.connect(os.environ['CUPS_SERVER'])
    connection.sendall(b'POST /printers/%s HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/ipp\r\nContent-Length: %d\r\n\r\n' % (printer.encode(), len(body)) + body)
    status = connection.recv(4096).split(b'\r\n', 1)[0]
sys.exit(0 if b' 200 ' in status else 1)
