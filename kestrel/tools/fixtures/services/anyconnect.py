import http.server
import ssl
import sys

FORM = '''<?xml version="1.0" encoding="UTF-8"?>
<config-auth client="vpn" type="auth-request">
<auth id="main"><message>Use your Example account.</message>{error}
<form method="post" action="/auth">
<input type="text" name="username" label="Username:" />
<input type="password" name="password" label="Password:" />
</form></auth></config-auth>'''
WELCOME = b'''<?xml version="1.0" encoding="UTF-8"?>
<config-auth client="vpn" type="complete"><session-token>check-cookie</session-token>
<auth id="success"><message>Welcome</message></auth></config-auth>'''


class Gateway(http.server.BaseHTTPRequestHandler):
    def log_message(self, *arguments):
        pass

    def reply(self, body, cookie=None):
        self.send_response(200)
        self.send_header('Content-Type', 'text/xml')
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        if b'<password>hunter2</password>' in body:
            self.reply(WELCOME, 'webvpn=check-cookie; path=/; secure')
        else:
            error = '<error id="88" param1="" param2="">Login failed.</error>' if b'<password>' in body else ''
            self.reply(FORM.format(error=error).encode())


port, certificate, key = sys.argv[1:4]
server = http.server.HTTPServer(('127.0.0.1', int(port)), Gateway)
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certificate, key)
server.socket = context.wrap_socket(server.socket, server_side=True)
print('ready', flush=True)
server.serve_forever()
