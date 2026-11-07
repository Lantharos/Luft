import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

Gio._promisify(Soup.Session.prototype, 'send_and_read_async');

const PIGEON = 'https://127.0.0.1:53317/api/localsend/v2';
const API = '/api/localsend/v2';
export const PHONE = 'Noor’s phone';
export const PHONE_PIN = '2468';

export type Mode = 'accept' | 'decline' | 'pin';

export interface FileOffer {
  id: string;
  fileName: string;
  size: number;
  fileType: string;
  preview?: string;
}

export interface Answer {
  status: number;
  json: <T>() => T;
}

const encoder = new TextEncoder();

/**
 * A phone with LocalSend on the network, as Pigeon sees one: it answers like LocalSend's app when Pigeon sends to
 * it, and sends to Pigeon over HTTPS with a certificate of its own, which proves who it is.
 */
export class Phone {
  mode: Mode = 'accept';
  readonly offers: {files: Record<string, FileOffer>; pin: string | null}[] = [];
  readonly uploads = new Map<string, Uint8Array>();
  private readonly server = new Soup.Server({});
  private readonly session = new Soup.Session({timeout: 120});
  private registering = 0;

  constructor(private readonly port: number, private readonly certificate: Gio.TlsCertificate) {
    this.server.add_handler(`${API}/info`, (_server, message) => this.reply(message, 200, this.info()));
    this.server.add_handler(`${API}/register`, (_server, message) => this.reply(message, 200, this.info()));
    this.server.add_handler(`${API}/prepare-upload`, (_server, message, _path, query) => this.prepare(message, query?.pin ?? null));
    this.server.add_handler(`${API}/upload`, (_server, message, _path, query) => {
      this.uploads.set(query!.fileId!, message.get_request_body().flatten().toArray());
      this.reply(message, 200);
    });
    this.server.listen_local(port, Soup.ServerListenOptions.IPV4_ONLY);
  }

  info() {
    return {alias: PHONE, version: '2.1', deviceModel: 'Pixel 9', deviceType: 'mobile', fingerprint: this.fingerprint, port: this.port, protocol: 'http'};
  }

  get fingerprint(): string {
    return GLib.compute_checksum_for_data(GLib.ChecksumType.SHA256, this.certificate.certificate!)!.toUpperCase();
  }

  /** Keeps telling Pigeon the phone is there, as LocalSend's app does when it answers an announcement. */
  stayNearby() {
    this.registering = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 700, () => {
      void this.post('register', this.info()).catch(() => {});
      return GLib.SOURCE_CONTINUE;
    });
  }

  /** Offers files or text to Pigeon, and resolves to its answer once someone decided. */
  offer(files: FileOffer[], pin?: string): Promise<Answer> {
    const route = pin ? `prepare-upload?pin=${pin}` : 'prepare-upload';
    return this.post(route, {info: this.info(), files: Object.fromEntries(files.map(file => [file.id, file]))});
  }

  upload(session: string, file: string, token: string, contents: Uint8Array): Promise<Answer> {
    return this.post(`upload?sessionId=${session}&fileId=${file}&token=${token}`, contents);
  }

  cancel(session: string): Promise<Answer> {
    return this.post(`cancel?sessionId=${session}`, new Uint8Array());
  }

  async post(route: string, body: object | Uint8Array): Promise<Answer> {
    const message = Soup.Message.new('POST', `${PIGEON}/${route}`);
    message.connect('accept-certificate', () => true);
    message.set_tls_client_certificate(this.certificate);
    const json = !(body instanceof Uint8Array);
    message.set_request_body_from_bytes(json ? 'application/json' : 'application/octet-stream',
      new GLib.Bytes(json ? encoder.encode(JSON.stringify(body)) : body));
    const reply = await this.session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null);
    const text = new TextDecoder().decode(reply.toArray());
    return {status: message.get_status(), json: <T>() => JSON.parse(text) as T};
  }

  stop() {
    if (this.registering) GLib.source_remove(this.registering);
    this.server.disconnect();
    this.session.abort();
  }

  private prepare(message: Soup.ServerMessage, pin: string | null) {
    const offer = JSON.parse(new TextDecoder().decode(message.get_request_body().flatten().toArray())) as {files: Record<string, FileOffer>};
    this.offers.push({files: offer.files, pin});
    if (this.mode === 'decline') return this.reply(message, 403);
    if (this.mode === 'pin' && pin !== PHONE_PIN) return this.reply(message, 401);
    const files = Object.values(offer.files);
    if (files.length === 1 && files[0]!.preview !== undefined && files[0]!.fileType.startsWith('text/')) return this.reply(message, 204);
    this.reply(message, 200, {sessionId: 'phone-session', files: Object.fromEntries(files.map(file => [file.id, `token-${file.id}`]))});
  }

  private reply(message: Soup.ServerMessage, status: number, body?: object) {
    message.set_status(status, null);
    if (body) message.set_response('application/json', Soup.MemoryUse.COPY, encoder.encode(JSON.stringify(body)));
  }
}

/** A certificate made for the check, as LocalSend's apps make one for themselves. */
export function certificate(folder: string): Gio.TlsCertificate {
  const key = GLib.build_filenamev([folder, 'phone-key.pem']);
  const cert = GLib.build_filenamev([folder, 'phone-cert.pem']);
  GLib.mkdir_with_parents(folder, 0o700);
  GLib.spawn_command_line_sync(`openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -subj /CN=Phone -days 2 -keyout ${key} -out ${cert}`);
  return Gio.TlsCertificate.new_from_files(cert, key);
}
