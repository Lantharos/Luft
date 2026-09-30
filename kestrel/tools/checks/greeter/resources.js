import GLib from 'gi://GLib';

const CLOCK_TICKS = 100;
const IDLE_SAMPLE = 10000;

const read = path => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

function cpuSeconds() {
  const fields = read('/proc/self/stat').split(') ')[1].split(' ');
  return (Number(fields[11]) + Number(fields[12])) / CLOCK_TICKS;
}

function secondsSinceLaunch() {
  const started = Number(read('/proc/self/stat').split(') ')[1].split(' ')[19]) / CLOCK_TICKS;
  return (Number(read('/proc/uptime').split(' ')[0]) - started).toFixed(2);
}

function residentMegabytes(field) {
  return (Number(read('/proc/self/status').match(new RegExp(`${field}:\\s+(\\d+)`))[1]) / 1024).toFixed(1);
}

export async function reportResources({pause, find, visible, require}) {
  console.log(`Kestrel login screen ready: ${secondsSinceLaunch()} s after launch, ${residentMegabytes('VmRSS')} MB resident`);
  await pause(1500);
  require(!visible(find('kestrel-greeter-users')) && !visible(find('kestrel-greeter-controls')),
    'the login screen opens on the clock alone');
  await pause(5000);
  let frames = 0;
  const painted = global.stage.connect('after-paint', () => frames++);
  const cpu = cpuSeconds();
  await pause(IDLE_SAMPLE);
  global.stage.disconnect(painted);
  const usage = (cpuSeconds() - cpu) / (IDLE_SAMPLE / 1000) * 100;
  console.log(`Kestrel login screen idle: ${residentMegabytes('VmRSS')} MB resident (${residentMegabytes('RssAnon')} MB private, ${residentMegabytes('RssFile')} MB mapped files), ${usage.toFixed(2)}% CPU, ${frames} frames in ${IDLE_SAMPLE / 1000} s`);
}
