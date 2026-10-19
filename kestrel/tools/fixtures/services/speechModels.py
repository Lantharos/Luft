import json
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

port = int(sys.argv[1])
with open(sys.argv[2]) as manifest:
    sizes = {
        f"/{model['id']}/{file['name']}": file["size"]
        for model in json.load(manifest)["models"]
        for file in model["files"]
    }

CHUNK = 64 * 1024
BYTES_PER_SECOND = 2 * 1024 * 1024


class Mirror(BaseHTTPRequestHandler):
    def do_GET(self):
        size = sizes.get(self.path)
        if size is None:
            self.send_error(404)
            return
        start = 0
        wanted = re.fullmatch(r"bytes=(\d+)-", self.headers.get("Range", ""))
        if wanted:
            start = int(wanted.group(1))
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{size - 1}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Length", str(size - start))
        self.end_headers()
        print(f"{self.path} from {start}", flush=True)
        sent = start
        try:
            while sent < size:
                length = min(CHUNK, size - sent)
                self.wfile.write(bytes(length))
                sent += length
                time.sleep(length / BYTES_PER_SECOND)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, *_):
        pass


ThreadingHTTPServer(("127.0.0.1", port), Mirror).serve_forever()
