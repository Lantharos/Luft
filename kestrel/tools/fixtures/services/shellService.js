import Gio from 'gi://Gio';
import {programArgs} from 'system';

const [bundle, name] = programArgs;
Gio.Resource.load(bundle)._register();
const {main} = await import(`resource:///${name.replaceAll('.', '/')}/js/main.js`);
await main();
