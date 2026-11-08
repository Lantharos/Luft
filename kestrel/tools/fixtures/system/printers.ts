import type {Publish} from './bus.js';

const PRINTERS = `<node><interface name="com.lantharos.Printers1">
  <method name="Devices"><arg type="a(sssss)" direction="out"/></method>
  <method name="Drivers"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a(ssb)" direction="out"/></method>
  <method name="Add"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="out"/></method>
  <method name="Remove"><arg type="s" direction="in"/></method>
  <method name="Configure"><arg type="s" direction="in"/><arg type="a{ss}" direction="in"/></method>
</interface></node>`;

const DEVICES = [
  ['usb://Canon/MX490%20series?serial=585EF4&interface=1', 'direct', 'Canon MX490 series', 'Canon MX490 series', 'MFG:Canon;CMD:BJL,BJRaster3,BSCCe;MDL:MX490 series;CLS:PRINTER;'],
  ['dnssd://Brother%20HL-L2350DW%20series._ipp._tcp.local/?uuid=e3248000-80ce-11db-8000-30055c7a2a5f', 'network', 'Brother HL-L2350DW series', 'Brother HL-L2350DW series', 'MFG:Brother;MDL:HL-L2350DW series;'],
];

const DRIVERS = [
  ['gutenprint.5.3://bjc-MX490-series/expert', 'Canon MX490 series - CUPS+Gutenprint v5.3.5', true],
  ['gutenprint.5.3://bjc-MX490-series/simple', 'Canon MX490 series - CUPS+Gutenprint v5.3.5 Simplified', true],
  ['gutenprint.5.3://bjc-PIXMA-MX492/expert', 'Canon PIXMA MX492 - CUPS+Gutenprint v5.3.5', false],
  ['gutenprint.5.3://bjc-PIXMA-MX922/expert', 'Canon PIXMA MX922 - CUPS+Gutenprint v5.3.5', false],
];

export const PRINTERS_NAME = 'com.lantharos.Printers1';

export function publishPrinters(publish: Publish, calls: string[]) {
  publish(PRINTERS, {
    Devices: () => DEVICES,
    Drivers: () => DRIVERS,
    Add(device: string, driver: string, info: string) {
      calls.push(`AddPrinter ${device} ${driver}`);
      return info.replace(/[^A-Za-z0-9]+/g, '_');
    },
    Remove(name: string) {
      calls.push(`RemovePrinter ${name}`);
    },
    Configure(name: string, options: Record<string, string>) {
      calls.push(`ConfigurePrinter ${name} ${Object.entries(options).map(([key, value]) => `${key}=${value}`).join(' ')}`);
    },
  }, '/com/lantharos/Printers1');
}
