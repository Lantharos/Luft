import Soup from 'gi://Soup?version=3.0';

const ROOT = '/eSCL';
const JOB = `${ROOT}/ScanJobs/1`;

const inputCaps = (dpi: number[]) => `<scan:SettingProfiles><scan:SettingProfile>
<scan:ColorModes><scan:ColorMode>RGB24</scan:ColorMode><scan:ColorMode>Grayscale8</scan:ColorMode></scan:ColorModes>
<scan:DocumentFormats><pwg:DocumentFormat>image/jpeg</pwg:DocumentFormat><scan:DocumentFormatExt>image/jpeg</scan:DocumentFormatExt></scan:DocumentFormats>
<scan:SupportedResolutions><scan:DiscreteResolutions>${dpi.map(each => `<scan:DiscreteResolution><scan:XResolution>${each}</scan:XResolution><scan:YResolution>${each}</scan:YResolution></scan:DiscreteResolution>`).join('')}</scan:DiscreteResolutions></scan:SupportedResolutions>
</scan:SettingProfile></scan:SettingProfiles>`;

const capabilities = (model: string, dpi: number[]) => `<?xml version="1.0" encoding="UTF-8"?>
<scan:ScannerCapabilities xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">
<pwg:Version>2.63</pwg:Version><pwg:MakeAndModel>${model}</pwg:MakeAndModel>
<scan:Platen><scan:PlatenInputCaps><scan:MaxWidth>2550</scan:MaxWidth><scan:MaxHeight>3508</scan:MaxHeight>${inputCaps(dpi)}</scan:PlatenInputCaps></scan:Platen>
<scan:Adf><scan:AdfSimplexInputCaps><scan:MaxWidth>2550</scan:MaxWidth><scan:MaxHeight>3508</scan:MaxHeight>${inputCaps(dpi)}</scan:AdfSimplexInputCaps>
<scan:AdfDuplexInputCaps><scan:MaxWidth>2550</scan:MaxWidth><scan:MaxHeight>3508</scan:MaxHeight>${inputCaps(dpi)}</scan:AdfDuplexInputCaps></scan:Adf>
</scan:ScannerCapabilities>`;

/** An eSCL scanner on this computer that feeds the pages it was given, the way one plugged in over IPP over USB answers. */
export class StandInScanner {
  private readonly server = new Soup.Server({});
  private waiting: Uint8Array[] = [];

  constructor(readonly port: number, private readonly model: string, private readonly pages: Uint8Array[], private readonly dpi: number) {
    this.server.add_handler(null, (_server, message, path) => this.answer(message, path));
    this.server.listen_local(port, Soup.ServerListenOptions.IPV4_ONLY);
  }

  get address() {
    return `http://127.0.0.1:${this.port}${ROOT}`;
  }

  close() {
    this.server.disconnect();
  }

  private answer(message: Soup.ServerMessage, path: string) {
    const method = message.get_method();
    const reply = (status: number, type?: string, body?: Uint8Array) => {
      message.set_status(status, null);
      if (type && body) message.set_response(type, Soup.MemoryUse.COPY, body);
    };
    if (method === 'GET' && path === `${ROOT}/ScannerCapabilities`)
      return reply(200, 'text/xml', new TextEncoder().encode(capabilities(this.model, [this.dpi])));
    if (method === 'POST' && path === `${ROOT}/ScanJobs`) {
      this.waiting = [...this.pages];
      message.get_response_headers().replace('Location', JOB);
      return reply(201);
    }
    if (method === 'GET' && path === `${JOB}/NextDocument`) {
      const page = this.waiting.shift();
      return page ? reply(200, 'image/jpeg', page) : reply(404);
    }
    if (method === 'DELETE' && path === JOB) {
      this.waiting = [];
      return reply(200);
    }
    return reply(404);
  }
}
