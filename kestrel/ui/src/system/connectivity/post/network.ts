import Gio from 'gi://Gio';
import NM from 'gi://NM';

Gio._promisify(NM.Client, 'new_async');

interface AsyncClient {
  new_async(cancellable: Gio.Cancellable | null): Promise<NM.Client>;
}

const HOME = 'home';

export class NetworkType {
  public = false;
  private client: NM.Client | null = null;
  private watched: NM.RemoteConnection | null = null;
  private watchedId = 0;
  private readonly cancellable = new Gio.Cancellable();

  constructor(private readonly changed: () => void) {
    (NM.Client as unknown as AsyncClient).new_async(this.cancellable).then(client => {
      this.client = client;
      client.connectObject('notify::primary-connection', () => this.sync(), this);
      this.sync();
    }).catch(error => {
      if (!this.cancellable.is_cancelled()) logError(error);
    });
  }

  private sync(): void {
    const connection = this.client?.get_primary_connection()?.get_connection() ?? null;
    if (connection !== this.watched) {
      if (this.watched) this.watched.disconnect(this.watchedId);
      this.watched = connection;
      this.watchedId = connection?.connect('changed', () => this.sync()) ?? 0;
    }
    const isPublic = !!connection && connection.get_setting_connection()?.get_zone() !== HOME;
    if (isPublic === this.public) return;
    this.public = isPublic;
    this.changed();
  }

  destroy(): void {
    this.cancellable.cancel();
    if (this.watched) this.watched.disconnect(this.watchedId);
    this.client?.disconnectObject(this);
  }
}
