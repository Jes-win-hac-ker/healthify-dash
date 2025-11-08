export default {
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{js,css,html,svg,png,ico,json}',
  ],
  // Don't precache the service worker itself
  globIgnores: [
    'service-worker.js',
  ],
  // Additional files to precache (like manifest.json, offline.html)
  additionalManifestEntries: [
    { url: '/manifest.json', revision: null },
    { url: '/offline.html', revision: null },
  ],
};