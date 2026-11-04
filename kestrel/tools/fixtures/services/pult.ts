import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

const TOKEN = 'pult_device_standin';
const CODE = 'BCDF-GHJK';

const place = (base: string, project: string, environment: string) => ({
  organization: {slug: 'harbor', name: 'Harbor'},
  project: {slug: project.toLowerCase(), name: project},
  environment: {id: `${project}-${environment}`.toLowerCase(), name: environment},
  url: `${base}/harbor/${project.toLowerCase()}/${environment}`,
});

/** Pult's console API for desktop apps, as far as the Pult extension uses it, with a sign-in someone confirms by calling `approve`. */
export class StandInPult {
  readonly requests: string[] = [];
  private readonly server = new Soup.Server({});
  private approved = false;
  private signedIn = false;

  constructor(readonly port: number) {
    this.server.add_handler(null, (_server, message, path) => this.answer(message, path));
    this.server.listen_local(port, Soup.ServerListenOptions.IPV4_ONLY);
  }

  get base() {
    return `http://127.0.0.1:${this.port}`;
  }

  approve() {
    this.approved = true;
  }

  get authorized() {
    return this.signedIn;
  }

  close() {
    this.server.disconnect();
  }

  private answer(message: Soup.ServerMessage, path: string) {
    const method = message.get_method();
    this.requests.push(`${method} ${path}`);
    const authorized = message.get_request_headers().get_one('authorization') === `Bearer ${TOKEN}` && this.signedIn;
    const reply = (status: number, body?: unknown) => {
      message.set_status(status, null);
      if (body !== undefined) message.set_response('application/json', Soup.MemoryUse.COPY, new TextEncoder().encode(JSON.stringify(body)));
    };
    if (method === 'POST' && path === '/api/devices/code')
      return reply(200, {deviceCode: 'device', userCode: CODE, verificationUri: `${this.base}/device`, verificationUriComplete: `${this.base}/device?code=${CODE}`, expiresIn: 900, interval: 1});
    if (method === 'POST' && path === '/api/devices/token') {
      if (!this.approved) return reply(202, {status: 'pending'});
      this.signedIn = true;
      return reply(200, {token: TOKEN, user: {name: 'Mara Lindqvist', email: 'mara@harbor.test'}});
    }
    if (!authorized) return reply(401, {error: 'Sign in first'});
    if (method === 'DELETE' && path === '/api/devices/current') {
      this.signedIn = false;
      this.approved = false;
      return reply(204);
    }
    if (path === '/api/me/waiting') return reply(200, {places: this.places()});
    if (path === '/api/me/find') {
      const query = GLib.Uri.unescape_string(message.get_uri().get_query() ?? '', null) ?? '';
      const items = this.places().flatMap(entry => entry.urgent.map(item => ({...item, place: entry}))).filter(item => item.title.toLowerCase().includes(query.replace('q=', '')));
      return reply(200, {items});
    }
    return reply(404, {error: 'Not found'});
  }

  private places() {
    const shop = place(this.base, 'Shop', 'production');
    const app = place(this.base, 'Marl', 'production');
    return [
      {
        ...shop,
        inboxes: [
          {name: 'support', label: 'Support', open: 4, unread: 2, urgent: 1, url: `${shop.url}/inbox/support`},
          {name: 'refunds', label: 'Refunds', open: 2, unread: 1, urgent: 0, url: `${shop.url}/inbox/refunds`},
        ],
        urgent: [{
          id: 'it_1', title: 'Refund failed for order 4821', inbox: 'support', inboxLabel: 'Support', state: 'open', urgent: true,
          updatedAt: Date.now(), url: `${shop.url}/item/it_1`,
        }],
      },
      {...app, inboxes: [{name: 'crashes', label: 'Crashes', open: 3, unread: 3, urgent: 0, url: `${app.url}/inbox/crashes`}], urgent: []},
    ];
  }
}
