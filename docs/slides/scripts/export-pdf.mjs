import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const usage = 'Usage: node docs/slides/scripts/export-pdf.mjs INPUT.html OUTPUT.pdf';
const [inputArg, outputArg, ...extra] = process.argv.slice(2);

if (inputArg === '--help' || inputArg === '-h') {
  process.stdout.write(`${usage}\n`);
  process.exit(0);
}
if (!inputArg || !outputArg || extra.length) {
  process.stderr.write(`${usage}\n`);
  process.exit(2);
}

const input = resolve(inputArg);
const output = resolve(outputArg);
if (extname(input) !== '.html' || extname(output) !== '.pdf' || input === output) {
  process.stderr.write('Provide an HTML input and a different PDF output path.\n');
  process.exit(2);
}
await access(input);

const chrome = process.env.CHROME_BIN ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome');
const profile = await mkdtemp(join(tmpdir(), 'quarto-slide-pdf-'));
const url = `${pathToFileURL(input).href}?print-pdf`;
const child = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--disable-background-networking',
  '--no-first-run',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  url,
], { stdio: 'ignore' });

let socket;
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
      break;
    } catch {
      if (child.exitCode !== null) throw new Error('Chrome exited before starting.');
      await delay(100);
    }
  }
  if (!port) throw new Error('Chrome did not open a debugging port.');

  let target;
  for (let attempt = 0; attempt < 100; attempt++) {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    target = targets.find((item) => item.type === 'page' && item.url.startsWith(url));
    if (target) break;
    await delay(100);
  }
  if (!target) throw new Error('Chrome did not open the slide deck.');

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, fail) => {
    socket.addEventListener('open', done, { once: true });
    socket.addEventListener('error', fail, { once: true });
  });

  const pending = new Map();
  let nextId = 1;
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { done, fail } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) fail(new Error(message.error.message));
    else done(message.result);
  });
  const send = (method, params = {}) => new Promise((done, fail) => {
    const id = nextId++;
    pending.set(id, { done, fail });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await send('Runtime.evaluate', {
      expression: 'Boolean(window.Reveal && Reveal.isReady() && document.readyState === "complete")',
      returnByValue: true,
    });
    ready = result.result.value === true;
    if (ready) break;
    await delay(100);
  }
  if (!ready) throw new Error('Reveal.js did not finish loading.');
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });

  let printReady = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const state = await send('Runtime.evaluate', {
      expression: 'document.querySelectorAll(".pdf-page").length >= Reveal.getTotalSlides()',
      returnByValue: true,
    });
    if (state.result.value === true) { printReady = true; break; }
    await delay(100);
  }
  if (!printReady) throw new Error('Print layout did not finish loading.');

  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
  await delay(1000);

  const result = await send('Page.printToPDF', {
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  });
  const pdf = Buffer.from(result.data, 'base64');
  if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error('Chrome did not return a PDF.');
  }
  await writeFile(output, pdf);
  process.stdout.write(`Wrote ${output}\n`);
} finally {
  socket?.close();
  child.kill();
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await rm(profile, { recursive: true, force: true });
      break;
    } catch (error) {
      if (error.code !== 'ENOTEMPTY' || attempt === 9) throw error;
      await delay(100);
    }
  }
}
