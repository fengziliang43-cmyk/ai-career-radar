import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  copyFile,
} from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import worker from '../dist/server/index.js';
const target = resolve(process.argv[2] ?? 'work/server-release');
await mkdir(target, { recursive: true });
if ((await readdir(target)).length)
  throw Error('Release directory must be empty');
const web = join(target, 'public');
await mkdir(web);
async function walk(dir) {
  const paths = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) paths.push(...(await walk(p)));
    else if (e.isFile()) paths.push(p);
  }
  return paths;
}
const origin = 'https://quant.liang111.top';
const url = origin + '/careers/';
async function render(rsc) {
  const res = await worker.fetch(
    new Request(rsc ? url + '.rsc' : url, {
      headers: rsc
        ? { RSC: '1', accept: 'text/x-component' }
        : { accept: 'text/html' },
    }),
    { ASSETS: { fetch: async () => new Response('', { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  if (!res.ok) throw Error('Failed to render ' + res.status);
  return res.text();
}
const html = await render(false);
if (!html.includes('</html>')) throw Error('Incomplete HTML');
await writeFile(join(web, 'index.html'), html);
await writeFile(join(web, 'index.rsc'), await render(true));
for (const source of await walk(resolve('dist/client'))) {
  const rel = relative(resolve('dist/client'), source).replace(
    /^careers\//,
    '',
  );
  if (!/\.(?:js|css|svg|woff2?)$/.test(rel)) continue;
  const dest = join(web, rel);
  await mkdir(resolve(dest, '..'), { recursive: true });
  await copyFile(source, dest);
}
await writeFile(join(web, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
const inline = [
  ...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const csp = `default-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'; script-src 'self' ${[...new Set(inline)].join(' ')}; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'`;
await writeFile(
  join(target, 'security-headers.conf'),
  `add_header Cache-Control "private, no-store" always;\nadd_header X-Robots-Tag "noindex, nofollow, noarchive" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header Referrer-Policy "no-referrer" always;\nadd_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;\nadd_header Strict-Transport-Security "max-age=31536000" always;\nadd_header Content-Security-Policy "${csp}" always;\n`,
);
// Runtime contains no frontend framework, dependency tree, secrets or private source data.
for (const file of [
  'scripts/radar-server.mjs',
  'scripts/radar-refresh.ts',
  'lib/radar-discovery.ts',
]) {
  const dest = join(target, 'runtime', file);
  await mkdir(resolve(dest, '..'), { recursive: true });
  await copyFile(file, dest);
}
await writeFile(
  join(target, 'runtime/package.json'),
  JSON.stringify({ type: 'module', private: true }) + '\n',
);
for (const [, ref] of html.matchAll(/(?:src|href)="(\/careers\/[^"#?]+)"/g)) {
  const file = ref.slice('/careers/'.length);
  if (!(await readFile(join(web, file)).catch(() => null)))
    throw Error('Missing asset ' + ref);
}
const hashes = [];
for (const file of await walk(target)) {
  const rel = relative(target, file);
  const body = await readFile(file);
  if (
    /\.(?:js|ts|mjs|html|rsc|css|json|conf)$/.test(rel) &&
    /\/Users\/liang|id_ed25519|BEGIN .*PRIVATE KEY/.test(body.toString())
  )
    throw Error('Private content in package ' + rel);
  hashes.push(`${createHash('sha256').update(body).digest('hex')}  ${rel}`);
}
await writeFile(join(target, 'SHA256SUMS'), hashes.sort().join('\n') + '\n');
console.log(
  JSON.stringify({
    target,
    files: hashes.length,
    inlineScriptHashes: new Set(inline).size,
  }),
);
