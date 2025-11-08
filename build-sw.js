import { injectManifest } from 'workbox-build';
import workboxConfig from './workbox-config.js';

async function build() {
  try {
    const { count, size } = await injectManifest(workboxConfig);
    console.log(`Generated a precache manifest with ${count} entries, totaling ${size} bytes.`);
  } catch (error) {
    console.error('Error generating precache manifest:', error);
    process.exit(1);
  }
}

build();