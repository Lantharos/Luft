#!/usr/bin/env python3
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RESULTS = Path(sys.argv[1])


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/results":
            return super().do_GET()
        body = RESULTS.read_bytes() if RESULTS.exists() else b""
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        with RESULTS.open("ab") as results:
            results.write(body + b"\n")
        self.send_response(204)
        self.end_headers()


ThreadingHTTPServer(
    ("127.0.0.1", 8000), lambda *arguments: Handler(*arguments, directory=str(Path(__file__).parent))
).serve_forever()
