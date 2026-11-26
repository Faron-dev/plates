// Builds both versions of Plates from the same source:
//   dist/index.html  the single page published as a Claude artifact (saves to the account)
//   pwa/             the installable app (saves on the phone, works offline), ready for any static web host
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const at = f => new URL(f, import.meta.url);
const src = f => readFileSync(at('./src/' + f), 'utf8');
const FILES = ['data.js', 'logic.js', 'app.js', 'views.js', 'actions.js', 'quick.js', 'standalone.js', 'main.js'];
const code = FILES.map(src).join('\n');
const css = src('styles.css');

/* ---- artifact ---- */
{
  const js = 'const STANDALONE = false, BUILD_ID = "";\n' + code;
  if (js.includes('</script')) throw new Error('script would close early');
  const html = src('index.template.html').replace('/*CSS*/', () => css).replace('/*JS*/', () => js);
  mkdirSync(at('./dist/'), { recursive: true });
  writeFileSync(at('./dist/index.html'), html);
  console.log('artifact', html.length, 'bytes');
}

/* ---- installable app ---- */
{
  const out = at('./pwa/');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });   // one flat folder, so it can also be uploaded by hand from a phone
  const FONT_SRC = at('./fonts-src/');   // the six font files and their licences, copied from the @fontsource packages
  const fonts = [
    ['Big Shoulders Display', 'big-shoulders-display', [800, 900]],
    ['Barlow', 'barlow', [400, 500, 600, 700]]
  ];
  let faces = '', fontFiles = [], licences = 'The fonts in this folder are used under the SIL Open Font License 1.1.\n\n';
  for (const [family, slug, weights] of fonts) {
    for (const w of weights) {
      const name = slug + '-latin-' + w + '-normal.woff2';
      copyFileSync(new URL(name, FONT_SRC), at('./pwa/' + name));
      fontFiles.push(name);
      faces += '@font-face{font-family:"' + family + '";font-style:normal;font-weight:' + w + ';font-display:swap;src:url(' + name + ') format("woff2")}\n';
    }
    licences += '==== ' + family + ' ====\n' + readFileSync(new URL(slug + '-LICENSE.txt', FONT_SRC), 'utf8') + '\n\n';
  }
  writeFileSync(at('./pwa/fonts-LICENSE.txt'), licences);
  const icons = ['icon-192.png', 'icon-512.png', 'maskable-192.png', 'maskable-512.png', 'mono-512.png', 'apple-touch-icon.png'];
  const iconBytes = icons.map(n => { copyFileSync(at('./icons-src/' + n), at('./pwa/' + n)); return readFileSync(at('./icons-src/' + n)); });
  const manifest = JSON.stringify({
    name: 'Plates', short_name: 'Plates',
    description: 'Workout tracker. Your log stays on this phone.',
    lang: 'en', dir: 'ltr', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
    background_color: '#F7C600', theme_color: '#F7C600', categories: ['fitness', 'health', 'sports'],
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: 'mono-512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' }
    ]
  }, null, 1);
  const appCss = faces + css, tpl = src('index.pwa.template.html'), swTpl = src('sw.template.js');
  const h = createHash('sha256');
  [code, appCss, tpl, swTpl, manifest, ...iconBytes, ...fontFiles.map(f => readFileSync(at('./pwa/' + f)))].forEach(x => h.update(x));
  const id = h.digest('hex').slice(0, 10);
  const appJs = '"use strict";\nconst STANDALONE = true, BUILD_ID = "' + id + '";\n' + code;
  const assets = ['./', 'app.css?v=' + id, 'app.js?v=' + id, 'manifest.webmanifest', 'icon-192.png', ...fontFiles];
  writeFileSync(at('./pwa/app.css'), appCss);
  writeFileSync(at('./pwa/app.js'), appJs);
  writeFileSync(at('./pwa/manifest.webmanifest'), manifest);
  writeFileSync(at('./pwa/index.html'), tpl.split('__BUILD__').join(id));
  writeFileSync(at('./pwa/sw.js'), swTpl.replace('__BUILD__', id).replace('__ASSETS__', JSON.stringify(assets)));
  writeFileSync(at('./pwa/.nojekyll'), '');
  copyFileSync(at('./pwa-README.md'), at('./pwa/README.md'));
  console.log('app', id, appJs.length + appCss.length, 'bytes of code,', assets.length, 'files cached');
}
