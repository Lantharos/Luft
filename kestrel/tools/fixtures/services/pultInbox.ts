import Soup from 'gi://Soup?version=3.0';

import { crash, type Crash } from '../../../../web/pult/src/data.js';

const INBOX = /^\/api\/clients\/([^/]+)\/crashes$/;
const LARGEST_BODY = 64 * 1024;

export const STAND_IN_ENVIRONMENT = 'standin';
export const STAND_IN_KEY = 'pultc_standin';

export interface Post {
  status: number;
  raw: string;
  data: Crash | null;
  problems: string[];
}

/** Luft's crash reports inbox on Pult, checking each post against the inbox's own schema. */
export class StandInPultInbox {
  readonly posts: Post[] = [];
  private readonly server = new Soup.Server({});
  private answer: { status: number; retryAfter?: number } = { status: 204 };

  constructor(readonly port: number) {
    this.server.add_handler(null, (_server, message, path) => this.take(message, path));
    this.server.listen_local(port, Soup.ServerListenOptions.IPV4_ONLY);
  }

  get address() {
    return `http://127.0.0.1:${this.port}`;
  }

  /** Answers every post from now on with `status`, and `Retry-After` when given. */
  answerWith(status: number, retryAfter?: number) {
    this.answer = { status, retryAfter };
  }

  get taken(): Crash[] {
    return this.posts.filter(post => post.status === 204 && post.data).map(post => post.data!);
  }

  close() {
    this.server.disconnect();
  }

  private take(message: Soup.ServerMessage, path: string) {
    const headers = message.get_request_headers();
    const bytes = message.get_request_body().flatten().get_data() ?? new Uint8Array();
    const raw = new TextDecoder().decode(bytes);
    const problems: string[] = [];
    if (message.get_method() !== 'POST' || INBOX.exec(path)?.[1] !== STAND_IN_ENVIRONMENT) problems.push(`posted to ${message.get_method()} ${path}`);
    if (headers.get_one('pult-client-key') !== STAND_IN_KEY) problems.push('wrong client key');
    if (!headers.get_one('content-type')?.startsWith('application/json')) problems.push('not sent as JSON');
    if (headers.get_content_length() !== bytes.length || bytes.length > LARGEST_BODY) problems.push(`body of ${bytes.length} bytes with Content-Length ${headers.get_content_length()}`);
    let data: Crash | null = null;
    try {
      const parsed = crash.safeParse((JSON.parse(raw) as { data?: unknown }).data);
      if (parsed.success) data = parsed.data;
      else problems.push(...parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`));
    } catch (error) {
      problems.push(`not JSON: ${error}`);
    }
    const status = problems.length > 0 ? 422 : this.answer.status;
    this.posts.push({ status, raw, data, problems });
    message.set_status(status, null);
    if (status === 429 && this.answer.retryAfter !== undefined)
      message.get_response_headers().append('Retry-After', String(this.answer.retryAfter));
  }
}
