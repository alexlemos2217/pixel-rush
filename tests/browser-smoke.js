'use strict';

const assert = require('node:assert/strict');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function getPage() {
  for (let i = 0; i < 30; i++) {
    try {
      const pages = await fetch('http://127.0.0.1:9222/json/list').then(response => response.json());
      const page = pages.find(item => item.type === 'page' && item.url.includes('127.0.0.1:8080'));
      if (page) return page;
    } catch (_) { /* Browser is still starting. */ }
    await sleep(200);
  }
  throw new Error('The Pixel Rush browser page was not available.');
}

async function main() {
  const page = await getPage();
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const messageId = ++id; pending.set(messageId, { resolve, reject }); socket.send(JSON.stringify({ id: messageId, method, params })); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  assert.equal(await evaluate("document.querySelector('#game-status').textContent"), 'LISTO PARA JUGAR');
  await evaluate("document.querySelector('#primary-action').click(); true");
  await sleep(150);
  assert.equal(await evaluate("document.querySelector('#game-status').textContent"), 'EN PARTIDA');
  assert.equal(await evaluate("document.querySelector('#overlay').classList.contains('is-hidden')"), true);
  await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP'})); true");
  assert.equal(await evaluate("document.querySelector('#game-status').textContent"), 'EN PAUSA');
  await evaluate("document.querySelector('#tertiary-action').click(); true");
  assert.equal(await evaluate("document.querySelector('#game-status').textContent"), 'LISTO PARA JUGAR');
  await evaluate("document.querySelector('#tertiary-action').click(); true");
  assert.equal(await evaluate("document.querySelector('#game-status').textContent"), 'PROGRESO LOCAL');
  assert.equal(await evaluate("document.querySelectorAll('.achievement').length"), 5);
  await evaluate("document.querySelector('#primary-action').click(); document.querySelector('#effects-control').click(); true");
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('alexlemos_pixel_rush_v2')).reducedFx"), true);
  socket.close();
  console.log('Pixel Rush browser smoke test passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
